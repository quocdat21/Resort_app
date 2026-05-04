const pool = require('../config/db');

const dashboardController = {
  getOverview: async (req, res) => {
    try {
      // 1. STATS (Current 30 days vs Previous 30 days)

      const getStatsForPeriod = async (daysOffset, daysDuration) => {
        // daysOffset: how many days ago the period ends
        // daysDuration: how many days the period lasts
        const end = `DATE_SUB(NOW(), INTERVAL ${daysOffset} DAY)`;
        const start = `DATE_SUB(NOW(), INTERVAL ${daysOffset + daysDuration} DAY)`;

        const [revenue] = await pool.execute(`SELECT SUM(amount) as total FROM Payments WHERE status = 'success' AND payment_date > ${start} AND payment_date <= ${end}`);
        const [bookings] = await pool.execute(`SELECT COUNT(*) as total FROM Bookings WHERE created_at > ${start} AND created_at <= ${end}`);
        const [users] = await pool.execute(`SELECT COUNT(*) as total FROM Users WHERE created_at > ${start} AND created_at <= ${end}`);
        const [services] = await pool.execute(`SELECT COUNT(*) as total FROM Bookings WHERE type = 'service' AND created_at > ${start} AND created_at <= ${end}`);
        const [payments] = await pool.execute(`SELECT COUNT(*) as total FROM Payments WHERE status = 'success' AND payment_date > ${start} AND payment_date <= ${end}`);

        return {
          revenue: revenue[0].total || 0,
          bookings: bookings[0].total || 0,
          users: users[0].total || 0,
          services: services[0].total || 0,
          payments: payments[0].total || 0
        };
      };

      const currentStats = await getStatsForPeriod(0, 30);
      const previousStats = await getStatsForPeriod(30, 30);

      const calculateGrowth = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100 * 10) / 10;
      };

      const trends = {
        revenue: calculateGrowth(currentStats.revenue, previousStats.revenue),
        bookings: calculateGrowth(currentStats.bookings, previousStats.bookings),
        users: calculateGrowth(currentStats.users, previousStats.users),
        services: calculateGrowth(currentStats.services, previousStats.services),
        payments: calculateGrowth(currentStats.payments, previousStats.payments)
      };

      // Total Revenue (All time)
      const [revResult] = await pool.execute("SELECT SUM(amount) as total FROM Payments WHERE status = 'success'");
      const totalRevenue = revResult[0].total || 0;

      // Total Bookings (All time)
      const [bookingsCount] = await pool.execute("SELECT COUNT(*) as total FROM Bookings");
      const totalBookings = bookingsCount[0].total || 0;

      // Total Users (All time)
      const [usersCount] = await pool.execute("SELECT COUNT(*) as total FROM Users");
      const totalUsers = usersCount[0].total || 0;

      // Room Occupancy
      const [totalRooms] = await pool.execute("SELECT COUNT(*) as total FROM Room_Numbers WHERE status != 'Hidden'");
      const [occupiedRooms] = await pool.execute("SELECT COUNT(*) as total FROM Room_Numbers WHERE status = 'Occupied'");
      const occupancy = {
        total: totalRooms[0].total || 0,
        occupied: occupiedRooms[0].total || 0,
        rate: totalRooms[0].total > 0 ? Math.round((occupiedRooms[0].total / totalRooms[0].total) * 100) : 0
      };

      // Services Booked
      const [servicesCount] = await pool.execute("SELECT COUNT(*) as total FROM Bookings WHERE type = 'service'");
      const totalServices = servicesCount[0].total || 0;

      // Total Success Payments count
      const [paymentsCount] = await pool.execute("SELECT COUNT(*) as total FROM Payments WHERE status = 'success'");
      const totalPaymentsCount = paymentsCount[0].total || 0;

      // 2. REVENUE CHART (Last 7 days)
      const [revenueChart] = await pool.execute(`
        SELECT 
          DATE_FORMAT(payment_date, '%b %d') as day,
          SUM(amount) as revenue
        FROM Payments
        WHERE status = 'success' 
          AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(payment_date)
        ORDER BY payment_date ASC
      `);

      // 3. BOOKING STATUS DISTRIBUTION
      const [statusDist] = await pool.execute(`
        SELECT status as name, COUNT(*) as value
        FROM Bookings
        GROUP BY status
      `);

      const statusColors = {
        'Confirmed': '#10b981',
        'Pending': '#3b82f6',
        'Cancelled': '#f59e0b',
        'Completed': '#ef4444'
      };
      const bookingStatusData = statusDist.map(item => ({
        ...item,
        color: statusColors[item.name] || '#94a3b8'
      }));

      // 4. ROOM OCCUPANCY CHART (Last 7 days)
      const occupancyChart = [];
      const [[{ totalRoomsCount }]] = await pool.execute("SELECT COUNT(*) as totalRoomsCount FROM Room_Numbers WHERE status != 'Hidden'");

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayLabel = date.toLocaleDateString('vi-VN', { weekday: 'short' });

        const [occupiedResult] = await pool.execute(`
          SELECT COUNT(DISTINCT br.room_number_id) as occupiedCount
          FROM Booking_Rooms br
          JOIN Bookings b ON br.booking_id = b.id
          WHERE b.status = 'Confirmed'
            AND b.type = 'room'
            AND b.check_in <= ?
            AND b.check_out > ?
        `, [dateStr, dateStr]);

        const occupied = occupiedResult[0].occupiedCount || 0;
        const rate = totalRoomsCount > 0 ? Math.round((occupied / totalRoomsCount) * 100) : 0;

        occupancyChart.push({
          name: dayLabel,
          rate: rate,
          date: dateStr
        });
      }

      // 5. LATEST BOOKINGS
      const [latestBookings] = await pool.execute(`
        SELECT 
          b.id as code, 
          u.full_name as guest, 
          b.type,
          b.check_in as checkIn, 
          b.status,
          CASE 
            WHEN b.type = 'room' THEN (SELECT r.name FROM Rooms r JOIN Room_Numbers rn ON r.id = rn.room_id JOIN Booking_Rooms br ON rn.id = br.room_number_id WHERE br.booking_id = b.id LIMIT 1)
            ELSE (SELECT s.name FROM Services s JOIN Booking_Services bs ON s.id = bs.service_id WHERE bs.booking_id = b.id LIMIT 1)
          END as roomOrService
        FROM Bookings b
        LEFT JOIN Users u ON b.user_id = u.id
        ORDER BY b.id DESC
        LIMIT 5
      `);

      // 6. LATEST PAYMENTS
      const [latestPayments] = await pool.execute(`
        SELECT id, 'SePay' as method, amount, status
        FROM Payments
        ORDER BY id DESC
        LIMIT 5
      `);

      res.json({
        success: true,
        data: {
          stats: {
            totalRevenue,
            totalBookings,
            totalUsers,
            occupancy,
            totalServices,
            totalPaymentsCount,
            trends
          },
          revenueChart,
          bookingStatusData,
          occupancyChart,
          latestBookings,
          latestPayments
        }
      });

    } catch (error) {
      console.error('Error in getDashboardOverview:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }
};

module.exports = dashboardController;
