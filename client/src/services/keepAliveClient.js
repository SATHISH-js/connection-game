/**
 * Client-side Keep-Alive Service
 * Sends lightweight heartbeats to /api/health every 3 minutes while the browser tab is open.
 * Also provides API helpers for the SettingsPage Keep-Alive Manager.
 */

let heartbeatInterval = null;

export function startKeepAliveHeartbeat() {
  if (heartbeatInterval) return;

  // Immediate initial check
  fetchHealth();

  // Ping every 3 minutes (180,000 ms) while tab is open
  heartbeatInterval = setInterval(fetchHealth, 180000);
}

export function stopKeepAliveHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

async function fetchHealth() {
  try {
    await fetch('/api/health', {
      headers: { 'Cache-Control': 'no-cache' }
    });
  } catch {
    // Ignore network dropouts in heartbeat
  }
}

export async function getKeepAliveStatus() {
  const res = await fetch('/api/settings/keep-alive');
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch keep-alive status');
  return data.data;
}

export async function updateKeepAliveConfig(config, pin) {
  const res = await fetch('/api/settings/keep-alive', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-host-pin': pin || '1234'
    },
    body: JSON.stringify(config)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update keep-alive config');
  return data.data;
}

export async function testKeepAlivePing(pin) {
  const res = await fetch('/api/settings/keep-alive/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-host-pin': pin || '1234'
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to test keep-alive ping');
  return data.data;
}
