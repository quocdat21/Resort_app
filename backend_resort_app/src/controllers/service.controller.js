const pool = require('../config/db');
const fs = require('fs');

const serviceController = {
  // Get all services with pagination and filters
  getAllServices: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 6;
      const offset = (page - 1) * limit;
      const { type, excludeType, searchTerm } = req.query;

      let query = `
        SELECT s.* FROM Services s WHERE 1=1
      `;
      const values = [];

      if (type) {
        query += " AND s.type = ?";
        values.push(type);
      }
      if (excludeType) {
        query += " AND s.type != ?";
        values.push(excludeType);
      }
      if (searchTerm) {
        query += " AND s.name LIKE ?";
        values.push(`%${searchTerm}%`);
      }

      query += " ORDER BY s.created_at ASC LIMIT ? OFFSET ?";
      values.push(limit, offset);

      const [services] = await pool.execute(query, values);

      // Fetch prices and images for these services and map them
      if (services.length > 0) {
        const serviceIds = services.map(s => s.id);
        const [prices] = await pool.query(
          `SELECT * FROM ServicePrices WHERE service_id IN (${serviceIds.join(',')})`
        );
        const [images] = await pool.query(
          `SELECT id, service_id, image_url FROM Service_Images WHERE service_id IN (${serviceIds.join(',')})`
        );

        services.forEach(s => {
          s.prices = prices.filter(p => p.service_id === s.id);
          s.secondary_images = images.filter(img => img.service_id === s.id);
        });
      }

      // Get total count
      let countQuery = "SELECT COUNT(*) as total FROM Services WHERE 1=1";
      const countValues = [];
      if (type) { countQuery += " AND type = ?"; countValues.push(type); }
      if (excludeType) { countQuery += " AND type != ?"; countValues.push(excludeType); }
      if (searchTerm) { countQuery += " AND name LIKE ?"; countValues.push(`%${searchTerm}%`); }

      const [countResult] = await pool.execute(countQuery, countValues);
      const total = countResult[0].total;

      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const formattedServices = services.map(s => {
        return {
          ...s,
          image_url: s.image_url ? (s.image_url.startsWith('http') ? s.image_url : `${baseUrl}${s.image_url}`) : null,
          secondary_images: s.secondary_images ? s.secondary_images.map(img => ({
            ...img,
            image_url: img.image_url.startsWith('http') ? img.image_url : `${baseUrl}${img.image_url}`
          })) : []
        };
      });

      res.json({
        success: true,
        data: formattedServices,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error in getAllServices:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Get service by ID with prices and images
  getServiceById: async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute("SELECT * FROM Services WHERE id = ?", [id]);

      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ' });
      }

      const service = rows[0];

      // Get prices
      const [prices] = await pool.execute("SELECT * FROM ServicePrices WHERE service_id = ?", [id]);
      service.prices = prices;

      // Get secondary images
      const [images] = await pool.execute("SELECT id, image_url FROM Service_Images WHERE service_id = ?", [id]);
      service.secondary_images = images;

      res.json({ success: true, data: service });
    } catch (error) {
      console.error('Error in getServiceById:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Create new service
  createService: async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { name, type, capacity, description, status, prices } = req.body;
      const mainImageUrl = req.files && req.files.main_image ? `/uploads/services/${req.files.main_image[0].filename}` : null;

      const [result] = await connection.execute(
        "INSERT INTO Services (name, type, capacity, description, status, image_url) VALUES (?, ?, ?, ?, ?, ?)",
        [name, type, capacity || null, description || null, status || 'active', mainImageUrl]
      );

      const serviceId = result.insertId;

      // Add prices
      if (prices) {
        const priceList = JSON.parse(prices);
        for (const p of priceList) {
          await connection.execute(
            "INSERT INTO ServicePrices (service_id, price_type, price, unit, description) VALUES (?, ?, ?, ?, ?)",
            [serviceId, p.price_type, p.price, p.unit || null, p.description || null]
          );
        }
      }

      // Add secondary images
      if (req.files && req.files.secondary_images) {
        for (const file of req.files.secondary_images) {
          await connection.execute(
            "INSERT INTO Service_Images (service_id, image_url) VALUES (?, ?)",
            [serviceId, `/uploads/services/${file.filename}`]
          );
        }
      }

      await connection.commit();
      res.status(201).json({ success: true, message: 'Dịch vụ đã được tạo thành công', serviceId });
    } catch (error) {
      await connection.rollback();
      console.error('Error in createService:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi tạo dịch vụ' });
    } finally {
      connection.release();
    }
  },

  // Update service
  updateService: async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { id } = req.params;
      const { name, type, capacity, description, status, prices } = req.body;

      // Check existence
      const [existing] = await connection.execute("SELECT image_url FROM Services WHERE id = ?", [id]);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Dịch vụ không tồn tại' });
      }

      let mainImageUrl = existing[0].image_url;
      if (req.files && req.files.main_image) {
        // Delete old main image
        if (mainImageUrl) {
          const oldPath = `./${mainImageUrl.startsWith('/') ? mainImageUrl.substring(1) : mainImageUrl}`;
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        mainImageUrl = `/uploads/services/${req.files.main_image[0].filename}`;
      }

      await connection.execute(
        "UPDATE Services SET name = ?, type = ?, capacity = ?, description = ?, status = ?, image_url = ? WHERE id = ?",
        [name, type, capacity || null, description || null, status, mainImageUrl, id]
      );

      // Update prices: Delete old and insert new (simpler than update)
      if (prices) {
        await connection.execute("DELETE FROM ServicePrices WHERE service_id = ?", [id]);
        const priceList = JSON.parse(prices);
        for (const p of priceList) {
          await connection.execute(
            "INSERT INTO ServicePrices (service_id, price_type, price, unit, description) VALUES (?, ?, ?, ?, ?)",
            [id, p.price_type, p.price, p.unit || null, p.description || null]
          );
        }
      }

      // Secondary images sync
      const { existing_images } = req.body;
      let imagesToKeep = [];
      if (existing_images) {
        try { imagesToKeep = JSON.parse(existing_images); } catch (e) { }
      }

      const [currentImages] = await connection.execute('SELECT * FROM Service_Images WHERE service_id = ?', [id]);
      
      // Delete images not in imagesToKeep
      for (const img of currentImages) {
        if (!imagesToKeep.includes(img.image_url)) {
          // Delete file
          const path = `./${img.image_url.startsWith('/') ? img.image_url.substring(1) : img.image_url}`;
          if (fs.existsSync(path)) fs.unlinkSync(path);
          // Delete DB record
          await connection.execute('DELETE FROM Service_Images WHERE id = ?', [img.id]);
        }
      }

      // Add new images
      if (req.files && req.files.secondary_images) {
        for (const file of req.files.secondary_images) {
          await connection.execute(
            "INSERT INTO Service_Images (service_id, image_url) VALUES (?, ?)",
            [id, `/uploads/services/${file.filename}`]
          );
        }
      }

      await connection.commit();
      res.json({ success: true, message: 'Cập nhật dịch vụ thành công' });
    } catch (error) {
      await connection.rollback();
      console.error('Error in updateService:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật dịch vụ' });
    } finally {
      connection.release();
    }
  },

  // Delete service
  deleteService: async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { id } = req.params;

      // Get all images to delete files
      const [mainImg] = await connection.execute("SELECT image_url FROM Services WHERE id = ?", [id]);
      const [secondaryImgs] = await connection.execute("SELECT image_url FROM Service_Images WHERE service_id = ?", [id]);

      // Delete service record (cascade will handle Prices and Images in DB)
      const [result] = await connection.execute("DELETE FROM Services WHERE id = ?", [id]);

      if (result.affectedRows > 0) {
        // Delete files
        if (mainImg[0]?.image_url) {
          const path = `./${mainImg[0].image_url.startsWith('/') ? mainImg[0].image_url.substring(1) : mainImg[0].image_url}`;
          if (fs.existsSync(path)) fs.unlinkSync(path);
        }
        for (const img of secondaryImgs) {
          const path = `./${img.image_url.startsWith('/') ? img.image_url.substring(1) : img.image_url}`;
          if (fs.existsSync(path)) fs.unlinkSync(path);
        }
      }

      await connection.commit();
      res.json({ success: true, message: 'Đã xóa dịch vụ thành công' });
    } catch (error) {
      await connection.rollback();
      console.error('Error in deleteService:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi xóa dịch vụ' });
    } finally {
      connection.release();
    }
  }
};

module.exports = serviceController;
