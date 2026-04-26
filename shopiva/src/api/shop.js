import { apiFetchAuth, apiFetchAuthMultipart } from './client';

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
 * Full shop row for editing (vendor). GET /shop/:shopId/:userId
 * @param {number | string} shopId
 * @param {number | string} userId
 * @returns {Promise<Record<string, unknown>>}
 */
export async function fetchShopDetails(shopId, userId) {
  const sid = String(shopId).trim();
  const uid = String(userId).trim();
  const res = await apiFetchAuth(`/shop/${encodeURIComponent(sid)}/${encodeURIComponent(uid)}`, {
    method: 'GET',
  });
  const data = await readJson(res);
  const shop = data.shop;
  if (shop == null || typeof shop !== 'object') {
    throw new Error('Shop not found');
  }
  return /** @type {Record<string, unknown>} */ (shop);
}

/**
 * Update shop profile. POST /shop/update/:shopId/:userId
 * @param {number | string} shopId
 * @param {number | string} userId
 * @param {Record<string, unknown>} body
 */
export async function updateVendorShop(shopId, userId, body) {
  const res = await apiFetchAuth(
    `/shop/update/${encodeURIComponent(String(shopId))}/${encodeURIComponent(String(userId))}`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
  return readJson(res);
}

/**
 * Record BVN (11 digits) for the shop; server validates format and stores masked last4 only.
 * POST /shop/patch/:shopId/verify-bvn
 * @param {number | string} shopId
 * @param {string} bvnDigits
 */
export async function verifyShopBvn(shopId, bvnDigits) {
  const digits = String(bvnDigits ?? '').replace(/\D/g, '');
  const res = await apiFetchAuth(`/shop/patch/${encodeURIComponent(String(shopId))}/verify-bvn`, {
    method: 'POST',
    body: JSON.stringify({ bvn: digits }),
  });
  return readJson(res);
}

/**
 * Upload ID / CAC / proof-of-address file to Cloudinary via API (requires server env).
 * POST /shop/:shopId/verification-upload (multipart field `file`)
 * @param {number | string} shopId
 * @param {{ uri: string; name: string; type: string }} file
 * @returns {Promise<{ url: string; publicId?: string }>}
 */
export async function uploadShopVerificationDocument(shopId, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await apiFetchAuthMultipart(`/shop/${encodeURIComponent(String(shopId))}/verification-upload`, {
    method: 'POST',
    body: form,
  });
  return readJson(res);
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

/**
 * Append a delivery / refund / custom policy clause (same contract as web PolicyClauseModal).
 * POST /shop/patch/:shopId/policy-clause (Bearer auth; shop must belong to JWT user).
 * @param {number | string} shopId
 * @param {{ target: 'delivery' | 'refund' | 'custom'; title: string; content: string }} body
 */
export async function saveShopPolicyClause(shopId, body) {
  const res = await apiFetchAuth(`/shop/patch/${encodeURIComponent(String(shopId))}/policy-clause`, {
    method: 'POST',
    body: JSON.stringify({
      target: body.target,
      title: String(body.title ?? '').trim(),
      content: String(body.content ?? '').trim(),
    }),
  });
  return readJson(res);
}
