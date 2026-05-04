const mysql = require('mysql2/promise');
require('dotenv').config({ path: './.env' });

async function checkBooking() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'resort_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const bookingId = 10;
    console.log(`--- Checking Booking ID: ${bookingId} ---`);
    
    // 1. Booking table
    const [bookings] = await pool.execute('SELECT * FROM Bookings WHERE id = ?', [bookingId]);
    console.log('Booking:', bookings[0]);

    if (bookings.length > 0) {
      // 2. Booking_Rooms
      const [rooms] = await pool.execute(`
        SELECT br.*, rn.room_number 
        FROM Booking_Rooms br
        JOIN Room_Numbers rn ON br.room_number_id = rn.id
        WHERE br.booking_id = ?
      `, [bookingId]);
      console.log('Rooms assigned:', rooms);

      // 3. Booking_Services
      const [services] = await pool.execute('SELECT * FROM Booking_Services WHERE booking_id = ?', [bookingId]);
      console.log('Services assigned:', services);
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkBooking();
