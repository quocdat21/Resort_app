const formatImageUrl = (path, req) => {
  if (!path) return null;

  const cloudinaryBaseUrl = process.env.CLOUDINARY_BASE_URL || '';
  
  const host = req ? req.get('host') : null;
  const protocol = req ? req.protocol : 'http';
  const resolvedBaseUrl = host ? `${protocol}://${host}` : (process.env.BASE_URL || 'http://localhost:3000');

  if (path.startsWith('http')) {
    if (cloudinaryBaseUrl) {
      const uploadsIndex = path.indexOf('/uploads/');
      if (uploadsIndex !== -1 && !path.startsWith(cloudinaryBaseUrl)) {
        return `${cloudinaryBaseUrl.replace(/\/$/, '')}${path.substring(uploadsIndex)}`;
      }
    }

    if (path.includes('localhost:3000') || path.includes('127.0.0.1:3000')) {
      return path.replace(/http:\/\/(localhost|127\.0\.0\.1):3000/, resolvedBaseUrl);
    }
    return path;
  }

  if (cloudinaryBaseUrl && path.startsWith('/uploads/')) {
    return `${cloudinaryBaseUrl.replace(/\/$/, '')}${path}`;
  }

  return `${resolvedBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const normalizeStoredImagePath = (url) => {
  if (!url) return url;

  const uploadsIndex = url.indexOf('/uploads/');
  if (uploadsIndex !== -1) {
    return url.substring(uploadsIndex);
  }

  return url;
};

const deleteLocalImageIfExists = (url) => {
  const fs = require('fs');
  const storedPath = normalizeStoredImagePath(url);

  if (!storedPath || !storedPath.startsWith('/uploads/')) return;

  const filePath = `./${storedPath.substring(1)}`;
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

module.exports = {
  formatImageUrl,
  normalizeStoredImagePath,
  deleteLocalImageIfExists
};
