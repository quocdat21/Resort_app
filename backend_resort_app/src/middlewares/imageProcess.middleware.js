const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const processImage = async (req, res, next) => {
  if (!req.file) return next();

  const filePath = req.file.path;
  const ext = path.extname(req.file.filename).toLowerCase();

  // Kiểm tra nếu là định dạng HEIC/HEIF hoặc đơn giản là muốn convert tất cả về JPG để đồng nhất
  if (ext === '.heic' || ext === '.heif') {
    const newFilename = req.file.filename.replace(ext, '.jpg');
    const newPath = filePath.replace(ext, '.jpg');

    try {
      // Dùng sharp để convert sang jpeg
      await sharp(filePath)
        .rotate() // Tự động xoay ảnh dựa trên EXIF
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(newPath);

      // Xóa file gốc (HEIC)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Cập nhật lại thông tin file trong req.file để controller sử dụng tên file mới (.jpg)
      req.file.path = newPath;
      req.file.filename = newFilename;
      req.file.mimetype = 'image/jpeg';
      
      console.log(`✅ Đã convert ${req.file.originalname} sang JPG`);
    } catch (error) {
      console.error('❌ Lỗi khi xử lý ảnh với Sharp:', error);
      // Nếu có lỗi trong quá trình convert, ta vẫn cho qua để controller xử lý file gốc (nếu có thể)
      // Hoặc bạn có thể trả về lỗi tùy ý
    }
  }

  next();
};

module.exports = processImage;
