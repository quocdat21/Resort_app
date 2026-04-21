const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware: Verify JWT token from Authorization header.
 * Attaches decoded user to req.user on success.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

/**
 * Middleware: Restrict access to specific roles.
 * Must be used AFTER verifyToken.
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'staff')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Insufficient permissions.',
      });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
