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
    throw new Error(hint);
  }
  return data;
}

/** @returns {Promise<{ orders: unknown[] }>} */
export async function fetchBuyerOrders() {
  const res = await apiFetchAuth('/buyer/orders');
  return readJson(res);
}

/** @returns {Promise<{ order: Record<string, unknown> }>} */
export async function fetchBuyerOrder(orderId) {
  const id = encodeURIComponent(String(orderId ?? '').trim());
  if (!id) throw new Error('orderId is required');
  const res = await apiFetchAuth(`/buyer/orders/${id}`);
  return readJson(res);
}

/**
 * @param {{ includeClosed?: boolean; backfill?: boolean }} [opts]
 * @returns {Promise<{ disputes: unknown[] }>}
 */
export async function fetchBuyerDisputes(opts = {}) {
  const q = new URLSearchParams();
  q.set('includeClosed', opts.includeClosed !== false ? 'true' : 'false');
  q.set('backfill', opts.backfill === true ? 'true' : 'false');
  const res = await apiFetchAuth(`/buyer/disputes?${q.toString()}`);
  return readJson(res);
}

/** @returns {Promise<{ dispute: Record<string, unknown> }>} */
export async function fetchBuyerDispute(disputeId) {
  const id = encodeURIComponent(String(disputeId ?? '').trim());
  if (!id) throw new Error('disputeId is required');
  const res = await apiFetchAuth(`/buyer/disputes/${id}`);
  return readJson(res);
}

/** @returns {Promise<{ lines: unknown[] }>} */
export async function fetchBuyerCart() {
  const res = await apiFetchAuth('/buyer/cart');
  return readJson(res);
}

/**
 * @param {number} inventoryId
 * @param {number} [quantity]
 * @returns {Promise<Record<string, unknown>>}
 */
export async function addBuyerCartLine(inventoryId, quantity = 1) {
  const res = await apiFetchAuth('/buyer/cart', {
    method: 'POST',
    body: JSON.stringify({
      inventory_id: inventoryId,
      quantity: quantity ?? 1,
    }),
  });
  return readJson(res);
}

/**
 * @param {number} cartItemId
 * @param {number} quantity
 * @returns {Promise<Record<string, unknown>>}
 */
export async function patchBuyerCartLine(cartItemId, quantity) {
  const res = await apiFetchAuth(`/buyer/cart/${encodeURIComponent(String(cartItemId))}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
  return readJson(res);
}

/**
 * @param {number} cartItemId
 * @returns {Promise<Record<string, unknown>>}
 */
export async function deleteBuyerCartLine(cartItemId) {
  const res = await apiFetchAuth(`/buyer/cart/${encodeURIComponent(String(cartItemId))}`, {
    method: 'DELETE',
  });
  return readJson(res);
}
