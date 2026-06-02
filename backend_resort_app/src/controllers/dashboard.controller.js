const pool = require('../config/db');

const formatDateKey = (date) => date.toISOString().slice(0, 10);

const parseIntInRange = (value, fallback, min, max) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < min || parsed > max) return fallback;
  return parsed;
};

const getChartContext = (period, year, month) => {
  const now = new Date();
  const selectedPeriod = ['week', 'month', 'year'].includes(period) ? period : 'week';
  const selectedYear = parseIntInRange(year, now.getFullYear(), 2000, 2100);
  const selectedMonth = parseIntInRange(month, now.getMonth() + 1, 1, 12);

  if (selectedPeriod === 'year') {
    return {
      period: selectedPeriod,
      year: selectedYear,
      month: selectedMonth,
      startDate: `${selectedYear}-01-01`,
      endDate: `${selectedYear + 1}-01-01`
    };
  }

  if (selectedPeriod === 'month') {
    const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
    const nextMonthYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;

    return {
      period: selectedPeriod,
      year: selectedYear,
      month: selectedMonth,
      startDate: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`,
      endDate: `${nextMonthYear}-${String(nextMonth).padStart(2, '0')}-01`
    };
  }

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 6);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 1);

  return {
    period: selectedPeriod,
    year: selectedYear,
    month: selectedMonth,
    startDate: formatDateKey(startDate),
    endDate: formatDateKey(endDate)
  };
};

const getAvailableYears = async () => {
  const [rows] = await pool.execute(`
    SELECT DISTINCT data_year FROM (
      SELECT YEAR(payment_date) as data_year FROM Payments WHERE payment_date IS NOT NULL
      UNION
      SELECT YEAR(created_at) as data_year FROM Bookings WHERE created_at IS NOT NULL
      UNION
      SELECT YEAR(created_at) as data_year FROM Users WHERE created_at IS NOT NULL
    ) y
    WHERE data_year IS NOT NULL
    ORDER BY data_year DESC
  `);

  const years = rows.map(row => Number(row.data_year)).filter(Boolean);
  return years.length > 0 ? years : [new Date().getFullYear()];
};

const getDateRangePoints = (startDate, endDate) => {
  const points = [];
  const cursor = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);

  while (cursor < end) {
    const key = formatDateKey(cursor);
    points.push({
      key,
      label: cursor.toLocaleDateString('vi-VN', { day: '2-digit' }),
      day: cursor.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return points;
};

const buildRevenueChart = async (context) => {
  if (context.period === 'year') {
    const [rows] = await pool.execute(`
      SELECT DATE_FORMAT(payment_date, '%Y-%m') as period_key, COALESCE(SUM(amount), 0) as revenue
      FROM Payments
      WHERE status = 'success'
        AND payment_date >= ?
        AND payment_date < ?
      GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
      ORDER BY period_key ASC
    `, [context.startDate, context.endDate]);

    const revenueByMonth = new Map(rows.map(row => [row.period_key, Number(row.revenue || 0)]));

    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const key = `${context.year}-${String(month).padStart(2, '0')}`;
      return {
        label: `T${month}`,
        day: `Tháng ${month}`,
        date: key,
        revenue: revenueByMonth.get(key) || 0
      };
    });
  }

  const [rows] = await pool.execute(`
    SELECT DATE(payment_date) as period_key, COALESCE(SUM(amount), 0) as revenue
    FROM Payments
    WHERE status = 'success'
      AND payment_date >= ?
      AND payment_date < ?
    GROUP BY DATE(payment_date)
    ORDER BY period_key ASC
  `, [context.startDate, context.endDate]);

  const revenueByDay = new Map(rows.map(row => {
    const key = row.period_key instanceof Date ? formatDateKey(row.period_key) : String(row.period_key).slice(0, 10);
    return [key, Number(row.revenue || 0)];
  }));

  return getDateRangePoints(context.startDate, context.endDate).map(point => ({
    label: context.period === 'week'
      ? new Date(`${point.key}T00:00:00.000Z`).toLocaleDateString('vi-VN', { weekday: 'short' })
      : point.label,
    day: point.day,
    date: point.key,
    revenue: revenueByDay.get(point.key) || 0
  }));
};

const buildBookingStatusData = async (context) => {
  const [statusDist] = await pool.execute(`
    SELECT status as name, COUNT(*) as value
    FROM Bookings
    WHERE created_at >= ?
      AND created_at < ?
    GROUP BY status
  `, [context.startDate, context.endDate]);

  const statusColors = {
    'Confirmed': '#10b981',
    'Pending': '#3b82f6',
    'Cancelled': '#f59e0b',
    'Completed': '#ef4444'
  };

  return statusDist.map(item => ({
    ...item,
    value: Number(item.value || 0),
    color: statusColors[item.name] || '#94a3b8'
  }));
};

const buildOccupancyChart = async (context) => {
  const occupancyChart = [];
  const [[{ totalRoomsCount }]] = await pool.execute("SELECT COUNT(*) as totalRoomsCount FROM Room_Numbers WHERE status != 'Hidden'");

  if (context.period === 'year') {
    for (let month = 1; month <= 12; month++) {
      const startDate = `${context.year}-${String(month).padStart(2, '0')}-01`;
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextMonthYear = month === 12 ? context.year + 1 : context.year;
      const endDate = `${nextMonthYear}-${String(nextMonth).padStart(2, '0')}-01`;

      const [occupiedResult] = await pool.execute(`
        SELECT COUNT(DISTINCT br.room_number_id) as occupiedCount
        FROM Booking_Rooms br
        JOIN Bookings b ON br.booking_id = b.id
        WHERE b.status = 'Confirmed'
          AND b.type = 'room'
          AND b.check_in < ?
          AND b.check_out > ?
      `, [endDate, startDate]);

      const occupied = occupiedResult[0].occupiedCount || 0;
      occupancyChart.push({
        name: `T${month}`,
        rate: totalRoomsCount > 0 ? Math.round((occupied / totalRoomsCount) * 100) : 0,
        date: `${context.year}-${String(month).padStart(2, '0')}`
      });
    }

    return occupancyChart;
  }

  for (const point of getDateRangePoints(context.startDate, context.endDate)) {
    const [occupiedResult] = await pool.execute(`
      SELECT COUNT(DISTINCT br.room_number_id) as occupiedCount
      FROM Booking_Rooms br
      JOIN Bookings b ON br.booking_id = b.id
      WHERE b.status = 'Confirmed'
        AND b.type = 'room'
        AND b.check_in <= ?
        AND b.check_out > ?
    `, [point.key, point.key]);

    const occupied = occupiedResult[0].occupiedCount || 0;
    occupancyChart.push({
      name: context.period === 'week'
        ? new Date(`${point.key}T00:00:00.000Z`).toLocaleDateString('vi-VN', { weekday: 'short' })
        : point.label,
      rate: totalRoomsCount > 0 ? Math.round((occupied / totalRoomsCount) * 100) : 0,
      date: point.key
    });
  }

  return occupancyChart;
};

const dashboardController = {
  getOverview: async (req, res) => {
    try {
      const availableYears = await getAvailableYears();
      const requestedYear = req.query.year ? parseInt(req.query.year, 10) : availableYears[0];
      const selectedYear = availableYears.includes(requestedYear) ? requestedYear : availableYears[0];
      const chartContext = getChartContext(req.query.period, selectedYear, req.query.month);

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

      // 2. CHARTS
      const revenueChart = await buildRevenueChart(chartContext);
      const bookingStatusData = await buildBookingStatusData(chartContext);
      const occupancyChart = await buildOccupancyChart(chartContext);

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
          chartFilter: chartContext,
          availableYears,
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
