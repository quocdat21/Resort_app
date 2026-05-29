const pool = require('../config/db');
const fs = require('fs');
const { formatImageUrl, normalizeStoredImagePath, deleteLocalImageIfExists } = require('../utils/url.util');

const roomController = {
  // --- FILTER METADATA (for mobile search page) ---
  getFilterMeta: async (req, res) => {
    try {
      const [zones] = await pool.execute('SELECT id, name FROM Zones ORDER BY id ASC');
      const [categories] = await pool.execute('SELECT id, name FROM Categories ORDER BY id ASC');
      const [maxPriceResult] = await pool.execute('SELECT MAX(base_price) as max_price FROM Rooms');
      const maxPrice = maxPriceResult[0].max_price || 10000000;

      res.json({
        success: true,
        data: {
          zones,
          categories,
          maxPrice: Math.ceil(Number(maxPrice) / 1000000) * 1000000
        }
      });
    } catch (error) {
      console.error('Error in getFilterMeta:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },
  // --- ROOM TEMPLATES (PARENTS) ---

  // Get all room templates with instance counts
  getAllRooms: async (req, res) => {
    try {
      // Auto update status
      await roomController._internalUpdateRoomStatuses();

      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit, 10) || 6, 1);
      const offset = (page - 1) * limit;

      const { categoryId, zoneId, searchTerm } = req.query;

      let query = `
      SELECT r.id, r.name, r.category_id, r.description, r.size_sqm, 
             r.capacity_adults, r.capacity_children, r.base_price, 
             r.auto_checkin, r.auto_checkout, r.created_at, r.updated_at,
             c.name as category_name, c.zone_id, z.name as zone_name,
             (SELECT COUNT(*) FROM Room_Numbers rn WHERE rn.room_id = r.id) as instance_count,
             (SELECT COUNT(*) FROM Room_Numbers rn WHERE rn.room_id = r.id AND rn.status = 'Available') as available_count,
             (SELECT COUNT(*) FROM Room_Amenities ra WHERE ra.room_id = r.id) as amenity_count,
             (SELECT image_url FROM Room_Images ri WHERE ri.room_id = r.id AND ri.image_url LIKE '%/pr-%' LIMIT 1) as main_image_url
      FROM Rooms r
      LEFT JOIN Categories c ON r.category_id = c.id
      LEFT JOIN Zones z ON c.zone_id = z.id
      WHERE 1=1
    `;

      const values = [];

      if (categoryId) {
        query += " AND r.category_id = ?";
        values.push(Number(categoryId));
      }

      if (zoneId) {
        query += " AND c.zone_id = ?";
        values.push(Number(zoneId));
      }

      if (searchTerm) {
        query += " AND r.name LIKE ?";
        values.push(`%${searchTerm}%`);
      }

      // Không dùng LIMIT ? OFFSET ? với Aiven MySQL
      // Vì mysql2 execute có thể lỗi Incorrect arguments to mysqld_stmt_execute
      query += ` ORDER BY r.created_at ASC LIMIT ${limit} OFFSET ${offset}`;

      const [rows] = await pool.execute(query, values);

      // Get total count for pagination
      let countQuery = `
      SELECT COUNT(*) as total 
      FROM Rooms r 
      LEFT JOIN Categories c ON r.category_id = c.id 
      WHERE 1=1
    `;

      const countValues = [];

      if (categoryId) {
        countQuery += " AND r.category_id = ?";
        countValues.push(Number(categoryId));
      }

      if (zoneId) {
        countQuery += " AND c.zone_id = ?";
        countValues.push(Number(zoneId));
      }

      if (searchTerm) {
        countQuery += " AND r.name LIKE ?";
        countValues.push(`%${searchTerm}%`);
      }

      const [countResult] = await pool.execute(countQuery, countValues);
      const total = countResult[0].total;

      res.json({
        success: true,
        data: rows.map(row => ({
          ...row,
          main_image_url: formatImageUrl(row.main_image_url, req)
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Get room template by ID (with secondary images and instances)
  getRoomById: async (req, res) => {
    try {
      // Task 4: Auto update status before returning for admin
      await roomController._internalUpdateRoomStatuses();

      const { id } = req.params;
      const [room] = await pool.execute(`
        SELECT r.*, c.name as category_name, c.zone_id, z.name as zone_name,
              (SELECT COUNT(*) FROM Room_Numbers rn WHERE rn.room_id = r.id) as instance_count
        FROM Rooms r
        LEFT JOIN Categories c ON r.category_id = c.id
        LEFT JOIN Zones z ON c.zone_id = z.id
        WHERE r.id = ?
      `, [id]);

      if (room.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
      }

      const [images] = await pool.execute('SELECT * FROM Room_Images WHERE room_id = ?', [id]);
      const [instances] = await pool.execute('SELECT * FROM Room_Numbers WHERE room_id = ?', [id]);
      const [amenities] = await pool.execute(`
        SELECT a.* FROM Amenities a
        JOIN Room_Amenities ra ON a.id = ra.amenity_id
        WHERE ra.room_id = ?
      `, [id]);

      const mainImage = images.find(img => img.image_url.includes('/pr-')) || images[0] || null;
      const secondaryImages = images.filter(img => img !== mainImage);

      res.json({
        success: true,
        data: {
          ...room[0],
          main_image_url: formatImageUrl(mainImage ? mainImage.image_url : null, req),
          secondary_images: secondaryImages.map(img => ({
            ...img,
            image_url: formatImageUrl(img.image_url, req)
          })),
          instances: instances,
          amenities: amenities.map(a => ({
            ...a,
            icon_url: formatImageUrl(a.icon_url, req)
          }))
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Create room template
  createRoom: async (req, res) => {
    try {
      const { name, categoryId, description, sizeSqm, capacityAdults, capacityChildren, basePrice, amenities, autoCheckin, autoCheckout } = req.body;

      // Duplicate name check
      const [duplicate] = await pool.execute('SELECT id FROM Rooms WHERE name = ?', [name]);
      if (duplicate.length > 0) {
        if (req.files) {
          if (req.files.mainImage) fs.unlinkSync(req.files.mainImage[0].path);
          if (req.files.secondaryImages) req.files.secondaryImages.forEach(f => fs.unlinkSync(f.path));
        }
        return res.status(400).json({ success: false, message: 'Tên phòng này đã tồn tại' });
      }

      const [result] = await pool.execute(
        `INSERT INTO Rooms (name, category_id, description, size_sqm, capacity_adults, capacity_children, base_price, auto_checkin, auto_checkout)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, categoryId || null, description, sizeSqm || 0, capacityAdults || 2, capacityChildren || 0, basePrice, autoCheckin ? 1 : 0, autoCheckout ? 1 : 0]
      );

      const roomId = result.insertId;

      // Handle images
      if (req.files) {
        if (req.files.mainImage) {
          await pool.execute('INSERT INTO Room_Images (room_id, image_url) VALUES (?, ?)', [roomId, `/uploads/rooms/${req.files.mainImage[0].filename}`]);
        }
        if (req.files.secondaryImages) {
          for (const file of req.files.secondaryImages) {
            await pool.execute('INSERT INTO Room_Images (room_id, image_url) VALUES (?, ?)', [roomId, `/uploads/rooms/${file.filename}`]);
          }
        }
      }

      // Handle Amenities
      if (amenities) {
        let amenityIds = [];
        try {
          amenityIds = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
          if (Array.isArray(amenityIds)) {
            for (const amenityId of amenityIds) {
              await pool.execute('INSERT INTO Room_Amenities (room_id, amenity_id) VALUES (?, ?)', [roomId, amenityId]);
            }
          }
        } catch (e) {
          console.error("Error parsing amenities:", e);
        }
      }

      res.status(201).json({ success: true, message: 'Đã thêm phòng template thành công', roomId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Update room template
  updateRoom: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, categoryId, description, sizeSqm, capacityAdults, capacityChildren, basePrice, amenities, existingImages, autoCheckin, autoCheckout } = req.body;

      const [existing] = await pool.execute('SELECT * FROM Rooms WHERE id = ?', [id]);
      if (existing.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });

      const updates = [];
      const values = [];
      if (name !== undefined) { updates.push('name = ?'); values.push(name); }
      if (categoryId !== undefined) { updates.push('category_id = ?'); values.push(categoryId || null); }
      if (description !== undefined) { updates.push('description = ?'); values.push(description); }
      if (sizeSqm !== undefined) { updates.push('size_sqm = ?'); values.push(sizeSqm); }
      if (capacityAdults !== undefined) { updates.push('capacity_adults = ?'); values.push(capacityAdults); }
      if (capacityChildren !== undefined) { updates.push('capacity_children = ?'); values.push(capacityChildren); }
      if (basePrice !== undefined) { updates.push('base_price = ?'); values.push(basePrice); }
      if (autoCheckin !== undefined) { updates.push('auto_checkin = ?'); values.push(autoCheckin ? 1 : 0); }
      if (autoCheckout !== undefined) { updates.push('auto_checkout = ?'); values.push(autoCheckout ? 1 : 0); }

      if (updates.length > 0) {
        values.push(id);
        await pool.execute(`UPDATE Rooms SET ${updates.join(', ')} WHERE id = ?`, values);
      }

      // Main image update
      if (req.files && req.files.mainImage) {
        const [oldImages] = await pool.execute('SELECT * FROM Room_Images WHERE room_id = ? AND image_url LIKE "%/pr-%"', [id]);
        if (oldImages.length > 0) {
          deleteLocalImageIfExists(oldImages[0].image_url);
          await pool.execute('DELETE FROM Room_Images WHERE id = ?', [oldImages[0].id]);
        }
        await pool.execute('INSERT INTO Room_Images (room_id, image_url) VALUES (?, ?)', [id, `/uploads/rooms/${req.files.mainImage[0].filename}`]);
      }

      // Secondary images sync - ONLY if images are provided in request
      if (existingImages !== undefined || (req.files && req.files.secondaryImages)) {
        let imagesToKeep = [];
        if (existingImages) {
          try {
            const parsedImages = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
            imagesToKeep = Array.isArray(parsedImages) ? parsedImages.map(normalizeStoredImagePath) : [];
          } catch (e) { }
        }

        const [currentImages] = await pool.execute('SELECT * FROM Room_Images WHERE room_id = ? AND image_url NOT LIKE "%/pr-%"', [id]);
        for (const img of currentImages) {
          if (!imagesToKeep.includes(img.image_url)) {
            deleteLocalImageIfExists(img.image_url);
            await pool.execute('DELETE FROM Room_Images WHERE id = ?', [img.id]);
          }
        }

        if (req.files && req.files.secondaryImages) {
          for (const file of req.files.secondaryImages) {
            await pool.execute('INSERT INTO Room_Images (room_id, image_url) VALUES (?, ?)', [id, `/uploads/rooms/${file.filename}`]);
          }
        }
      }

      // Amenities sync
      if (amenities !== undefined) {
        let amenityIds = [];
        try {
          amenityIds = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
          if (Array.isArray(amenityIds)) {
            await pool.execute('DELETE FROM Room_Amenities WHERE room_id = ?', [id]);
            for (const amenityId of amenityIds) {
              await pool.execute('INSERT INTO Room_Amenities (room_id, amenity_id) VALUES (?, ?)', [id, amenityId]);
            }
          }
        } catch (e) { }
      }

      res.json({ success: true, message: 'Cập nhật phòng thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Delete room template
  deleteRoom: async (req, res) => {
    try {
      const { id } = req.params;
      const [images] = await pool.execute('SELECT image_url FROM Room_Images WHERE room_id = ?', [id]);
      images.forEach(img => {
        deleteLocalImageIfExists(img.image_url);
      });
      await pool.execute('DELETE FROM Rooms WHERE id = ?', [id]);
      res.json({ success: true, message: 'Đã xóa phòng template thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // --- ROOM INSTANCES (CHILDREN) ---
  getInstances: async (req, res) => {
    try {
      // Auto update status
      await roomController._internalUpdateRoomStatuses();

      const { roomId } = req.params;
      const [rows] = await pool.execute('SELECT * FROM Room_Numbers WHERE room_id = ?', [roomId]);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  createInstance: async (req, res) => {
    try {
      const { roomId, roomNumber, status } = req.body;
      const [duplicate] = await pool.execute('SELECT id FROM Room_Numbers WHERE room_number = ? AND room_id = ?', [roomNumber, roomId]);
      if (duplicate.length > 0) return res.status(400).json({ success: false, message: 'Số phòng này đã tồn tại trong loại phòng này' });

      await pool.execute('INSERT INTO Room_Numbers (room_id, room_number, status) VALUES (?, ?, ?)', [roomId, roomNumber, status || 'Available']);
      res.status(201).json({ success: true, message: 'Đã thêm số phòng thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  updateInstance: async (req, res) => {
    try {
      const { id } = req.params;
      const { roomNumber, status } = req.body;
      const [existing] = await pool.execute('SELECT * FROM Room_Numbers WHERE id = ?', [id]);
      if (existing.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy số phòng' });

      if (roomNumber) {
        const [duplicate] = await pool.execute('SELECT id FROM Room_Numbers WHERE room_number = ? AND room_id = ? AND id != ?', [roomNumber, existing[0].room_id, id]);
        if (duplicate.length > 0) return res.status(400).json({ success: false, message: 'Số phòng này đã tồn tại trong loại phòng này' });
      }

      await pool.execute('UPDATE Room_Numbers SET room_number = ?, status = ? WHERE id = ?', [roomNumber || existing[0].room_number, status || existing[0].status, id]);
      res.json({ success: true, message: 'Cập nhật số phòng thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  deleteInstance: async (req, res) => {
    try {
      const { id } = req.params;
      await pool.execute('DELETE FROM Room_Numbers WHERE id = ?', [id]);
      res.json({ success: true, message: 'Đã xóa số phòng thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // --- MOBILE APP: Search rooms with advanced filters ---
  searchRooms: async (req, res) => {
    try {
      const {
        checkIn,
        checkOut,
        adults = 2,
        children = 0,
        minPrice,
        maxPrice,
        categoryId,
        zoneId,
        searchTerm,
        page = 1,
        limit = 20,
        sortBy = 'base_price',
        sortOrder = 'ASC'
      } = req.query;

      const safePage = Math.max(parseInt(page, 10) || 1, 1);
      const safeLimit = Math.max(parseInt(limit, 10) || 20, 1);
      const safeOffset = (safePage - 1) * safeLimit;

      let query = `
      SELECT r.id, r.name, r.description, r.size_sqm,
             r.capacity_adults, r.capacity_children, r.base_price,
             c.name as category_name, c.zone_id, z.name as zone_name,
             (SELECT image_url FROM Room_Images ri WHERE ri.room_id = r.id LIMIT 1) as main_image_url,
             (SELECT COUNT(*) FROM Room_Numbers rn 
              WHERE rn.room_id = r.id 
              AND rn.status != 'Inactive'
              AND rn.id NOT IN (
                SELECT br.room_number_id 
                FROM Booking_Rooms br 
                JOIN Bookings b ON br.booking_id = b.id 
                WHERE b.status = 'Confirmed' AND b.type = 'room'
                AND (
                  (b.check_in <= ? AND b.check_out > ?) OR
                  (b.check_in < ? AND b.check_out >= ?) OR
                  (? <= b.check_in AND ? >= b.check_out)
                )
              )
             ) as available_count,
             (SELECT AVG(rv.rating) 
              FROM Reviews rv 
              JOIN Booking_Rooms br ON rv.room_number_id = br.room_number_id 
              JOIN Room_Numbers rn2 ON br.room_number_id = rn2.id 
              WHERE rn2.room_id = r.id) as avg_rating,
             (SELECT COUNT(*) 
              FROM Reviews rv 
              JOIN Booking_Rooms br ON rv.room_number_id = br.room_number_id 
              JOIN Room_Numbers rn2 ON br.room_number_id = rn2.id 
              WHERE rn2.room_id = r.id) as review_count
      FROM Rooms r
      LEFT JOIN Categories c ON r.category_id = c.id
      LEFT JOIN Zones z ON c.zone_id = z.id
      WHERE 1=1
    `;

      const values = [];

      // If no dates provided, use today to tomorrow as default for availability check
      const dIn = checkIn || new Date().toISOString().split('T')[0];
      const dOut = checkOut || new Date(new Date().getTime() + 86400000).toISOString().split('T')[0];

      values.push(dIn, dIn, dOut, dOut, dIn, dOut);

      // Filter by capacity
      if (adults) {
        query += " AND r.capacity_adults >= ?";
        values.push(parseInt(adults, 10));
      }

      if (children) {
        query += " AND r.capacity_children >= ?";
        values.push(parseInt(children, 10));
      }

      // Filter by price
      if (minPrice) {
        query += " AND r.base_price >= ?";
        values.push(parseInt(minPrice, 10));
      }

      if (maxPrice) {
        query += " AND r.base_price <= ?";
        values.push(parseInt(maxPrice, 10));
      }

      // Filter by category/zone
      if (categoryId) {
        query += " AND r.category_id = ?";
        values.push(Number(categoryId));
      }

      if (zoneId) {
        query += " AND c.zone_id = ?";
        values.push(Number(zoneId));
      }

      // Search by name or category name
      if (searchTerm) {
        query += " AND (r.name LIKE ? OR c.name LIKE ?)";
        values.push(`%${searchTerm}%`, `%${searchTerm}%`);
      }

      // Filter out rooms with 0 available count
      query += " HAVING available_count > 0";

      // Sorting
      const allowedSorts = ['base_price', 'name', 'capacity_adults', 'created_at'];
      const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'base_price';
      const safeOrder = String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      // Không dùng LIMIT ? OFFSET ? với Aiven MySQL
      query += ` ORDER BY r.${safeSort} ${safeOrder} LIMIT ${safeLimit} OFFSET ${safeOffset}`;

      const [rows] = await pool.execute(query, values);

      // Count total
      let countQuery = `
      SELECT COUNT(*) as total 
      FROM Rooms r
      LEFT JOIN Categories c ON r.category_id = c.id
      WHERE 1=1
    `;

      const countValues = [];

      if (adults) {
        countQuery += " AND r.capacity_adults >= ?";
        countValues.push(parseInt(adults, 10));
      }

      if (children) {
        countQuery += " AND r.capacity_children >= ?";
        countValues.push(parseInt(children, 10));
      }

      if (minPrice) {
        countQuery += " AND r.base_price >= ?";
        countValues.push(parseInt(minPrice, 10));
      }

      if (maxPrice) {
        countQuery += " AND r.base_price <= ?";
        countValues.push(parseInt(maxPrice, 10));
      }

      if (categoryId) {
        countQuery += " AND r.category_id = ?";
        countValues.push(Number(categoryId));
      }

      if (zoneId) {
        countQuery += " AND c.zone_id = ?";
        countValues.push(Number(zoneId));
      }

      if (searchTerm) {
        countQuery += " AND (r.name LIKE ? OR c.name LIKE ?)";
        countValues.push(`%${searchTerm}%`, `%${searchTerm}%`);
      }

      const [countResult] = await pool.execute(countQuery, countValues);
      const total = countResult[0].total;

      // Format image URLs
      const formatted = rows.map(r => ({
        ...r,
        main_image_url: formatImageUrl(r.main_image_url, req),
        avg_rating: r.avg_rating ? parseFloat(r.avg_rating).toFixed(1) : null,
      }));

      res.json({
        success: true,
        data: formatted,
        pagination: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit)
        }
      });
    } catch (error) {
      console.error('Error in searchRooms:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Task 1: API check booked rooms with "Confirmed" status
  getOccupiedRooms: async (req, res) => {
    try {
      const { checkIn, checkOut } = req.query;
      if (!checkIn || !checkOut) {
        return res.status(400).json({ success: false, message: 'Thiếu ngày check-in hoặc check-out' });
      }

      const query = `
        SELECT br.room_number_id
        FROM Booking_Rooms br
        JOIN Bookings b ON br.booking_id = b.id
        WHERE b.status = 'Confirmed'
        AND b.type = 'room'
        AND (
          (b.check_in <= ? AND b.check_out > ?) OR
          (b.check_in < ? AND b.check_out >= ?) OR
          (? <= b.check_in AND ? >= b.check_out)
        )
      `;
      const [rows] = await pool.execute(query, [checkIn, checkIn, checkOut, checkOut, checkIn, checkOut]);

      const occupiedIds = rows.map(r => r.room_number_id);

      res.json({
        success: true,
        data: occupiedIds
      });
    } catch (error) {
      console.error('Error in getOccupiedRooms:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Internal helper to update room statuses without res object
  _internalUpdateRoomStatuses: async (connection) => {
    const conn = connection || pool;
    const now = new Date();

    // Convert to Vietnam time for hour check (if server is UTC)
    // Or just use local hour if server is already set to local time
    const hour = now.getHours();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;

    // If after 14:00, we also consider bookings starting tomorrow as "Booked" for the next slot
    const checkInLimit = hour >= 14 ? 'DATE_ADD(?, INTERVAL 1 DAY)' : '?';

    // 1. Reset 'Booked' rooms to 'Available'
    const resetQuery = `
      UPDATE Room_Numbers rn
      SET rn.status = 'Available'
      WHERE rn.status = 'Booked'
      AND rn.id NOT IN (
        SELECT br.room_number_id
        FROM Booking_Rooms br
        JOIN Bookings b ON br.booking_id = b.id
        WHERE b.status = 'Confirmed'
        AND b.type = 'room'
        AND b.check_in <= ${checkInLimit} AND b.check_out > ?
      )
    `;
    await conn.execute(resetQuery, [currentDate, currentDate]);

    // 2. Mark 'Available' rooms as 'Booked'
    const bookQuery = `
      UPDATE Room_Numbers rn
      SET rn.status = 'Booked'
      WHERE rn.status = 'Available'
      AND rn.id IN (
        SELECT br.room_number_id
        FROM Booking_Rooms br
        JOIN Bookings b ON br.booking_id = b.id
        WHERE b.status = 'Confirmed'
        AND b.type = 'room'
        AND b.check_in <= ${checkInLimit} AND b.check_out > ?
      )
    `;
    await conn.execute(bookQuery, [currentDate, currentDate]);

    // 3. Mark 'Booked' rooms as 'Occupied' (Auto Check-in)
    // Only for rooms with auto_checkin = 1 AND after 14:00
    if (hour >= 14) {
      const autoCIQuery = `
        UPDATE Room_Numbers rn
        JOIN Rooms r ON rn.room_id = r.id
        SET rn.status = 'Occupied'
        WHERE rn.status = 'Booked'
        AND r.auto_checkin = 1
        AND rn.id IN (
          SELECT br.room_number_id
          FROM Booking_Rooms br
          JOIN Bookings b ON br.booking_id = b.id
          WHERE b.status = 'Confirmed'
          AND b.type = 'room'
          AND b.check_in <= ? AND b.check_out > ?
        )
      `;
      await conn.execute(autoCIQuery, [currentDate, currentDate]);
    }

    // 4. Mark 'Occupied' rooms as 'Available' (Auto Check-out)
    // Only for rooms with auto_checkout = 1 AND after 12:00
    if (hour >= 12) {
      const autoCOQuery = `
        UPDATE Room_Numbers rn
        JOIN Rooms r ON rn.room_id = r.id
        SET rn.status = 'Available'
        WHERE rn.status = 'Occupied'
        AND r.auto_checkout = 1
        AND rn.id IN (
          SELECT br.room_number_id
          FROM Booking_Rooms br
          JOIN Bookings b ON br.booking_id = b.id
          WHERE b.status = 'Confirmed'
          AND b.type = 'room'
          AND b.check_out <= ?
        )
      `;
      await conn.execute(autoCOQuery, [currentDate]);
    }
  },

  // Task 2: Update room status based on bookings (Booked is auto, Occupied is manual)
  updateRoomStatuses: async (req, res) => {
    try {
      await roomController._internalUpdateRoomStatuses();
      if (res) {
        res.json({ success: true, message: 'Cập nhật trạng thái phòng thành công' });
      }
    } catch (error) {
      console.error('Error in updateRoomStatuses:', error);
      if (res) res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // --- MOBILE APP: Get room detail with full info ---
  getRoomDetail: async (req, res) => {
    try {
      // Auto update status before returning
      await roomController._internalUpdateRoomStatuses();

      const { id } = req.params;
      const { checkIn, checkOut } = req.query;

      const [room] = await pool.execute(`
        SELECT r.*, c.name as category_name, c.zone_id, z.name as zone_name,
               (SELECT COUNT(*) FROM Room_Numbers rn WHERE rn.room_id = r.id AND rn.status = 'Available') as available_count,
               (SELECT AVG(rv.rating) FROM Reviews rv JOIN Booking_Rooms br ON rv.room_number_id = br.room_number_id JOIN Room_Numbers rn2 ON br.room_number_id = rn2.id WHERE rn2.room_id = r.id) as avg_rating,
               (SELECT COUNT(*) FROM Reviews rv JOIN Booking_Rooms br ON rv.room_number_id = br.room_number_id JOIN Room_Numbers rn2 ON br.room_number_id = rn2.id WHERE rn2.room_id = r.id) as review_count
        FROM Rooms r
        LEFT JOIN Categories c ON r.category_id = c.id
        LEFT JOIN Zones z ON c.zone_id = z.id
        WHERE r.id = ?
      `, [id]);

      if (room.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
      }

      const [images] = await pool.execute('SELECT * FROM Room_Images WHERE room_id = ?', [id]);
      const [amenities] = await pool.execute(`
        SELECT a.* FROM Amenities a
        JOIN Room_Amenities ra ON a.id = ra.amenity_id
        WHERE ra.room_id = ?
      `, [id]);

      // Get all room numbers for this room type (show all except Hidden)
      const [roomNumbers] = await pool.execute(
        "SELECT id, room_number, status FROM Room_Numbers WHERE room_id = ? AND status != 'Hidden' ORDER BY room_number ASC",
        [id]
      );

      // If check-in/out provided, determine availability based on bookings
      if (checkIn && checkOut) {
        // Reset all to Available first (except Maintenance) to handle future searches
        roomNumbers.forEach(rn => {
          if (rn.status !== 'Maintenance') {
            rn.status = 'Available';
          }
        });

        const [occupied] = await pool.execute(`
          SELECT br.room_number_id
          FROM Booking_Rooms br
          JOIN Bookings b ON br.booking_id = b.id
          WHERE b.status = 'Confirmed'
          AND b.type = 'room'
          AND br.room_number_id IN (SELECT id FROM Room_Numbers WHERE room_id = ?)
          AND (
            b.check_in < ? AND b.check_out > ?
          )
        `, [id, checkOut, checkIn]);

        const occupiedIds = occupied.map(o => o.room_number_id);
        roomNumbers.forEach(rn => {
          if (occupiedIds.includes(rn.id)) {
            rn.status = 'Occupied';
          }
        });
      }

      const formattedImages = images.map(img => ({
        ...img,
        image_url: formatImageUrl(img.image_url, req)
      }));

      const mainImage = formattedImages.find(img => img.image_url && img.image_url.includes('/pr-')) || formattedImages[0] || null;
      const secondaryImages = formattedImages.filter(img => img !== mainImage);

      const formattedAmenities = amenities.map(a => ({
        ...a,
        icon_url: formatImageUrl(a.icon_url, req)
      }));

      res.json({
        success: true,
        data: {
          ...room[0],
          avg_rating: room[0].avg_rating ? parseFloat(room[0].avg_rating).toFixed(1) : null,
          main_image_url: mainImage ? mainImage.image_url : null,
          images: formattedImages,
          secondary_images: secondaryImages,
          amenities: formattedAmenities,
          room_numbers: roomNumbers
        }
      });
    } catch (error) {
      console.error('Error in getRoomDetail:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }
};

module.exports = roomController;
