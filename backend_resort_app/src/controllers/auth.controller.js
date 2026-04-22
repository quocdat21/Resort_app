
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { generateOTP } = require('../utils/otp');
const { sendWelcomeEmail, sendResetPasswordEmail } = require('../services/email.service');
const { isValidEmail, isValidPassword, isValidPhone } = require('../utils/validators');
require('dotenv').config();

const SALT_ROUNDS = 12;

// ============================================
// POST /api/auth/register
// ============================================
const register = async (req, res) => {
  try {
    const { full_name, email, phone_number, password } = req.body;

    // --- Validation ---
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'full_name, email, and password are required.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format.',
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters with uppercase, lowercase, and a number.',
      });
    }

    if (phone_number && !isValidPhone(phone_number)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Expected: 0xxxxxxxxx or +84xxxxxxxxx',
      });
    }

    // --- Check if user already exists ---
    const [existingUsers] = await pool.execute(
      'SELECT id, is_verified FROM Users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0 && existingUsers[0].is_verified === 1) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered.',
      });
    }

    // --- Hash password ---
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    let userId;

    if (existingUsers.length > 0 && existingUsers[0].is_verified === 0) {
      // Update existing unverified user
      userId = existingUsers[0].id;
      await pool.execute(
        'UPDATE Users SET full_name = ?, phone_number = ?, password = ? WHERE id = ?',
        [full_name, phone_number || null, hashedPassword, userId]
      );
    } else {
      // Insert new user
      const [result] = await pool.execute(
        `INSERT INTO Users (full_name, email, phone_number, password, role, is_verified)
         VALUES (?, ?, ?, ?, 'customer', 0)`,
        [full_name, email, phone_number || null, hashedPassword]
      );
      userId = result.insertId;
    }

    // --- Generate OTP and save ---
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
    const expireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES, 10) || 5;

    // Invalidate previous OTPs for this email
    await pool.execute(
      'UPDATE OTP_Verifications SET is_used = 1 WHERE email = ? AND type = ? AND is_used = 0',
      [email, 'register']
    );

    await pool.execute(
      `INSERT INTO OTP_Verifications (user_id, email, otp_hash, type, expired_at)
       VALUES (?, ?, ?, 'register', DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [userId, email, otpHash, expireMinutes]
    );

    // --- Send welcome email with OTP ---
    try {
      await sendWelcomeEmail(email, full_name, otp);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      // Don't fail registration if email fails — user can resend
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for the verification code.',
      data: {
        user_id: userId,
        email,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

// ============================================
// POST /api/auth/verify-otp
// ============================================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, type } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'email and otp are required.',
      });
    }

    const otpType = type || 'register';

    // Get latest unused OTP for this email and type
    const [otpRecords] = await pool.execute(
      `SELECT * FROM OTP_Verifications
       WHERE email = ? AND type = ? AND is_used = 0 AND expired_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, otpType]
    );

    if (otpRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found. Please request a new one.',
      });
    }

    const otpRecord = otpRecords[0];

    // Check attempts
    if (otpRecord.attempts >= 5) {
      await pool.execute(
        'UPDATE OTP_Verifications SET is_used = 1 WHERE id = ?',
        [otpRecord.id]
      );
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please request a new OTP.',
      });
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, otpRecord.otp_hash);

    if (!isMatch) {
      await pool.execute(
        'UPDATE OTP_Verifications SET attempts = attempts + 1 WHERE id = ?',
        [otpRecord.id]
      );
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code.',
      });
    }

    // Mark OTP as used
    await pool.execute(
      'UPDATE OTP_Verifications SET is_used = 1 WHERE id = ?',
      [otpRecord.id]
    );

    if (otpType === 'register') {
      // Verify user
      await pool.execute(
        'UPDATE Users SET is_verified = 1 WHERE email = ?',
        [email]
      );

      // Get user for JWT
      const [users] = await pool.execute(
        'SELECT id, full_name, email, role FROM Users WHERE email = ?',
        [email]
      );

      const user = users[0];
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Email verified successfully. Welcome!',
        data: {
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
          },
          token,
        },
      });
    }

    if (otpType === 'reset_password') {
      // Return a temporary token for password reset
      const resetToken = jwt.sign(
        { email, purpose: 'reset_password' },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );

      return res.status(200).json({
        success: true,
        message: 'OTP verified. You may now reset your password.',
        data: { reset_token: resetToken },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

// ============================================
// POST /api/auth/resend-otp
// ============================================
const resendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;
    const otpType = type || 'register';

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'email is required.',
      });
    }

    // Check user exists
    const [users] = await pool.execute(
      'SELECT id, full_name, is_verified FROM Users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email.',
      });
    }

    const user = users[0];

    if (otpType === 'register' && user.is_verified === 1) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified.',
      });
    }

    // Rate-limit: max 1 OTP per 60 seconds
    const [recentOtp] = await pool.execute(
      `SELECT id FROM OTP_Verifications
       WHERE email = ? AND type = ? AND created_at > DATE_SUB(NOW(), INTERVAL 60 SECOND)
       ORDER BY created_at DESC LIMIT 1`,
      [email, otpType]
    );

    if (recentOtp.length > 0) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 60 seconds before requesting a new OTP.',
      });
    }

    // Invalidate old OTPs
    await pool.execute(
      'UPDATE OTP_Verifications SET is_used = 1 WHERE email = ? AND type = ? AND is_used = 0',
      [email, otpType]
    );

    // Generate new OTP
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
    const expireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES, 10) || 5;

    await pool.execute(
      `INSERT INTO OTP_Verifications (user_id, email, otp_hash, type, expired_at)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [user.id, email, otpHash, otpType, expireMinutes]
    );

    // Send email
    try {
      if (otpType === 'reset_password') {
        await sendResetPasswordEmail(email, user.full_name, otp);
      } else {
        await sendWelcomeEmail(email, user.full_name, otp);
      }
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'A new OTP has been sent to your email.',
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

// ============================================
// POST /api/auth/login
// ============================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Validation ---
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required.',
      });
    }

    // --- Find user ---
    const [users] = await pool.execute(
      'SELECT * FROM Users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = users[0];

    // --- Check verified ---
    if (user.is_verified === 0) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
      });
    }

    // --- Compare password ---
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // --- Generate JWT ---
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number,
          role: user.role,
          avatar_url: user.avatar_url,
          loyalty_points: user.loyalty_points,
          total_stays: user.total_stays,
        },
        token,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

// ============================================
// POST /api/auth/forgot-password
// ============================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'email is required.',
      });
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT id, full_name, is_verified FROM Users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Don't reveal that email doesn't exist
      return res.status(200).json({
        success: true,
        message: 'If this email is registered, a recovery code has been sent.',
      });
    }

    const user = users[0];

    if (user.is_verified === 0) {
      return res.status(403).json({
        success: false,
        message: 'Account not verified. Please verify your email first.',
      });
    }

    // Invalidate old OTPs
    await pool.execute(
      'UPDATE OTP_Verifications SET is_used = 1 WHERE email = ? AND type = ? AND is_used = 0',
      [email, 'reset_password']
    );

    // Generate OTP
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
    const expireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES, 10) || 5;

    await pool.execute(
      `INSERT INTO OTP_Verifications (user_id, email, otp_hash, type, expired_at)
       VALUES (?, ?, ?, 'reset_password', DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [user.id, email, otpHash, expireMinutes]
    );

    // Send email
    try {
      await sendResetPasswordEmail(email, user.full_name, otp);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'If this email is registered, a recovery code has been sent.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

// ============================================
// POST /api/auth/reset-password
// ============================================
const resetPassword = async (req, res) => {
  try {
    const { reset_token, new_password } = req.body;

    if (!reset_token || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'reset_token and new_password are required.',
      });
    }

    if (!isValidPassword(new_password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters with uppercase, lowercase, and a number.',
      });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(reset_token, process.env.JWT_SECRET);
    } catch (tokenErr) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired reset token.',
      });
    }

    if (decoded.purpose !== 'reset_password') {
      return res.status(401).json({
        success: false,
        message: 'Invalid reset token.',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, SALT_ROUNDS);

    // Update password
    const [result] = await pool.execute(
      'UPDATE Users SET password = ? WHERE email = ?',
      [hashedPassword, decoded.email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

// ============================================
// GET /api/auth/me (Protected)
// ============================================
const getMe = async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, full_name, email, phone_number, role, language_preference,
              date_of_birth, gender, address, avatar_url, loyalty_points,
              total_stays, created_at
       FROM Users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: users[0],
    });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

// ============================================
// PUT /api/auth/me (Protected)
// ============================================
const updateMe = async (req, res) => {
  try {
    const { full_name, phone_number, date_of_birth, gender, address, avatar_url } = req.body;

    const updates = [];
    const values = [];

    if (full_name !== undefined) {
      updates.push('full_name = ?');
      values.push(full_name);
    }
    if (phone_number !== undefined) {
      if (phone_number && !isValidPhone(phone_number)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format.',
        });
      }
      updates.push('phone_number = ?');
      values.push(phone_number || null);
    }
    if (date_of_birth !== undefined) {
      updates.push('date_of_birth = ?');
      values.push(date_of_birth || null);
    }
    if (gender !== undefined) {
      updates.push('gender = ?');
      values.push(gender || null);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address || null);
    }
    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      values.push(avatar_url || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update.',
      });
    }

    values.push(req.user.id);

    const query = `UPDATE Users SET ${updates.join(', ')} WHERE id = ?`;
    await pool.execute(query, values);

    // Fetch updated user
    const [users] = await pool.execute(
      `SELECT id, full_name, email, phone_number, role, language_preference,
              date_of_birth, gender, address, avatar_url, loyalty_points,
              total_stays, created_at
       FROM Users WHERE id = ?`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: users[0],
    });
  } catch (err) {
    console.error('Update me error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
};
