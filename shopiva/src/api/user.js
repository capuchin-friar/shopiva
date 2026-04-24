import { apiFetchAuth } from './client';
import { getApiBaseUrl } from './config';

/**
 * @param {unknown} data
 * @param {Response} res
 */
function pickError(data, res) {
  if (data && typeof data === 'object' && 'error' in data && data.error != null) {
    return String(/** @type {{ error?: string }} */ (data).error);
  }
  if (data && typeof data === 'object' && 'message' in data && data.message != null) {
    return String(/** @type {{ message?: string }} */ (data).message);
  }
  return `Request failed (HTTP ${res.status})`;
}

/**
 * Same request as {@link fetchCurrentUser}, with HTTP status for auth bootstrap.
 * @returns {Promise<{ ok: boolean; status: number; user: object | null; message: string }>}
 */
export async function fetchCurrentUserOrStatus() {
  const res = await apiFetchAuth('/user/authorization', {
    method: 'POST',
    body: '{}',
  });
  const data = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    status: res.status,
    user: res.ok ? /** @type {object | null} */ (data.data ?? null) : null,
    message: pickError(data, res),
  };
}

/** Current profile (same shape as middleware `authenticateUser`). */
export async function fetchCurrentUser() {
  const r = await fetchCurrentUserOrStatus();
  return r.user;
}

/**
 * @param {number} userId
 * @param {string} role – app roles: `customer` | `vendor` (API may still expect `entrepreneur` for vendor)
 */
export async function updateUserRole(userId, role) {
  const normalizedRole =
    String(role ?? '').trim().toLowerCase() === 'vendor' ? 'entrepreneur' : 'customer';
  const res = await apiFetchAuth(`/user/role/update/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ role: normalizedRole }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, message: pickError(data, res) };
  }
  return {
    ok: true,
    user: /** @type {object | undefined} */ (
      /** @type {{ user?: object }} */ (data).user
    ),
  };
}

/**
 * @param {number} userId
 * @param {string} phone – WhatsApp / phone (digits or E.164)
 */
export async function updateUserPhone(userId, phone) {
  const res = await apiFetchAuth(`/user/phone/update/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ phone }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, message: pickError(data, res) };
  }
  return {
    ok: true,
    user: /** @type {object | undefined} */ (
      /** @type {{ user?: object }} */ (data).user
    ),
  };
}

/**
 * @param {number} userId
 * @param {{ gender?: string; location?: { city?: string; state?: string; country?: string } }} fields
 */
export async function updateUserProfileFields(userId, fields) {
  const res = await apiFetchAuth(`/user/profile/update/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(fields),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, message: pickError(data, res) };
  }
  return {
    ok: true,
    user: /** @type {object | undefined} */ (
      /** @type {{ user?: object }} */ (data).user
    ),
  };
}

/** Debug: open in browser — `await pingApi()` */
export async function pingApi() {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/health`);
  return res.ok;
}
