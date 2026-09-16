/**
 * Media URL Resolver for Connection Game
 * Handles /uploads/... paths across local dev, single-server Render deployments,
 * and converts cloud share links (Google Drive, Dropbox, GitHub) into direct streaming image URLs.
 */

/**
 * Normalizes cloud share links into direct image binary streams.
 * Handles Google Drive, Dropbox, and GitHub blob URLs.
 */
export function normalizeMediaUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();

  // Normalize Windows backslashes
  if (url.includes('\\uploads\\')) {
    url = url.replace(/\\+/g, '/');
  }

  // 1. Google Drive Share Links:
  // e.g. https://drive.google.com/file/d/1w6vA-1xXwO-0z9yL5kQ8/view?usp=sharing
  // or https://drive.google.com/open?id=1w6vA-1xXwO-0z9yL5kQ8
  // or https://drive.google.com/uc?id=1w6vA-1xXwO-0z9yL5kQ8
  const gDriveMatch = url.match(/drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)|open\?id=([a-zA-Z0-9_-]+)|uc\?(?:[^&]*&)*id=([a-zA-Z0-9_-]+))/i);
  if (gDriveMatch) {
    const fileId = gDriveMatch[1] || gDriveMatch[2] || gDriveMatch[3];
    if (fileId) {
      // lh3.googleusercontent.com/d/FILE_ID serves direct high-res image bytes without CORS/login block
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // 2. Dropbox Links:
  // e.g. https://www.dropbox.com/s/xyz/photo.jpg?dl=0 -> replace dl=0 with raw=1
  if (url.includes('dropbox.com/s/')) {
    if (url.includes('?dl=0')) {
      return url.replace('?dl=0', '?raw=1');
    }
    if (!url.includes('?raw=1') && !url.includes('&raw=1')) {
      return url.includes('?') ? `${url}&raw=1` : `${url}?raw=1`;
    }
  }

  // 3. GitHub Blob Links:
  // e.g. https://github.com/user/repo/blob/branch/image.png -> raw.githubusercontent.com
  const ghMatch = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i);
  if (ghMatch) {
    return `https://raw.githubusercontent.com/${ghMatch[1]}/${ghMatch[2]}/${ghMatch[3]}/${ghMatch[4]}`;
  }

  return url;
}

/**
 * Resolves relative /uploads paths to full absolute URLs when needed.
 */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const normalized = normalizeMediaUrl(url);

  if (
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('data:') ||
    normalized.startsWith('blob:')
  ) {
    return normalized;
  }

  const cleanPath = normalized.startsWith('/') ? normalized : `/${normalized}`;

  const envServer = import.meta.env.VITE_SERVER_URL;
  if (envServer) {
    const base = envServer.replace(/\/$/, '');
    return `${base}${cleanPath}`;
  }

  // If on dev port 3000/5173 without proxy or external access, point to :5000
  if (typeof window !== 'undefined') {
    const isDevPort = window.location.port === '3000' || window.location.port === '5173';
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDevPort && !isLocal && cleanPath.startsWith('/uploads')) {
      return `${window.location.protocol}//${window.location.hostname}:5000${cleanPath}`;
    }
  }

  return cleanPath;
}

/**
 * Helper to check if a URL or string explicitly represents a video format.
 */
export function isVideoMedia(url) {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();
  return (
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(clean) ||
    clean.startsWith('data:video/')
  );
}

/**
 * Helper to check if a URL or string explicitly represents an image format.
 */
export function isImageMedia(url) {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();
  return (
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif)(\?.*)?$/i.test(clean) ||
    clean.startsWith('data:image/') ||
    clean.includes('images.unsplash.com') ||
    clean.includes('googleusercontent.com')
  );
}
