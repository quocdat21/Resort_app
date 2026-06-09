const nodemailer = require('nodemailer');
require('dotenv').config();

// const emailPort = parseInt(process.env.EMAIL_PORT, 10) || 587;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Old SMTP config kept for reference.
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//   port: emailPort,
//   secure: emailPort === 465,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// Verify transporter on startup
transporter.verify()
  .then(() => console.log('✅ Email transporter ready'))
  .catch((err) => console.error('⚠️  Email transporter error:', err.message));

module.exports = transporter;
