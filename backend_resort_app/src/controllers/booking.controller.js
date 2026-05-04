const pool = require('../config/db');

const bookingController = {
  // Get booking history for a user
  getUserBookings: async (req, res) => {
    try {
      const { userId } = req.params;
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

      const query = `
        SELECT 
          b.*,
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
          END as item_name,
          CASE 
            WHEN b.type = 'room' THEN (
              SELECT ri.image_url FROM Room_Images ri 
              JOIN Rooms r ON ri.room_id = r.id 
              JOIN Room_Numbers rn ON r.id = rn.room_id 
              JOIN Booking_Rooms br ON rn.id = br.room_number_id 
              WHERE br.booking_id = b.id LIMIT 1
            )
            WHEN b.type = 'service' THEN (
              SELECT COALESCE(
                (SELECT si.image_url FROM Service_Images si 
                 JOIN Booking_Services bs_inner ON si.service_id = bs_inner.service_id 
                 WHERE bs_inner.booking_id = b.id LIMIT 1),
                (SELECT s.image_url FROM Services s 
                 JOIN Booking_Services bs_inner ON s.id = bs_inner.service_id 
                 WHERE bs_inner.booking_id = b.id LIMIT 1)
              )
            )
          END as image_url,
          CASE 
            WHEN b.type = 'room' THEN (
              SELECT br.price FROM Booking_Rooms br WHERE br.booking_id = b.id LIMIT 1
            )
            WHEN b.type = 'service' THEN (
              SELECT bs.price FROM Booking_Services bs WHERE bs.booking_id = b.id LIMIT 1
            )
          END as booking_price,
          CASE 
            WHEN b.type = 'room' THEN (
              SELECT r.description FROM Rooms r 
              JOIN Room_Numbers rn ON r.id = rn.room_id
              JOIN Booking_Rooms br ON rn.id = br.room_number_id
              WHERE br.booking_id = b.id LIMIT 1
            )
            WHEN b.type = 'service' THEN (
              SELECT s.description FROM Services s
              JOIN Booking_Services bs ON s.id = bs.service_id
              WHERE bs.booking_id = b.id LIMIT 1
            )
          END as description
        FROM Bookings b
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
      `;

      const [rows] = await pool.execute(query, [userId]);

      const formatted = rows.map(row => ({
        ...row,
        image_url: row.image_url 
          ? (row.image_url.startsWith('http') ? row.image_url : `${baseUrl}${row.image_url}`)
          : null
      }));

      res.json({
        success: true,
        data: formatted
      });
    } catch (error) {
      console.error('Error in getUserBookings:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Get single booking detail
  getBookingDetail: async (req, res) => {
    try {
      const { bookingCode } = req.params;
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

      // 1. Get Base Booking Info
      const [bookings] = await pool.execute(`
        SELECT b.*, u.full_name as user_name, u.avatar_url, p.payment_method 
        FROM Bookings b 
        JOIN Users u ON b.user_id = u.id 
        LEFT JOIN Payments p ON b.id = p.booking_id
        WHERE b.booking_code = ?
        ORDER BY p.created_at DESC
        LIMIT 1
      `, [bookingCode]);
      if (bookings.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt' });
      }
      const booking = bookings[0];

      let itemDetails = {};
      let images = [];
      let amenities = [];
      let selectedServices = [];
      let roomNumbers = [];
      let appliedVoucher = null;

      if (booking.type === 'room') {
        // 2a. Get Room Template Info
        console.log('DEBUG: Fetching room info for booking ID:', booking.id);
        const [roomInfo] = await pool.execute(`
          SELECT r.*, br.price as booking_price, c.name as category_name
          FROM Rooms r
          JOIN Room_Numbers rn ON r.id = rn.room_id
          JOIN Booking_Rooms br ON rn.id = br.room_number_id
          LEFT JOIN Categories c ON r.category_id = c.id
          WHERE br.booking_id = ?
          LIMIT 1
        `, [booking.id]);
        console.log('DEBUG: Room Info Result from DB:', roomInfo);

        if (roomInfo.length > 0) {
          itemDetails = roomInfo[0];
          // Get Images
          const [imgs] = await pool.execute('SELECT image_url FROM Room_Images WHERE room_id = ?', [itemDetails.id]);
          images = imgs.map(img => img.image_url.startsWith('http') ? img.image_url : `${baseUrl}${img.image_url}`);
          // Get Amenities
          const [amns] = await pool.execute(`
            SELECT a.* FROM Amenities a
            JOIN Room_Amenities ra ON a.id = ra.amenity_id
            WHERE ra.room_id = ?
          `, [itemDetails.id]);
          amenities = amns;
          console.log(`DEBUG: Found ${amenities.length} amenities for room ${itemDetails.id}`);
        }

        // Get Room Numbers assigned
        const [rns] = await pool.execute(`
          SELECT rn.room_number
          FROM Room_Numbers rn
          JOIN Booking_Rooms br ON rn.id = br.room_number_id
          WHERE br.booking_id = ?
        `, [booking.id]);
        roomNumbers = rns.map(rn => rn.room_number);

        // 3. Get Extra Services for Room
        const [services] = await pool.execute(`
          SELECT bs.*, s.name, s.type as service_type
          FROM Booking_Services bs
          JOIN Services s ON bs.service_id = s.id
          WHERE bs.booking_id = ?
        `, [booking.id]);
        console.log(`DEBUG: Found ${services.length} extra services for booking ${booking.id}`);
        selectedServices = services;

      } else {
        // 2b. Get Service Info
        console.log('DEBUG: Fetching service info for booking ID:', booking.id);
        
        // Check if there are ANY records in Booking_Services for this booking
        const [anyServices] = await pool.execute('SELECT * FROM Booking_Services WHERE booking_id = ?', [booking.id]);
        console.log('DEBUG: All Booking_Services for this ID:', anyServices);

        const [serviceInfo] = await pool.execute(`
          SELECT 
            s.id, s.name, s.type, s.capacity, s.description, s.image_url,
            bs.price_type, bs.unit, bs.quantity, bs.price as booking_price, bs.total_price, bs.service_date
          FROM Services s
          JOIN Booking_Services bs ON s.id = bs.service_id
          WHERE bs.booking_id = ?
          LIMIT 1
        `, [booking.id]);
        console.log('DEBUG: Final Service Info Result (with explicit select):', serviceInfo);

        if (serviceInfo.length > 0) {
          itemDetails = serviceInfo[0];
          const [imgs] = await pool.execute('SELECT image_url FROM Service_Images WHERE service_id = ?', [itemDetails.id]);
          
          if (imgs.length > 0) {
            images = imgs.map(img => img.image_url.startsWith('http') ? img.image_url : `${baseUrl}${img.image_url}`);
          } else if (itemDetails.image_url) {
            // Fallback to main service image
            images = [itemDetails.image_url.startsWith('http') ? itemDetails.image_url : `${baseUrl}${itemDetails.image_url}`];
          }
        }
      }

      // Get Voucher Info if exists
      if (booking.voucher_id) {
        const [vouchers] = await pool.execute('SELECT * FROM Vouchers WHERE id = ?', [booking.voucher_id]);
        if (vouchers.length > 0) {
          appliedVoucher = vouchers[0];
        }
      }

      res.json({
        success: true,
        data: {
          ...booking,
          item_details: itemDetails,
          images: images,
          main_image_url: images.length > 0 ? images[0] : null,
          amenities: amenities,
          selected_services: selectedServices,
          room_numbers: roomNumbers,
          applied_voucher: appliedVoucher
        }
      });

    } catch (error) {
      console.error('Error in getBookingDetail:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Admin: Get all bookings
  getAllBookings: async (req, res) => {
    try {
      const { type } = req.query; // 'room' or 'service'
      
      let query = `
        SELECT 
          b.*,
          u.full_name as user_name,
          p.payment_method,
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
          END as item_name,
          CASE 
            WHEN b.type = 'service' THEN (
              SELECT bs.quantity FROM Booking_Services bs 
              WHERE bs.booking_id = b.id LIMIT 1
            )
            ELSE NULL
          END as quantity
        FROM Bookings b
        JOIN Users u ON b.user_id = u.id
        LEFT JOIN (
          SELECT booking_id, payment_method, 
                 ROW_NUMBER() OVER(PARTITION BY booking_id ORDER BY created_at DESC) as rn
          FROM Payments
        ) p ON b.id = p.booking_id AND p.rn = 1
      `;

      if (type) {
        query += ` WHERE b.type = ?`;
      }
      
      query += ` ORDER BY b.created_at DESC`;

      const [rows] = await pool.execute(query, type ? [type] : []);

      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error('Error in getAllBookings:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Admin: Update booking status
  updateBookingStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await pool.execute('UPDATE Bookings SET status = ? WHERE id = ?', [status, id]);

      res.json({
        success: true,
        message: 'Cập nhật trạng thái thành công'
      });
    } catch (error) {
      console.error('Error in updateBookingStatus:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }
};

module.exports = bookingController;
