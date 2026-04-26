const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình nơi lưu trữ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dir = 'uploads/general';
    if (file.fieldname === 'avatar') dir = 'uploads/users';
    if (file.fieldname === 'icon') dir = 'uploads/categories';
    if (file.fieldname === 'mainImage' || file.fieldname === 'secondaryImages') dir = 'uploads/rooms';

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    let prefix = file.fieldname;
    if (file.fieldname === 'mainImage') {
      prefix = 'pr-' + file.fieldname;
    }
    cb(null, prefix + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Kiểm tra định dạng file
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|heic|heif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  // Multer mimetype có thể không nhận diện được HEIC một cách nhất quán trên mọi môi trường
  // Nên ta chủ yếu dựa vào extname hoặc bỏ qua check mimetype cho HEIC
  const mimetype = allowedTypes.test(file.mimetype) || file.originalname.toLowerCase().endsWith('.heic') || file.originalname.toLowerCase().endsWith('.heif');

  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, webp, heic)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 50 // Giới hạn 50MB cho ảnh chất lượng cao
  },
  fileFilter: fileFilter
});

module.exports = upload;
