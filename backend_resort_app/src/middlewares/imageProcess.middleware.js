const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const processSingleFile = async (file) => {
  if (!file) return;

  const filePath = file.path;
  const ext = path.extname(file.filename).toLowerCase();

  // Kiểm tra nếu là định dạng HEIC/HEIF hoặc đơn giản là muốn convert tất cả về JPG để đồng nhất
  if (ext === '.heic' || ext === '.heif') {
    const newFilename = file.filename.replace(ext, '.jpg');
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

      // Cập nhật lại thông tin file để controller sử dụng tên file mới (.jpg)
      file.path = newPath;
      file.filename = newFilename;
      file.mimetype = 'image/jpeg';
      
      console.log(`✅ Đã convert ${file.originalname} sang JPG`);
    } catch (error) {
      console.error('❌ Lỗi khi xử lý ảnh với Sharp:', error);
    }
  }
};

const processImage = async (req, res, next) => {
  try {
    // Handle single file upload (req.file)
    if (req.file) {
      await processSingleFile(req.file);
    }

    // Handle multiple fields/files upload (req.files)
    if (req.files) {
      // If it's an array (from upload.array())
      if (Array.isArray(req.files)) {
        for (const file of req.files) {
          await processSingleFile(file);
        }
      } 
      // If it's an object with fields (from upload.fields())
      else {
        for (const fieldname in req.files) {
          for (const file of req.files[fieldname]) {
            await processSingleFile(file);
          }
        }
      }
    }

    next();
  } catch (error) {
    console.error('❌ Lỗi middleware xử lý ảnh:', error);
    next();
  }
};

module.exports = processImage;
