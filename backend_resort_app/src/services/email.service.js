const transporter = require('../config/email');
require('dotenv').config();

/**
 * Send welcome email after registration with OTP
 * @param {string} to - Recipient email
 * @param {string} fullName - User's full name
 * @param {string} otp - 6-digit OTP code
 */
const sendWelcomeEmail = async (to, fullName, otp) => {
  const mailOptions = {
    from: `"Thao Nguyen Resort" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🌿 Welcome to Thao Nguyen Resort — Verify Your Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #FAFAF5; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
          .header { background: linear-gradient(135deg, #334F2B, #4A6741); padding: 32px; text-align: center; }
          .header h1 { color: #FFFFFF; margin: 0; font-size: 22px; letter-spacing: 1px; }
          .header p { color: #C2E4B4; margin: 8px 0 0; font-size: 13px; letter-spacing: 2px; }
          .body { padding: 32px; }
          .body h2 { color: #334F2B; margin: 0 0 8px; font-size: 20px; }
          .body p { color: #434840; line-height: 1.6; font-size: 14px; margin: 12px 0; }
          .otp-box { background: #F5F5F0; border: 2px dashed #C2E4B4; border-radius: 12px; text-align: center; padding: 20px; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: bold; color: #334F2B; letter-spacing: 8px; margin: 0; }
          .otp-note { font-size: 12px; color: #73796F; margin: 8px 0 0; }
          .footer { background: #FAFAF5; padding: 20px 32px; text-align: center; border-top: 1px solid #E3E3DE; }
          .footer p { font-size: 11px; color: #73796F; margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>THAO NGUYEN RESORT</h1>
            <p>MOC CHAU HIGHLAND SANCTUARY</p>
          </div>
          <div class="body">
            <h2>Welcome, ${fullName}! 🌄</h2>
            <p>Thank you for registering at Thao Nguyen Resort. Your mountain sanctuary awaits.</p>
            <p>To complete your registration, please verify your email using the code below:</p>
            <div class="otp-box">
              <p class="otp-code">${otp}</p>
              <p class="otp-note">This code expires in ${process.env.OTP_EXPIRE_MINUTES || 5} minutes</p>
            </div>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Thao Nguyen Resort · Moc Chau, Vietnam</p>
            <p>This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send OTP email for password reset
 * @param {string} to - Recipient email
 * @param {string} fullName - User's full name
 * @param {string} otp - 6-digit OTP code
 */
const sendResetPasswordEmail = async (to, fullName, otp) => {
  const mailOptions = {
    from: `"Thao Nguyen Resort" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔐 Reset Your Password — Thao Nguyen Resort',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #FAFAF5; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
          .header { background: linear-gradient(135deg, #715A3E, #334F2B); padding: 32px; text-align: center; }
          .header h1 { color: #FFFFFF; margin: 0; font-size: 22px; letter-spacing: 1px; }
          .header p { color: #FDDDB9; margin: 8px 0 0; font-size: 13px; letter-spacing: 2px; }
          .body { padding: 32px; }
          .body h2 { color: #334F2B; margin: 0 0 8px; font-size: 20px; }
          .body p { color: #434840; line-height: 1.6; font-size: 14px; margin: 12px 0; }
          .otp-box { background: #F5F5F0; border: 2px dashed #FDDDB9; border-radius: 12px; text-align: center; padding: 20px; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: bold; color: #715A3E; letter-spacing: 8px; margin: 0; }
          .otp-note { font-size: 12px; color: #73796F; margin: 8px 0 0; }
          .footer { background: #FAFAF5; padding: 20px 32px; text-align: center; border-top: 1px solid #E3E3DE; }
          .footer p { font-size: 11px; color: #73796F; margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>THAO NGUYEN RESORT</h1>
            <p>PASSWORD RECOVERY</p>
          </div>
          <div class="body">
            <h2>Hello, ${fullName}</h2>
            <p>We received a request to reset the password for your account.</p>
            <p>Use the following code to proceed:</p>
            <div class="otp-box">
              <p class="otp-code">${otp}</p>
              <p class="otp-note">This code expires in ${process.env.OTP_EXPIRE_MINUTES || 5} minutes</p>
            </div>
            <p>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Thao Nguyen Resort · Moc Chau, Vietnam</p>
            <p>This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail, sendResetPasswordEmail };
