export const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
};
