import { getStoredAccessToken } from '../auth/session';
import { notifyUnauthorized } from '../auth/unauthorized';
import { getApiBaseUrl } from './config';

/**
 * Same as {@link apiFetch}, but attaches `Authorization: Bearer <token>` when a session exists.
 * @param {string} path
 * @param {RequestInit} [options]
 */
export async function apiFetchAuth(path, options = {}) {
  const token = await getStoredAccessToken();
  const prev = options.headers && typeof options.headers === 'object' && !(options.headers instanceof Headers)
    ? /** @type {Record<string, string>} */ ({ ...options.headers })
    : {};
  const headers = { ...prev };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await apiFetch(path, { ...options, headers });
  if (token && res.status === 401) {
    notifyUnauthorized();
  }
  return res;
}

/**
 * JSON fetch against the Node server (no Next `/api/backend` proxy — RN talks to Node directly).
 * @param {string} path - Absolute path on API host, e.g. `/discover/vendors-on-map?category=fashion`
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
  const base = getApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${normalized}`;
  const { headers: optionHeaders, ...rest } = options;
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(optionHeaders && typeof optionHeaders === 'object' && !(optionHeaders instanceof Headers)
      ? optionHeaders
      : {}),
  };
  return fetch(url, {
    ...rest,
    headers,
  });
}
