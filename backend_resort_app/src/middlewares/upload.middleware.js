const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Cấu hình nơi lưu trữ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dir = 'uploads/general';
    if (file.fieldname === 'avatar') dir = 'uploads/users';
    if (file.fieldname === 'icon') {
      if (req.originalUrl.includes('amenities')) {
        dir = 'uploads/amenities';
      } else {
        dir = 'uploads/categories';
      }
    }
    if (file.fieldname === 'mainImage' || file.fieldname === 'secondaryImages') dir = 'uploads/rooms';
    if (file.fieldname === 'main_image' || file.fieldname === 'secondary_images') dir = 'uploads/services';

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    let prefix = file.fieldname;
    if (file.fieldname === 'mainImage' || file.fieldname === 'main_image') {
      prefix = 'pr-' + file.fieldname;
    }
    // Note: We'll convert to JPEG in optimizeImages, but for now we keep the original extension or .jpg
    // to match what the original file might be before sharp processes it.
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
    fileSize: 1024 * 1024 * 200
  },
  fileFilter: fileFilter
});

module.exports = upload;
