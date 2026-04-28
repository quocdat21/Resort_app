const pool = require('../config/db');
const fs = require('fs');

const roomController = {
  // --- ROOM TEMPLATES (PARENTS) ---

  // Get all room templates with instance counts
  getAllRooms: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 6;
      const offset = (page - 1) * limit;
      const { categoryId, zoneId, searchTerm } = req.query;

      let query = `
        SELECT r.id, r.name, r.category_id, r.description, r.size_sqm, 
               r.capacity_adults, r.capacity_children, r.base_price, r.created_at, r.updated_at,
               c.name as category_name, c.zone_id, z.name as zone_name,
               (SELECT COUNT(*) FROM Room_Numbers rn WHERE rn.room_id = r.id) as instance_count,
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
        values.push(categoryId);
      }
      if (zoneId) {
        query += " AND c.zone_id = ?";
        values.push(zoneId);
      }
      if (searchTerm) {
        query += " AND r.name LIKE ?";
        values.push(`%${searchTerm}%`);
      }

      query += " ORDER BY r.created_at DESC LIMIT ? OFFSET ?";
      values.push(limit, offset);

      const [rows] = await pool.execute(query, values);

      // Get total count for pagination
      let countQuery = "SELECT COUNT(*) as total FROM Rooms r LEFT JOIN Categories c ON r.category_id = c.id WHERE 1=1";
      const countValues = [];
      if (categoryId) { countQuery += " AND r.category_id = ?"; countValues.push(categoryId); }
      if (zoneId) { countQuery += " AND c.zone_id = ?"; countValues.push(zoneId); }
      if (searchTerm) { countQuery += " AND r.name LIKE ?"; countValues.push(`%${searchTerm}%`); }

      const [countResult] = await pool.execute(countQuery, countValues);
      const total = countResult[0].total;

      res.json({
        success: true,
        data: rows,
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
          main_image_url: mainImage ? mainImage.image_url : null,
          secondary_images: secondaryImages,
          instances: instances,
          amenities: amenities
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
      const { name, categoryId, description, sizeSqm, capacityAdults, capacityChildren, basePrice, amenities } = req.body;

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
        `INSERT INTO Rooms (name, category_id, description, size_sqm, capacity_adults, capacity_children, base_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, categoryId || null, description, sizeSqm || 0, capacityAdults || 2, capacityChildren || 0, basePrice]
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
      const { name, categoryId, description, sizeSqm, capacityAdults, capacityChildren, basePrice, amenities, existingImages } = req.body;

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

      if (updates.length > 0) {
        values.push(id);
        await pool.execute(`UPDATE Rooms SET ${updates.join(', ')} WHERE id = ?`, values);
      }

      // Main image update
      if (req.files && req.files.mainImage) {
        const [oldImages] = await pool.execute('SELECT * FROM Room_Images WHERE room_id = ? AND image_url LIKE "%/pr-%"', [id]);
        if (oldImages.length > 0) {
          const oldPath = `./${oldImages[0].image_url.startsWith('/') ? oldImages[0].image_url.substring(1) : oldImages[0].image_url}`;
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          await pool.execute('DELETE FROM Room_Images WHERE id = ?', [oldImages[0].id]);
        }
        await pool.execute('INSERT INTO Room_Images (room_id, image_url) VALUES (?, ?)', [id, `/uploads/rooms/${req.files.mainImage[0].filename}`]);
      }

      // Secondary images sync
      let imagesToKeep = [];
      if (existingImages) {
        try { imagesToKeep = JSON.parse(existingImages); } catch (e) { }
      }

      const [currentImages] = await pool.execute('SELECT * FROM Room_Images WHERE room_id = ? AND image_url NOT LIKE "%/pr-%"', [id]);
      for (const img of currentImages) {
        if (!imagesToKeep.includes(img.image_url)) {
          const oldPath = `./${img.image_url.startsWith('/') ? img.image_url.substring(1) : img.image_url}`;
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          await pool.execute('DELETE FROM Room_Images WHERE id = ?', [img.id]);
        }
      }

      if (req.files && req.files.secondaryImages) {
        for (const file of req.files.secondaryImages) {
          await pool.execute('INSERT INTO Room_Images (room_id, image_url) VALUES (?, ?)', [id, `/uploads/rooms/${file.filename}`]);
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
        const p = `./${img.image_url.startsWith('/') ? img.image_url.substring(1) : img.image_url}`;
        if (fs.existsSync(p)) fs.unlinkSync(p);
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
      const [duplicate] = await pool.execute('SELECT id FROM Room_Numbers WHERE room_number = ?', [roomNumber]);
      if (duplicate.length > 0) return res.status(400).json({ success: false, message: 'Số phòng này đã tồn tại' });

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
        const [duplicate] = await pool.execute('SELECT id FROM Room_Numbers WHERE room_number = ? AND id != ?', [roomNumber, id]);
        if (duplicate.length > 0) return res.status(400).json({ success: false, message: 'Số phòng này đã tồn tại' });
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
  }
};

module.exports = roomController;
