const formatImageUrl = (path, req) => {
  if (!path) return null;
  
  const host = req ? req.get('host') : null;
  const protocol = req ? req.protocol : 'http';
  const resolvedBaseUrl = host ? `${protocol}://${host}` : (process.env.BASE_URL || 'http://localhost:3000');

  if (path.startsWith('http')) {
    // If it's already a full URL, check if it's localhost and we need to replace it with current host
    if (path.includes('localhost:3000') || path.includes('127.0.0.1:3000')) {
      return path.replace(/http:\/\/(localhost|127\.0\.0\.1):3000/, resolvedBaseUrl);
    }
    return path;
  }

  return `${resolvedBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

module.exports = {
  formatImageUrl
};
