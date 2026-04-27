const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// Get all categories with zone name and room count
exports.getAllCategories = async (req, res) => {
  try {
    const { search = '', zoneId = '', page = 1, limit = 6 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT c.*, z.name as zone_name,
             (SELECT COUNT(*) FROM Rooms r WHERE r.category_id = c.id) as room_count
      FROM Categories c
      LEFT JOIN Zones z ON c.zone_id = z.id
      WHERE 1=1
    `;

    const values = [];
    if (search) {
      query += ` AND c.name LIKE ?`;
      values.push(`%${search}%`);
    }

    if (zoneId) {
      query += ` AND c.zone_id = ?`;
      values.push(zoneId);
    }

    // Get total count for pagination
    const [totalRows] = await pool.query(`SELECT COUNT(*) as total FROM (${query}) as t`, values);
    const total = totalRows[0].total;

    query += ` ORDER BY c.id ASC LIMIT ? OFFSET ?`;
    values.push(Number(limit), Number(offset));

    const [categories] = await pool.query(query, values);

    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      zoneId: cat.zone_id,
      zoneName: cat.zone_name || 'Không có khu vực',
      roomCount: cat.room_count,
      createdAt: cat.created_at,
      updatedAt: cat.updated_at,
      iconUrl: cat.icon_url
        ? (cat.icon_url.startsWith('http') ? cat.icon_url : `${process.env.BASE_URL || 'http://localhost:3000'}${cat.icon_url}`)
        : null
    }));

    res.status(200).json({
      success: true,
      data: formattedCategories,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Error in getAllCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách loại phòng'
    });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const { name, zoneId } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Tên loại phòng là bắt buộc' });
    }

    // Check if category name already exists in the same zone
    const [existing] = await pool.execute(
      'SELECT id FROM Categories WHERE name = ? AND (zone_id = ? OR (zone_id IS NULL AND ? IS NULL))', 
      [name, zoneId || null, zoneId || null]
    );

    if (existing.length > 0) {
      // Delete uploaded file if check fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Loại phòng này đã tồn tại trong khu vực được chọn' 
      });
    }

    let icon_url = null;
    if (req.file) {
      icon_url = `/uploads/categories/${req.file.filename}`;
    }

    const [result] = await pool.execute(
      'INSERT INTO Categories (name, zone_id, icon_url) VALUES (?, ?, ?)',
      [name, zoneId || null, icon_url]
    );

    res.status(201).json({
      success: true,
      message: 'Loại phòng đã được tạo thành công',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error in createCategory:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo loại phòng' });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, zoneId } = req.body;

    // Check if exists
    const [existing] = await pool.execute('SELECT * FROM Categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Loại phòng không tồn tại' });
    }

    const updates = [];
    const values = [];

    if (name !== undefined || zoneId !== undefined) {
      const finalName = name !== undefined ? name : existing[0].name;
      const finalZoneId = zoneId !== undefined ? (zoneId || null) : existing[0].zone_id;

      // Check if another category with the same name and zone exists
      const [duplicate] = await pool.execute(
        'SELECT id FROM Categories WHERE name = ? AND (zone_id = ? OR (zone_id IS NULL AND ? IS NULL)) AND id != ?',
        [finalName, finalZoneId, finalZoneId, id]
      );

      if (duplicate.length > 0) {
        // Delete uploaded file if check fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
          success: false, 
          message: 'Loại phòng này đã tồn tại trong khu vực được chọn' 
        });
      }

      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }
      if (zoneId !== undefined) {
        updates.push('zone_id = ?');
        values.push(zoneId || null);
      }
    }

    if (req.file && req.file.filename) {
      // Delete old icon if it exists
      if (existing[0].icon_url) {
        const oldPath = `./${existing[0].icon_url.startsWith('/') ? existing[0].icon_url.substring(1) : existing[0].icon_url}`;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updates.push('icon_url = ?');
      values.push(`/uploads/categories/${req.file.filename}`);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.execute(
        `UPDATE Categories SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật loại phòng thành công'
    });
  } catch (error) {
    console.error('Error in updateCategory:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật loại phòng' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check for rooms linked to this category
    const [rooms] = await pool.execute('SELECT id FROM Rooms WHERE category_id = ?', [id]);
    if (rooms.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa loại phòng đang có phòng thuộc danh mục này. Vui lòng di chuyển hoặc xóa các phòng trước.'
      });
    }

    const [result] = await pool.execute('DELETE FROM Categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy loại phòng để xóa' });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa loại phòng thành công'
    });
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa loại phòng' });
  }
};
