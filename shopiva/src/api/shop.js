import { apiFetchAuth } from './client';

/**
 * @param {Response} res
 * @returns {Promise<Record<string, unknown>>}
 */
async function readJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const hint =
      data?.error ||
      data?.message ||
      (typeof data?.details === 'string' ? data.details : null) ||
      `Request failed (HTTP ${res.status})`;
    throw new Error(String(hint));
  }
  return data;
}

/** @returns {Promise<boolean>} */
export async function hasVendorShop() {
  const res = await apiFetchAuth('/shop/has-shop', { method: 'GET' });
  const data = await readJson(res);
  return Boolean(data.hasShop);
}

/**
 * @param {{
 *   name: string;
 *   vendorType: 'reseller' | 'dropshipper' | 'manufacturer';
 *   location?: {
 *     address?: string;
 *     city?: string;
 *     state?: string;
 *     country?: string;
 *     zipcode?: string;
 *     coordinates?: { lat: number; lng: number };
 *   } | null;
 * }} payload
 */
export async function createVendorShop(payload) {
  const body = {
    name: String(payload.name ?? '').trim(),
    vendorType: payload.vendorType,
    location: payload.location ?? null,
  };
  const res = await apiFetchAuth('/shop/create', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return readJson(res);
}

/** @param {number | string} userId */
export async function fetchOwnerShops(userId) {
  const uid = Number(userId);
  if (!Number.isFinite(uid) || uid <= 0) {
    throw new Error('Invalid user');
  }
  const res = await apiFetchAuth(`/shop/owner/${uid}`, { method: 'GET' });
  const data = await readJson(res);
  return Array.isArray(data.shops) ? data.shops : [];
}

/**
 * Orders for a shop (vendor dashboard / order list).
 * @param {number | string} shopId
 * @param {number | string} userId
 * @returns {Promise<unknown[]>}
 */
export async function fetchShopOrders(shopId, userId) {
  const res = await apiFetchAuth(`/shop/${shopId}/orders/${userId}`, { method: 'GET' });
  const data = await readJson(res);
  return Array.isArray(data.orders) ? data.orders : [];
}

/**
 * @param {number | string} shopId
 * @param {number | string} userId
 * @returns {Promise<Record<string, unknown> | null>}
 */
export async function fetchShopPayoutAccount(shopId, userId) {
  const res = await apiFetchAuth(`/shop/payment/${shopId}/${userId}`, { method: 'GET' });
  const data = await readJson(res);
  const row = data.payoutAccount;
  if (row == null || typeof row !== 'object') return null;
  return /** @type {Record<string, unknown>} */ (row);
}

/**
 * @param {number | string} userId
 * @returns {Promise<Record<string, unknown>[]>}
 */
export async function fetchPayoutBanks(userId) {
  const res = await apiFetchAuth(`/shop/payment/banks/${userId}`, { method: 'GET' });
  const data = await readJson(res);
  return Array.isArray(data.banks) ? data.banks : [];
}

/**
 * @param {number | string} userId
 * @param {string} accountNumber
 * @param {string} bankCode
 */
export async function verifyPayoutAccount(userId, accountNumber, bankCode) {
  const q = new URLSearchParams({
    account_number: String(accountNumber).trim(),
    bank_code: String(bankCode).trim(),
  });
  const res = await apiFetchAuth(`/shop/payment/verify/${userId}?${q.toString()}`, { method: 'GET' });
  return readJson(res);
}

/**
 * @param {number | string} shopId
 * @param {number | string} userId
 * @param {{
 *   bank_name: string;
 *   bank_code: string;
 *   account_name: string;
 *   account_number: string;
 * }} body
 */
export async function createShopPayoutAccount(shopId, userId, body) {
  const res = await apiFetchAuth(`/shop/payment/${shopId}/${userId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return readJson(res);
}

/**
 * @param {number | string} shopId
 * @param {number | string} userId
 * @param {{
 *   bank_name: string;
 *   bank_code: string;
 *   account_name: string;
 *   account_number: string;
 * }} body
 */
export async function updateShopPayoutAccount(shopId, userId, body) {
  const res = await apiFetchAuth(`/shop/payment/${shopId}/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return readJson(res);
}

/**
 * @param {number | string} shopId
 * @param {number | string} userId
 */
export async function deleteShopPayoutAccount(shopId, userId) {
  const res = await apiFetchAuth(`/shop/payment/${shopId}/${userId}`, { method: 'DELETE' });
  return readJson(res);
}
