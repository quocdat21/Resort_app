const pool = require('../config/db');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

exports.getAllUsers = async (req, res) => {
  try {
    const {
      search = '',
      role = '',
      sort_by = 'created_at',
      order = 'desc',
      page = 1,
      limit = 8
    } = req.query;

    // Validate sort để tránh SQL Injection
    const validSortFields = ['id', 'full_name', 'created_at', 'loyalty_points', 'total_stays'];
    const validOrder = ['asc', 'desc'];

    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortOrder = validOrder.includes(order.toLowerCase()) ? order.toUpperCase() : 'DESC';

    let query = `
      SELECT id, full_name, email, phone_number, role, is_verified, 
             date_of_birth, gender, address, avatar_url, 
             loyalty_points, total_stays, status, created_at, updated_at 
      FROM Users 
      WHERE 1=1
    `;

    const values = [];

    // Search
    if (search) {
      query += ` AND (full_name LIKE ? OR email LIKE ?)`;
      values.push(`%${search}%`, `%${search}%`);
    }

    // Filter role
    if (role && role !== 'all') {
      query += ` AND role = ?`;
      values.push(role);
    }

    // Pagination
    const offset = (page - 1) * limit;

    // Sort + limit
    query += ` ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    values.push(Number(limit), Number(offset));

    const [users] = await pool.query(query, values);

    // Count total (cho pagination)
    let countQuery = `SELECT COUNT(*) as total FROM Users WHERE 1=1`;
    const countValues = [];

    if (search) {
      countQuery += ` AND (full_name LIKE ? OR email LIKE ?)`;
      countValues.push(`%${search}%`, `%${search}%`);
    }

    if (role && role !== 'all') {
      countQuery += ` AND role = ?`;
      countValues.push(role);
    }

    const [[{ total }]] = await pool.query(countQuery, countValues);

    // Map data
    const formattedUsers = users.map(user => ({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone_number || '',
      role: user.role,
      verified: Boolean(user.is_verified),
      dob: user.date_of_birth
        ? new Date(user.date_of_birth).toISOString().split('T')[0]
        : '',
      gender: user.gender || 'Other',
      address: user.address || '',
      loyaltyPoints: user.loyalty_points,
      totalStays: user.total_stays,
      status: user.status,
      createdAt: user.created_at
        ? new Date(user.created_at).toISOString().replace('T', ' ').substring(0, 19)
        : '',
      updatedAt: user.updated_at
        ? new Date(user.updated_at).toISOString().replace('T', ' ').substring(0, 19)
        : '',
      avatar: user.avatar_url 
        ? (user.avatar_url.startsWith('http') ? user.avatar_url : `${process.env.BASE_URL || 'http://localhost:3000'}${user.avatar_url}`)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random`
    }));

    res.status(200).json({
      success: true,
      data: formattedUsers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching users'
    });
  }
};

// Create new user (Admin)
exports.createUser = async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      phoneNumber, 
      password, 
      role, 
      dateOfBirth, 
      gender, 
      address, 
      status 
    } = req.body;

    // Check if email exists
    const [existing] = await pool.execute('SELECT id FROM Users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    let avatar_url = null;
    if (req.file) {
      avatar_url = `/uploads/users/${req.file.filename}`;
    }

    const [result] = await pool.execute(
      `INSERT INTO Users (
        full_name, email, phone_number, password, role, 
        date_of_birth, gender, address, status, avatar_url, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        fullName, 
        email, 
        phoneNumber || null, 
        hashedPassword, 
        role || 'customer', 
        dateOfBirth || null, 
        gender || 'Other', 
        address || null, 
        status || 'active',
        avatar_url
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Người dùng đã được tạo thành công',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo người dùng' });
  }
};

// Update user (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      fullName, 
      email, 
      phone, 
      password, 
      role, 
      dob, 
      gender, 
      address, 
      status,
      loyaltyPoints,
      totalStays,
      verified
    } = req.body;

    // Check if user exists
    const [user] = await pool.execute('SELECT * FROM Users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
    }

    const updates = [];
    const values = [];

    if (fullName !== undefined) { updates.push('full_name = ?'); values.push(fullName); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (phone !== undefined) { updates.push('phone_number = ?'); values.push(phone); }
    if (role !== undefined) { updates.push('role = ?'); values.push(role); }
    if (dob !== undefined) { updates.push('date_of_birth = ?'); values.push(dob || null); }
    if (gender !== undefined) { updates.push('gender = ?'); values.push(gender); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (loyaltyPoints !== undefined) { updates.push('loyalty_points = ?'); values.push(loyaltyPoints); }
    if (totalStays !== undefined) { updates.push('total_stays = ?'); values.push(totalStays); }
    if (verified !== undefined) { updates.push('is_verified = ?'); values.push(verified ? 1 : 0); }

    if (req.file) {
      updates.push('avatar_url = ?');
      values.push(`/uploads/users/${req.file.filename}`);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.execute(
        `UPDATE Users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Fetch updated user to return
    const [updatedUsers] = await pool.execute(
      `SELECT id, full_name, email, phone_number, role, 
              is_verified, date_of_birth, gender, address, avatar_url, 
              loyalty_points, total_stays, status, created_at, updated_at 
       FROM Users WHERE id = ?`,
      [id]
    );

    // Format user (same as getAllUsers logic)
    const u = updatedUsers[0];
    const formattedUser = {
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      phone: u.phone_number || '',
      role: u.role,
      verified: Boolean(u.is_verified),
      dob: u.date_of_birth ? new Date(u.date_of_birth).toISOString().split('T')[0] : '',
      gender: u.gender || 'Other',
      address: u.address || '',
      loyaltyPoints: u.loyalty_points,
      totalStays: u.total_stays,
      status: u.status,
      avatar: u.avatar_url 
        ? (u.avatar_url.startsWith('http') ? u.avatar_url : `${process.env.BASE_URL || 'http://localhost:3000'}${u.avatar_url}`)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name)}&background=random`
    };

    res.status(200).json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      data: formattedUser
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật người dùng' });
  }
};
