const pool = require('../config/db');
const roomController = require('./room.controller');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

const generateNanoId = () => 'RSBK' + nanoid();

const formatDate = (dateVal) => {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
};

const paymentController = {

  // ================================
  // CREATE BOOKING + PAYMENT
  // ================================
  createBookingAndPayment: async (req, res) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const {
        userId, type,
        checkIn, checkOut,
        adults, children,
        totalAmount, taxAmount, tax_amount, extraFee,
        voucherId, appliedVoucher, discountAmount,
        roomNumberIds, selectedRoomNumberIds, // Support both names
        base_price, // Needed for Booking_Rooms
        selectedServices,
        serviceId, packageInfo,
        serviceDate, date, service, package
      } = req.body;

      const finalTaxAmount = taxAmount || tax_amount || 0;
      const finalAdults = type === 'service' ? 0 : (adults || 0);
      const finalChildren = type === 'service' ? 0 : (children || 0);

      const finalVoucherId = voucherId || appliedVoucher?.id || null;
      const finalRoomNumberIds = roomNumberIds || selectedRoomNumberIds;
      const bookingCode = generateNanoId();

      // Calculate nights for room booking
      let nights = 0;
      if (type === 'room' && checkIn && checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (nights <= 0) nights = 1;
      }

      const [bookingResult] = await conn.execute(
        `INSERT INTO Bookings 
        (booking_code, user_id, type, check_in, check_out, service_booking_date, adults, children, total_amount, tax_amount, extra_fee, voucher_id, discount_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
        [
          bookingCode,
          userId,
          type,
          formatDate(checkIn),
          formatDate(checkOut),
          formatDate(serviceDate || date),
          finalAdults,
          finalChildren,
          totalAmount,
          finalTaxAmount,
          extraFee || 0,
          finalVoucherId,
          discountAmount || 0
        ]
      );

      const bookingId = bookingResult.insertId;

      // ROOM
      if (type === 'room' && finalRoomNumberIds) {
        for (const rnId of finalRoomNumberIds) {
          await conn.execute(
            'INSERT INTO Booking_Rooms (booking_id, room_number_id, price, nights) VALUES (?, ?, ?, ?)',
            [bookingId, rnId, base_price || 0, nights]
          );
        }

        if (Array.isArray(selectedServices)) {
          for (const s of selectedServices) {
            const price = Number(s.price || 0);
            const qty = s.type === 'counter' ? (s.value || 1) : 1;

            await conn.execute(
              `INSERT INTO Booking_Services 
              (booking_id, service_id, price_type, unit, quantity, price, total_price, service_date)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                bookingId,
                s.id,
                s.type || 'unit',
                s.unit || 'unit',
                qty,
                price,
                price * qty,
                formatDate(checkIn)
              ]
            );
          }
        }
      }

      // SERVICE
      if (type === 'service') {
        const sId = service?.id || serviceId;
        const pkgInfo = packageInfo || req.body.package || package;
        const sType = service?.type || '';
        
        console.log('DEBUG: Creating service booking. Service:', service, 'Package Info:', pkgInfo);
        
        const price = Number(pkgInfo?.price || 0);
        const qty = (sType === 'Hall' || sType === 'Event') ? 1 : (adults || 1);
        const unit = (sType === 'Hall' || sType === 'Event') ? '' : (pkgInfo?.unit || 'người');

        await conn.execute(
          `INSERT INTO Booking_Services 
          (booking_id, service_id, price_type, unit, quantity, price, total_price, service_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            bookingId,
            sId,
            pkgInfo?.price_type || 'unit',
            unit,
            qty,
            price,
            price * qty,
            formatDate(serviceDate || date)
          ]
        );
      }

      // PAYMENT
      const [paymentResult] = await conn.execute(
        `INSERT INTO Payments 
        (booking_id, order_code, amount, status, description, payment_method, expired_at)
        VALUES (?, ?, ?, 'pending', ?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))`,
        [
          bookingId,
          bookingCode,
          totalAmount,
          `Thanh toán ${bookingCode}`,
          req.body.paymentMethod || 'BANK_TRANSFER',
        ]
      );

      await conn.commit();

      res.json({
        success: true,
        data: {
          bookingId,
          paymentId: paymentResult.insertId,
          bookingCode,
          orderCode: bookingCode
        }
      });

    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ success: false });
    } finally {
      conn.release();
    }
  },

  // ================================
  // SEPAY WEBHOOK (FIXED)
  // ================================
  sepayWebhook: async (req, res) => {
    try {
      console.log("🔥 WEBHOOK:", req.body);

      const {
        id: transactionId,
        transferAmount,
        content
      } = req.body;

      if (!content) {
        return res.status(200).json({ success: false, message: 'No content' });
      }

      // 1. FIND PAYMENT (Tìm trong nội dung chuyển khoản có chứa mã đơn hàng)
      const [payments] = await pool.execute(
        'SELECT p.*, b.user_id FROM Payments p JOIN Bookings b ON p.booking_id = b.id WHERE ? LIKE CONCAT("%", p.order_code, "%") AND p.status = "pending" LIMIT 1',
        [content]
      );

      if (!payments.length) {
        return res.status(200).json({ success: false, message: 'Not found or already processed' });
      }

      const payment = payments[0];

      // 2. IDEMPOTENT (CHỐNG DUPLICATE)
      if (payment.status !== 'pending') {
        return res.status(200).json({ success: true, message: 'Already processed' });
      }

      // 3. CHECK EXPIRED
      if (new Date(payment.expired_at) < new Date()) {
        return res.status(200).json({ success: false, message: 'Expired' });
      }

      // 4. CHECK AMOUNT
      if (Number(transferAmount) < Number(payment.amount)) {
        return res.status(200).json({ success: false, message: 'Amount mismatch' });
      }

      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        // UPDATE PAYMENT
        await conn.execute(
          `UPDATE Payments 
           SET status = 'success',
               transaction_id = ?,
               payment_date = NOW(),
               raw_data = ?
           WHERE id = ?`,
          [transactionId, JSON.stringify(req.body), payment.id]
        );

        // UPDATE BOOKING
        await conn.execute(
          `UPDATE Bookings 
           SET status = 'Confirmed'
           WHERE id = ?`,
          [payment.booking_id]
        );

        // Update room statuses immediately
        await roomController._internalUpdateRoomStatuses(conn);

        // ADD LOYALTY POINTS (10,000 VND = 1 POINT)
        const earnedPoints = Math.floor(Number(payment.amount) / 10000);
        if (earnedPoints > 0) {
          await conn.execute(
            'UPDATE Users SET loyalty_points = loyalty_points + ? WHERE id = ?',
            [earnedPoints, payment.user_id]
          );
        }

        // UPDATE VOUCHER USAGE
        const [[booking]] = await conn.execute(
          'SELECT voucher_id FROM Bookings WHERE id = ?',
          [payment.booking_id]
        );

        if (booking && booking.voucher_id) {
          // Increment total used count
          await conn.execute(
            'UPDATE Vouchers SET used_count = used_count + 1 WHERE id = ?',
            [booking.voucher_id]
          );
          // Track specific user usage
          await conn.execute(
            'INSERT IGNORE INTO User_Vouchers (user_id, voucher_id) VALUES (?, ?)',
            [payment.user_id, booking.voucher_id]
          );
        }

        await conn.commit();

        console.log(`✅ Payment success: ${payment.order_code}. User ${payment.user_id} earned ${earnedPoints} points.`);

        return res.status(200).json({ success: true });

      } catch (err) {
        await conn.rollback();
        console.error(err);
        return res.status(500).json({ success: false });
      } finally {
        conn.release();
      }

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  },

  // ================================
  // EXPIRE PAYMENT
  // ================================
  expirePayment: async (req, res) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const { paymentId } = req.body;

      const [[p]] = await conn.execute(
        'SELECT booking_id FROM Payments WHERE id = ?',
        [paymentId]
      );

      if (!p) throw new Error('Not found');

      await conn.execute(
        'UPDATE Payments SET status = "expired" WHERE id = ?',
        [paymentId]
      );

      await conn.execute(
        'UPDATE Bookings SET status = "Cancelled" WHERE id = ?',
        [p.booking_id]
      );

      await conn.commit();

      res.json({ success: true });

    } catch (err) {
      await conn.rollback();
      res.status(500).json({ success: false });
    } finally {
      conn.release();
    }
  },

  checkStatus: async (req, res) => {
    try {
      const { paymentId } = req.params;
      const [payments] = await pool.execute('SELECT status FROM Payments WHERE id = ?', [paymentId]);

      if (payments.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy thanh toán' });
      }

      res.json({ success: true, status: payments[0].status });
    } catch (error) {
      console.error('Error in checkStatus:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  getPaymentHistory: async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Get all payments with item names
      const [payments] = await pool.execute(`
        SELECT p.*, b.type as booking_type, b.booking_code,
               CASE 
                 WHEN b.type = 'room' THEN (
                   SELECT r.name 
                   FROM Rooms r 
                   JOIN Room_Numbers rn ON r.id = rn.room_id 
                   JOIN Booking_Rooms br ON rn.id = br.room_number_id 
                   WHERE br.booking_id = b.id 
                   LIMIT 1
                 )
                 WHEN b.type = 'service' THEN (
                   SELECT s.name 
                   FROM Services s 
                   JOIN Booking_Services bs ON s.id = bs.service_id 
                   WHERE bs.booking_id = b.id 
                   LIMIT 1
                 )
               END as item_name
        FROM Payments p
        JOIN Bookings b ON p.booking_id = b.id
        WHERE b.user_id = ?
        ORDER BY p.created_at DESC
      `, [userId]);

      // Calculate total spent (successful payments only)
      const [[{ totalSpent }]] = await pool.execute(
        'SELECT COALESCE(SUM(amount), 0) as totalSpent FROM Payments p JOIN Bookings b ON p.booking_id = b.id WHERE b.user_id = ? AND p.status = "success"',
        [userId]
      );

      res.json({ 
        success: true, 
        data: {
          payments,
          totalSpent: parseFloat(totalSpent)
        }
      });
    } catch (error) {
      console.error('Error in getPaymentHistory:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Admin: Get all payments
  getAllPayments: async (req, res) => {
    try {
      const query = `
        SELECT 
          p.*, 
          b.type as booking_type, 
          b.booking_code,
          u.full_name as user_name,
          CASE 
            WHEN b.type = 'room' THEN (
              SELECT r.name FROM Rooms r 
              JOIN Room_Numbers rn ON r.id = rn.room_id 
              JOIN Booking_Rooms br ON rn.id = br.room_number_id 
              WHERE br.booking_id = b.id LIMIT 1
            )
            WHEN b.type = 'service' THEN (
              SELECT s.name FROM Services s 
              JOIN Booking_Services bs ON s.id = bs.service_id 
              WHERE bs.booking_id = b.id LIMIT 1
            )
          END as item_name
        FROM Payments p
        JOIN Bookings b ON p.booking_id = b.id
        JOIN Users u ON b.user_id = u.id
        ORDER BY p.created_at DESC
      `;

      const [rows] = await pool.execute(query);

      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error('Error in getAllPayments:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Admin: Update payment status
  updatePaymentStatus: async (req, res) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const { id } = req.params;
      const { status } = req.body;

      // Get current payment and user info
      const [[payment]] = await conn.execute(
        'SELECT p.*, b.user_id, b.status as booking_status FROM Payments p JOIN Bookings b ON p.booking_id = b.id WHERE p.id = ?',
        [id]
      );

      if (!payment) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy thanh toán' });
      }

      // If status is being changed to 'success' and it wasn't 'success' before
      if (status === 'success' && payment.status !== 'success') {
        // Update payment
        await conn.execute('UPDATE Payments SET status = ?, payment_date = NOW() WHERE id = ?', [status, id]);
        
        // Update booking to Confirmed
        await conn.execute('UPDATE Bookings SET status = "Confirmed" WHERE id = ?', [payment.booking_id]);

        // Update room statuses immediately
        await roomController._internalUpdateRoomStatuses(conn);

        // Add Loyalty Points (10,000 VND = 1 POINT)
        const earnedPoints = Math.floor(Number(payment.amount) / 10000);
        if (earnedPoints > 0) {
          await conn.execute(
            'UPDATE Users SET loyalty_points = loyalty_points + ? WHERE id = ?',
            [earnedPoints, payment.user_id]
          );
        }

        // UPDATE VOUCHER USAGE
        const [[booking]] = await conn.execute(
          'SELECT voucher_id FROM Bookings WHERE id = ?',
          [payment.booking_id]
        );

        if (booking && booking.voucher_id) {
          // Increment total used count
          await conn.execute(
            'UPDATE Vouchers SET used_count = used_count + 1 WHERE id = ?',
            [booking.voucher_id]
          );
          // Track specific user usage
          await conn.execute(
            'INSERT IGNORE INTO User_Vouchers (user_id, voucher_id) VALUES (?, ?)',
            [payment.user_id, booking.voucher_id]
          );
        }
      } else {
        // Just update status (e.g. pending, failed, expired)
        await conn.execute('UPDATE Payments SET status = ? WHERE id = ?', [status, id]);
        
        // If changed to failed/expired/cancelled, update booking too
        if (['failed', 'expired', 'cancelled'].includes(status)) {
          await conn.execute('UPDATE Bookings SET status = "Cancelled" WHERE id = ?', [payment.booking_id]);
        }
      }

      await conn.commit();
      res.json({
        success: true,
        message: 'Cập nhật trạng thái thanh toán thành công'
      });
    } catch (error) {
      await conn.rollback();
      console.error('Error in updatePaymentStatus:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    } finally {
      conn.release();
    }
  }
};

module.exports = paymentController;
