const CLOUDINARY_BASE_URL =
  import.meta.env.VITE_CLOUDINARY_BASE_URL || '';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';

  // Nếu DB đã lưu full URL Cloudinary hoặc URL ảnh online
  if (url.startsWith('http')) return url;

  // Nếu DB đang lưu dạng /uploads/rooms/abc.jpg
  // thì ưu tiên lấy ảnh từ Cloudinary khi deploy
  if (CLOUDINARY_BASE_URL && url.startsWith('/uploads/')) {
    return `${CLOUDINARY_BASE_URL}${url}`;
  }

  // Fallback khi chạy local/backend static
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};