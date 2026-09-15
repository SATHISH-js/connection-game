/**
 * Media URL Resolver for Connection Game
 * Ensures /uploads/... and media paths resolve correctly across
 * local dev, single-server Render deployments, and split Vercel/Render architectures.
 */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const envServer = import.meta.env.VITE_SERVER_URL;
  if (envServer) {
    const base = envServer.replace(/\/$/, '');
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${base}${cleanPath}`;
  }

  // If on dev port 3000/5173 without proxy or external access, point to :5000
  if (typeof window !== 'undefined') {
    const isDevPort = window.location.port === '3000' || window.location.port === '5173';
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDevPort && !isLocal && trimmed.startsWith('/uploads')) {
      return `${window.location.protocol}//${window.location.hostname}:5000${trimmed}`;
    }
  }

  return trimmed;
}
