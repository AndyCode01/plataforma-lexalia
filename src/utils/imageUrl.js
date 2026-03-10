export const normalizeImageUrl = (url) => {
  if (!url) return url;
  if (typeof window === 'undefined') return url;

  if (url.startsWith('http://localhost:4000')) {
    return url.replace('http://localhost:4000', window.location.origin);
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith('/uploads/')) {
    return `${window.location.origin}${url}`;
  }

  if (url.startsWith('uploads/')) {
    return `${window.location.origin}/${url}`;
  }

  // Backward compatibility for rows that only stored the filename.
  return `${window.location.origin}/uploads/${url.replace(/^\/+/, '')}`;
};
