const pool = require('../config/db');

// Get all zones with category and room counts
exports.getAllZones = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 6 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT z.*, 
             (SELECT COUNT(*) FROM Categories c WHERE c.zone_id = z.id) as category_count,
             (SELECT COUNT(*) FROM Room_Numbers rn 
              JOIN Rooms r ON rn.room_id = r.id 
              JOIN Categories c ON r.category_id = c.id 
              WHERE c.zone_id = z.id) as room_count
      FROM Zones z
      WHERE 1=1
    `;

    const values = [];
    if (search) {
      query += ` AND z.name LIKE ?`;
      values.push(`%${search}%`);
    }

    // Get total count for pagination
    const [totalRows] = await pool.query(`SELECT COUNT(*) as total FROM (${query}) as t`, values);
    const total = totalRows[0].total;

    query += ` ORDER BY z.id ASC LIMIT ? OFFSET ?`;
    values.push(Number(limit), Number(offset));

    const [zones] = await pool.query(query, values);

    const formattedZones = zones.map(zone => ({
      id: zone.id,
      name: zone.name,
      categoryCount: zone.category_count,
      roomCount: zone.room_count,
      createdAt: zone.created_at,
      updatedAt: zone.updated_at
    }));

    res.status(200).json({
      success: true,
      data: formattedZones,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Error in getAllZones:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách khu vực'
    });
  }
};

// Get single zone
exports.getZoneById = async (req, res) => {
  try {
    const { id } = req.params;
    const [zones] = await pool.execute('SELECT * FROM Zones WHERE id = ?', [id]);

    if (zones.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khu vực' });
    }

    res.status(200).json({
      success: true,
      data: zones[0]
    });
  } catch (error) {
    console.error('Error in getZoneById:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin khu vực' });
  }
};

// Create new zone
exports.createZone = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Tên khu vực là bắt buộc' });
    }

    // Check if zone name already exists
    const [existing] = await pool.execute('SELECT id FROM Zones WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Tên khu vực này đã tồn tại' });
    }

    const [result] = await pool.execute(
      'INSERT INTO Zones (name) VALUES (?)',
      [name]
    );

    res.status(201).json({
      success: true,
      message: 'Khu vực đã được tạo thành công',
      data: { id: result.insertId, name }
    });
  } catch (error) {
    console.error('Error in createZone:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo khu vực' });
  }
};

// Update zone
exports.updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Tên khu vực là bắt buộc' });
    }

    // Check if another zone with the same name exists
    const [existingName] = await pool.execute('SELECT id FROM Zones WHERE name = ? AND id != ?', [name, id]);
    if (existingName.length > 0) {
      return res.status(400).json({ success: false, message: 'Tên khu vực này đã tồn tại' });
    }

    const [result] = await pool.execute(
      'UPDATE Zones SET name = ? WHERE id = ?',
      [name, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khu vực để cập nhật' });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật khu vực thành công',
      data: { id: Number(id), name }
    });
  } catch (error) {
    console.error('Error in updateZone:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật khu vực' });
  }
};

// Delete zone
exports.deleteZone = async (req, res) => {
  try {
    const { id } = req.params;

    // Check for categories linked to this zone
    const [categories] = await pool.execute('SELECT id FROM Categories WHERE zone_id = ?', [id]);
    if (categories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa khu vực đang chứa các loại phòng. Vui lòng di chuyển hoặc xóa các loại phòng trước.'
      });
    }

    const [result] = await pool.execute('DELETE FROM Zones WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khu vực để xóa' });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa khu vực thành công'
    });
  } catch (error) {
    console.error('Error in deleteZone:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa khu vực' });
  }
};
