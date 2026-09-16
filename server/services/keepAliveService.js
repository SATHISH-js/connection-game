const https = require('https');
const http = require('http');
const { URL } = require('url');

class KeepAliveService {
  constructor() {
    this.intervalId = null;
    this.bootTimeoutId = null;
    this.intervalMinutes = 10; // Default: 10 minutes (well under Render's 15-minute sleep)
    this.isEnabled = true;
    this.targetUrl = '';
    this.isAutoDetected = false;
    this.lastPingAt = null;
    this.lastPingStatus = null;
    this.lastPingLatency = null;
    this.logs = []; // Max 25 circular log entries
    this.storageRef = null;
  }

  async init(storage) {
    this.storageRef = storage;

    // 1. Try to get saved keep-alive settings from storage
    try {
      if (storage && typeof storage.getSettings === 'function') {
        const settings = await storage.getSettings();
        if (settings) {
          if (settings.keepAliveEnabled !== undefined) {
            this.isEnabled = Boolean(settings.keepAliveEnabled);
          }
          if (settings.keepAliveIntervalMinutes !== undefined) {
            const mins = Number(settings.keepAliveIntervalMinutes);
            if (!isNaN(mins) && mins >= 3 && mins <= 14) {
              this.intervalMinutes = mins;
            }
          }
          if (settings.keepAliveUrl && typeof settings.keepAliveUrl === 'string' && settings.keepAliveUrl.trim()) {
            this.targetUrl = settings.keepAliveUrl.trim();
          }
        }
      }
    } catch (e) {
      console.warn('[KeepAlive] Could not load saved settings from storage:', e.message);
    }

    // 2. Check environment variable from Render
    // Render automatically provides RENDER_EXTERNAL_URL (e.g. https://my-app.onrender.com)
    const envRenderUrl = process.env.RENDER_EXTERNAL_URL || process.env.RENDER_URL;
    if (!this.targetUrl && envRenderUrl) {
      this.targetUrl = envRenderUrl.replace(/\/$/, '');
      this.isAutoDetected = true;
      console.log(`[KeepAlive] Auto-detected Render external URL: ${this.targetUrl}`);
    }

    if (this.isEnabled) {
      this.start();
    }
  }

  /**
   * Captures host header from incoming requests (e.g. if user accesses https://my-app.onrender.com)
   */
  detectFromRequest(req) {
    if (this.targetUrl) return;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    if (!host) return;

    if (host.includes('onrender.com') || host.includes('render.com')) {
      const proto = req.headers['x-forwarded-proto'] || 'https';
      this.targetUrl = `${proto}://${host}`;
      this.isAutoDetected = true;
      console.log(`[KeepAlive] Locked onto Render URL from host traffic: ${this.targetUrl}`);
      if (this.isEnabled && !this.intervalId) {
        this.start();
      }
    }
  }

  start() {
    this.stop();
    if (!this.isEnabled) return;

    console.log(`[KeepAlive] ⚡ 24/7 Anti-Sleep engine active. Interval: ${this.intervalMinutes}m`);

    // Initial ping after 30 seconds to let the server finish boot
    this.bootTimeoutId = setTimeout(() => {
      this.pingNow().catch(() => {});
    }, 30000);

    const ms = this.intervalMinutes * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.pingNow().catch(() => {});
    }, ms);
  }

  stop() {
    if (this.bootTimeoutId) {
      clearTimeout(this.bootTimeoutId);
      this.bootTimeoutId = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[KeepAlive] Anti-Sleep engine stopped.');
    }
  }

  async updateConfig({ isEnabled, targetUrl, intervalMinutes }) {
    if (isEnabled !== undefined) this.isEnabled = Boolean(isEnabled);
    if (targetUrl !== undefined) {
      this.targetUrl = String(targetUrl).trim().replace(/\/$/, '');
      this.isAutoDetected = false;
    }
    if (intervalMinutes !== undefined) {
      const mins = Number(intervalMinutes);
      if (!isNaN(mins) && mins >= 3 && mins <= 14) {
        this.intervalMinutes = mins;
      }
    }

    // Save to storage
    if (this.storageRef && typeof this.storageRef.updateSettings === 'function') {
      try {
        await this.storageRef.updateSettings({
          keepAliveEnabled: this.isEnabled,
          keepAliveUrl: this.targetUrl,
          keepAliveIntervalMinutes: this.intervalMinutes
        });
      } catch (e) {
        console.warn('[KeepAlive] Error saving config to storage:', e.message);
      }
    }

    if (this.isEnabled) {
      this.start();
    } else {
      this.stop();
    }

    return this.getStatus();
  }

  async pingNow() {
    let pingUrl = this.targetUrl;

    // If no public URL is known yet, ping localhost:PORT/api/health
    if (!pingUrl) {
      const port = process.env.PORT || 5000;
      pingUrl = `http://127.0.0.1:${port}`;
    }

    const fullUrl = pingUrl.endsWith('/api/health') ? pingUrl : `${pingUrl}/api/health`;
    const startTime = Date.now();

    return new Promise((resolve) => {
      try {
        const parsed = new URL(fullUrl);
        const client = parsed.protocol === 'https:' ? https : http;

        const req = client.get(
          fullUrl,
          {
            headers: {
              'User-Agent': 'Render-AntiSleep-KeepAlive/2.0 (+https://render.com)',
              'Cache-Control': 'no-cache'
            },
            timeout: 15000
          },
          (res) => {
            const latency = Date.now() - startTime;
            const statusCode = res.statusCode || 200;
            const isSuccess = statusCode >= 200 && statusCode < 400;

            this.lastPingAt = new Date().toISOString();
            this.lastPingStatus = statusCode;
            this.lastPingLatency = latency;

            this._addLog({
              timestamp: this.lastPingAt,
              url: fullUrl,
              statusCode,
              latency,
              success: isSuccess,
              message: isSuccess
                ? 'Active (200 OK) — Render idle timer reset'
                : `HTTP ${statusCode}`
            });

            res.resume();
            resolve({ success: isSuccess, statusCode, latency, url: fullUrl });
          }
        );

        req.on('timeout', () => {
          req.destroy();
          const latency = Date.now() - startTime;
          this.lastPingAt = new Date().toISOString();
          this.lastPingStatus = 408;
          this.lastPingLatency = latency;

          this._addLog({
            timestamp: this.lastPingAt,
            url: fullUrl,
            statusCode: 408,
            latency,
            success: false,
            message: 'Request timed out (15s)'
          });
          resolve({ success: false, statusCode: 408, latency, error: 'Timeout' });
        });

        req.on('error', (err) => {
          const latency = Date.now() - startTime;
          this.lastPingAt = new Date().toISOString();
          this.lastPingStatus = 500;
          this.lastPingLatency = latency;

          this._addLog({
            timestamp: this.lastPingAt,
            url: fullUrl,
            statusCode: 500,
            latency,
            success: false,
            message: err.message
          });
          resolve({ success: false, statusCode: 500, latency, error: err.message });
        });
      } catch (err) {
        const latency = Date.now() - startTime;
        this.lastPingAt = new Date().toISOString();
        this.lastPingStatus = 500;
        this.lastPingLatency = latency;

        this._addLog({
          timestamp: this.lastPingAt,
          url: fullUrl,
          statusCode: 500,
          latency,
          success: false,
          message: err.message
        });
        resolve({ success: false, statusCode: 500, latency, error: err.message });
      }
    });
  }

  _addLog(entry) {
    this.logs.unshift(entry);
    if (this.logs.length > 25) {
      this.logs.pop();
    }
  }

  getStatus() {
    const nextPingMs = this.lastPingAt
      ? Math.max(0, new Date(this.lastPingAt).getTime() + this.intervalMinutes * 60 * 1000 - Date.now())
      : this.intervalMinutes * 60 * 1000;

    return {
      isEnabled: this.isEnabled,
      isRunning: Boolean(this.intervalId),
      targetUrl: this.targetUrl,
      isAutoDetected: this.isAutoDetected,
      intervalMinutes: this.intervalMinutes,
      lastPingAt: this.lastPingAt,
      lastPingStatus: this.lastPingStatus,
      lastPingLatency: this.lastPingLatency,
      nextPingInSeconds: Math.round(nextPingMs / 1000),
      logs: this.logs
    };
  }
}

const keepAliveService = new KeepAliveService();
module.exports = { keepAliveService };
