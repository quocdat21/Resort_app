const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const zoneRoutes = require('./src/routes/zone.routes');
const categoryRoutes = require('./src/routes/category.routes');
const roomRoutes = require('./src/routes/room.routes');
const amenityRoutes = require('./src/routes/amenity.routes');
const serviceRoutes = require('./src/routes/service.routes');
const voucherRoutes = require('./src/routes/voucher.routes');
const homeRoutes = require('./src/routes/home.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================
// MIDDLEWARE
// ========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// ========================
// ROUTES
// ========================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/home', homeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Thao Nguyen Resort API is running 🌿',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Handle Multer Errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File quá lớn. Giới hạn tối đa là 50MB.'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Số lượng file vượt quá giới hạn cho phép.'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

const pool = require('./src/config/db');

(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ MySQL connected OK');
  } catch (err) {
    console.error('❌ MySQL error:', err.message);
  }
})();

// ========================
// START SERVER
// ========================
app.listen(PORT, () => {
  console.log(`🌿 Thao Nguyen Resort API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
