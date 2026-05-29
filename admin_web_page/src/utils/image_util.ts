const CLOUDINARY_BASE_URL =
  (import.meta.env.VITE_CLOUDINARY_BASE_URL || '').replace(/\/$/, '');

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '') || 'http://localhost:3000').replace(/\/$/, '');

export const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';

  const uploadsIndex = url.indexOf('/uploads/');

  // Nếu backend đã trả full URL /uploads từ Render/ngrok/local, vẫn ưu tiên Cloudinary.
  if (CLOUDINARY_BASE_URL && uploadsIndex !== -1) {
    return `${CLOUDINARY_BASE_URL}${url.substring(uploadsIndex)}`;
  }

  // Nếu DB đã lưu full URL Cloudinary hoặc URL ảnh online khác.
  if (url.startsWith('http')) return url;

  // Nếu DB đang lưu dạng /uploads/rooms/abc.jpg
  // thì ưu tiên lấy ảnh từ Cloudinary khi deploy
  if (CLOUDINARY_BASE_URL && url.startsWith('/uploads/')) {
    return `${CLOUDINARY_BASE_URL}${url}`;
  }

  // Fallback khi chạy local/backend static
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};
