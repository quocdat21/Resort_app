const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const processSingleFile = async (file) => {
  if (!file) return;

  // Chỉ xử lý nếu là file ảnh
  if (!file.mimetype.startsWith('image/') && !file.originalname.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)) return;

  const filePath = file.path;
  const ext = path.extname(file.filename).toLowerCase();

  // Chuẩn hóa tất cả ảnh về định dạng .jpg để tối ưu dung lượng và dễ quản lý
  const newFilename = file.filename.replace(ext, '.jpg');
  const newPath = filePath.replace(ext, '.jpg');
  const tempPath = filePath + '.tmp';

  try {
    // Dùng sharp để nén ảnh:
    // - rotate: tự động xoay theo EXIF
    // - resize: giới hạn tối đa 1920x1920, không phóng to ảnh nhỏ
    // - jpeg(80): giảm chất lượng xuống 80% (mắt thường khó phân biệt nhưng giảm dung lượng cực lớn từ 50MB xuống vài trăm KB)
    await sharp(filePath)
      .rotate() 
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .toFormat('jpeg')
      .jpeg({ quality: 80, progressive: true })
      .toFile(tempPath);

    // Xóa file gốc đã upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Đổi tên file tạm thành file mới (có đuôi .jpg)
    fs.renameSync(tempPath, newPath);

    // Cập nhật lại thông tin file trong object req.files để controller sử dụng đúng
    file.path = newPath;
    file.filename = newFilename;
    file.mimetype = 'image/jpeg';
      
    console.log(`✅ Đã nén và convert ${file.originalname} sang JPG`);
  } catch (error) {
    console.error(`❌ Lỗi khi xử lý ảnh ${file.originalname} với Sharp:`, error);
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
