import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Automatically prefix /api and /uploads with VITE_SERVER_URL if deployed on Vercel/external CDN
const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;
if (VITE_SERVER_URL && typeof window !== 'undefined') {
  const normalizedServer = VITE_SERVER_URL.replace(/\/$/, '');
  const originalFetch = window.fetch;
  window.fetch = function (resource, init) {
    if (typeof resource === 'string' && (resource.startsWith('/api') || resource.startsWith('/uploads'))) {
      resource = `${normalizedServer}${resource}`;
    }
    return originalFetch(resource, init);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
