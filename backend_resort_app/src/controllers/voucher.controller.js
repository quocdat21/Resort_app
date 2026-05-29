const pool = require('../config/db');

const voucherController = {
  // Get all vouchers with pagination and filters
  getAllVouchers: async (req, res) => {
    try {
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit, 10) || 6, 1);
      const offset = (page - 1) * limit;
      const { status, searchTerm } = req.query;

      let query = `
        SELECT v.*, 
        (SELECT COUNT(*) FROM Bookings b WHERE b.voucher_id = v.id AND b.status = 'Confirmed') as used_count
        FROM Vouchers v 
        WHERE 1=1
      `;
      const values = [];

      if (status && status !== 'all') {
        query += " AND status = ?";
        values.push(status);
      }

      if (searchTerm) {
        query += " AND code LIKE ?";
        values.push(`%${searchTerm}%`);
      }

      // Count total for pagination
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM Vouchers v 
        WHERE 1=1
        ${status && status !== 'all' ? "AND status = ?" : ""}
        ${searchTerm ? "AND code LIKE ?" : ""}
      `;
      const countValues = [];
      if (status && status !== 'all') countValues.push(status);
      if (searchTerm) countValues.push(`%${searchTerm}%`);

      const [countResult] = await pool.execute(countQuery, countValues);
      const total = countResult[0].total;

      // Add ordering and pagination
      // Không dùng LIMIT ? OFFSET ? với một số MySQL managed DB vì mysql2 execute
      // có thể lỗi ER_WRONG_ARGUMENTS ở mysqld_stmt_execute.
      query += ` ORDER BY created_at ASC LIMIT ${limit} OFFSET ${offset}`;

      const [vouchers] = await pool.execute(query, values);

      res.json({
        success: true,
        data: vouchers,
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          limit
        }
      });
    } catch (error) {
      console.error('Error in getAllVouchers:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get single voucher by ID
  getVoucherById: async (req, res) => {
    try {
      const { id } = req.params;
      const [vouchers] = await pool.execute(
        `SELECT v.*, 
         (SELECT COUNT(*) FROM Bookings b WHERE b.voucher_id = v.id AND b.status = 'Confirmed') as used_count
         FROM Vouchers v 
         WHERE v.id = ?`, 
        [id]
      );

      if (vouchers.length === 0) {
        return res.status(404).json({ success: false, message: 'Voucher not found' });
      }

      res.json({ success: true, data: vouchers[0] });
    } catch (error) {
      console.error('Error in getVoucherById:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Create new voucher
  createVoucher: async (req, res) => {
    try {
      const {
        code,
        discount_type,
        discount_value,
        max_discount,
        min_order_value,
        usage_limit,
        start_date,
        end_date,
        status
      } = req.body;

      // Check if code already exists
      const [existing] = await pool.execute("SELECT id FROM Vouchers WHERE code = ?", [code]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Mã voucher này đã tồn tại' });
      }

      const query = `
        INSERT INTO Vouchers (
          code, discount_type, discount_value, max_discount, 
          min_order_value, usage_limit, start_date, end_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        code,
        discount_type,
        discount_value,
        max_discount || null,
        min_order_value || 0,
        usage_limit || null,
        start_date,
        end_date,
        status || 'active'
      ];

      const [result] = await pool.execute(query, values);

      res.status(201).json({
        success: true,
        message: 'Voucher created successfully',
        data: { id: result.insertId }
      });
    } catch (error) {
      console.error('Error in createVoucher:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Update voucher
  updateVoucher: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        code,
        discount_type,
        discount_value,
        max_discount,
        min_order_value,
        usage_limit,
        start_date,
        end_date,
        status
      } = req.body;

      // Check if code exists for other vouchers
      const [existing] = await pool.execute("SELECT id FROM Vouchers WHERE code = ? AND id != ?", [code, id]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Mã voucher này đã được sử dụng' });
      }

      const query = `
        UPDATE Vouchers SET 
          code = ?, discount_type = ?, discount_value = ?, max_discount = ?, 
          min_order_value = ?, usage_limit = ?, start_date = ?, end_date = ?, status = ?
        WHERE id = ?
      `;

      const values = [
        code,
        discount_type,
        discount_value,
        max_discount || null,
        min_order_value || 0,
        usage_limit || null,
        start_date,
        end_date,
        status,
        id
      ];

      const [result] = await pool.execute(query, values);

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Voucher not found' });
      }

      res.json({ success: true, message: 'Voucher updated successfully' });
    } catch (error) {
      console.error('Error in updateVoucher:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Delete voucher
  deleteVoucher: async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await pool.execute("DELETE FROM Vouchers WHERE id = ?", [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Voucher not found' });
      }

      res.json({ success: true, message: 'Voucher deleted successfully' });
    } catch (error) {
      console.error('Error in deleteVoucher:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Validate voucher code
  validateVoucher: async (req, res) => {
    try {
      const { code, orderValue, userId } = req.body;
      if (!code) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập mã giảm giá' });
      }

      const [vouchers] = await pool.execute(
        `SELECT v.*, 
         (SELECT COUNT(*) FROM Bookings b WHERE b.voucher_id = v.id AND b.status = 'Confirmed') as used_count
         FROM Vouchers v 
         WHERE v.code = ? AND v.status = 'active'`,
        [code]
      );

      if (vouchers.length === 0) {
        return res.status(404).json({ success: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn' });
      }

      const voucher = vouchers[0];

      // Check if user has already used this voucher
      if (userId) {
        const [used] = await pool.execute(
          "SELECT id FROM User_Vouchers WHERE user_id = ? AND voucher_id = ?",
          [userId, voucher.id]
        );
        if (used.length > 0) {
          return res.status(400).json({ success: false, message: 'Bạn đã sử dụng mã giảm giá này rồi' });
        }
      }

      const now = new Date();

      // Check dates
      if (voucher.start_date && new Date(voucher.start_date) > now) {
        return res.status(400).json({ success: false, message: 'Mã giảm giá chưa đến thời gian sử dụng' });
      }
      if (voucher.end_date && new Date(voucher.end_date) < now) {
        return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết hạn' });
      }

      // Check usage limit
      if (voucher.usage_limit !== null && voucher.used_count >= voucher.usage_limit) {
        return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết lượt sử dụng' });
      }

      // Check min order value
      if (orderValue && orderValue < voucher.min_order_value) {
        return res.status(400).json({
          success: false,
          message: `Mã này chỉ áp dụng cho đơn hàng từ ${new Intl.NumberFormat('vi-VN').format(voucher.min_order_value)} VND trở lên`
        });
      }

      res.json({
        success: true,
        message: 'Áp dụng mã giảm giá thành công',
        data: voucher
      });
    } catch (error) {
      console.error('Error in validateVoucher:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi kiểm tra mã' });
    }
  }
};

module.exports = voucherController;
