import { NativeModules, Platform } from 'react-native';

/**
 * Default API port — keep in sync with `node/.env` (`PORT=...`).
 * @type {string}
 */
export const API_DEFAULT_PORT = '3456';

/**
 * Optional full base URL override (e.g. staging or when auto-detection is wrong):
 * `import { setApiBaseUrlOverride } from './api/config';`
 * `setApiBaseUrlOverride('http://192.168.1.10:3456');`
 */
let baseUrlOverride = null;

/** @param {string | null | undefined} url - e.g. http://192.168.0.5:3456 — trailing slash stripped; null clears */
export function setApiBaseUrlOverride(url) {
  baseUrlOverride = url && String(url).trim() ? String(url).trim().replace(/\/$/, '') : null;
}

export function getApiBaseUrlOverride() {
  return baseUrlOverride;
}

/**
 * Metro serves the bundle from `http://HOST:8081/...`. On a physical phone, HOST is your
 * machine's LAN IP. Safari / in-app OAuth must load `http://HOST:3456/...`, not `localhost`
 * (localhost on the phone is the phone itself → "can't connect to the server").
 * @returns {string | null}
 */
function getLanHostFromMetroBundleUrl() {
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (typeof scriptURL !== 'string' || !scriptURL.startsWith('http')) {
      return null;
    }
    const m = scriptURL.match(/^https?:\/\/([^/:?]+)/i);
    if (!m?.[1]) return null;
    const host = m[1];
    if (host === 'localhost' || host === '127.0.0.1') {
      return null;
    }
    return host;
  } catch {
    return null;
  }
}

/**
 * Base URL for the Shopiva Node API (`../node`).
 * - Simulator + Metro at localhost → `http://localhost:3456`
 * - Emulator → `http://10.0.2.2:3456`
 * - Physical device + Metro over Wi‑Fi → same host as Metro (LAN IP), so OAuth URLs work in Safari
 *
 * Production / release builds: use {@link setApiBaseUrlOverride} or point Metro host correctly.
 */
export function getApiBaseUrl() {
  if (baseUrlOverride) {
    return baseUrlOverride;
  }

  const metroHost = getLanHostFromMetroBundleUrl();
  if (metroHost) {
    return `http://${metroHost}:${API_DEFAULT_PORT}`;
  }

  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${host}:${API_DEFAULT_PORT}`;
}
