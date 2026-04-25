const pool = require('../config/db');

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
      avatar:
        user.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random`
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
