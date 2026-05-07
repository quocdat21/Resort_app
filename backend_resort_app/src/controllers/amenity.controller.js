const pool = require('../config/db');
const fs = require('fs');
const { formatImageUrl } = require('../utils/url.util');

// Get all amenities with room usage count
exports.getAllAmenities = async (req, res) => {
  try {
    const { search = '', page, limit } = req.query;

    // Base query
    let query = `
      SELECT a.*, 
             (SELECT COUNT(*) FROM Room_Amenities ra WHERE ra.amenity_id = a.id) as room_count
      FROM Amenities a
      WHERE a.name LIKE ?
      ORDER BY a.id ASC
    `;
    const queryParams = [`%${search}%`];

    // If page and limit are provided, apply pagination
    if (page && limit) {
      const p = Number(page);
      const l = Number(limit);
      const offset = (p - 1) * l;

      // Count total for pagination
      const [countRows] = await pool.execute(
        'SELECT COUNT(*) as total FROM Amenities WHERE name LIKE ?',
        queryParams
      );
      const total = countRows[0].total;

      query += ' LIMIT ? OFFSET ?';
      queryParams.push(l, offset);

      const [rows] = await pool.execute(query, queryParams);

      const formattedRows = rows.map(row => ({
        ...row,
        icon_url: formatImageUrl(row.icon_url, req)
      }));

      return res.json({
        success: true,
        data: formattedRows,
        pagination: {
          total,
          page: p,
          limit: l,
          totalPages: Math.ceil(total / l)
        }
      });
    }

    // Otherwise return all
    const [rows] = await pool.execute(query, queryParams);
    const formattedRows = rows.map(row => ({
      ...row,
      icon_url: formatImageUrl(row.icon_url, req)
    }));
    res.json({ success: true, data: formattedRows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Get amenity by ID
exports.getAmenityById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get amenity info
    const [rows] = await pool.execute('SELECT * FROM Amenities WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy tiện nghi' });
    
    // Get rooms using this amenity
    const [rooms] = await pool.execute(`
      SELECT r.id, r.name, c.name as category_name, z.name as zone_name
      FROM Rooms r
      JOIN Room_Amenities ra ON r.id = ra.room_id
      JOIN Categories c ON r.category_id = c.id
      JOIN Zones z ON c.zone_id = z.id
      WHERE ra.amenity_id = ?
    `, [id]);

    res.json({ 
      success: true, 
      data: {
        ...rows[0],
        icon_url: formatImageUrl(rows[0].icon_url, req),
        rooms: rooms
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Create amenity
exports.createAmenity = async (req, res) => {
  try {
    const { name } = req.body;
    const iconUrl = req.file ? `/uploads/amenities/${req.file.filename}` : null;

    if (!name) return res.status(400).json({ success: false, message: 'Tên tiện nghi là bắt buộc' });

    const [result] = await pool.execute(
      'INSERT INTO Amenities (name, icon_url) VALUES (?, ?)',
      [name, iconUrl]
    );

    res.status(201).json({ success: true, message: 'Đã thêm tiện nghi thành công', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Update amenity
exports.updateAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const [existing] = await pool.execute('SELECT * FROM Amenities WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy tiện nghi' });

    const updates = [];
    const values = [];

    if (name) { updates.push('name = ?'); values.push(name); }

    if (req.file) {
      // Delete old icon
      if (existing[0].icon_url) {
        const oldPath = `./${existing[0].icon_url.startsWith('/') ? existing[0].icon_url.substring(1) : existing[0].icon_url}`;
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.push('icon_url = ?');
      values.push(`/uploads/amenities/${req.file.filename}`);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.execute(`UPDATE Amenities SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    res.json({ success: true, message: 'Cập nhật tiện nghi thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Delete amenity
exports.deleteAmenity = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute('SELECT * FROM Amenities WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy tiện nghi' });

    // Delete icon
    if (existing[0].icon_url) {
      const p = `./${existing[0].icon_url.startsWith('/') ? existing[0].icon_url.substring(1) : existing[0].icon_url}`;
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }

    await pool.execute('DELETE FROM Amenities WHERE id = ?', [id]);
    res.json({ success: true, message: 'Đã xóa tiện nghi thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
