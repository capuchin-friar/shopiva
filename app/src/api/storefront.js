import { apiFetch } from './client';

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

/**
 * @param {string} slug
 * @returns {Promise<{ shop: Record<string, unknown>; shopPolicies?: Record<string, unknown> | null }>}
 */
export async function getStorefrontShop(slug) {
  const s = String(slug ?? '').trim();
  if (!s) throw new Error('Shop slug is required');
  const res = await apiFetch(`/storefront/shop/${encodeURIComponent(s)}`);
  return readJson(res);
}

/**
 * @param {string} slug
 * @returns {Promise<{ products: unknown[] }>}
 */
export async function getStorefrontProducts(slug) {
  const s = String(slug ?? '').trim();
  if (!s) throw new Error('Shop slug is required');
  const res = await apiFetch(`/storefront/shop/${encodeURIComponent(s)}/products`);
  return readJson(res);
}

/**
 * @param {number | string} productId
 * @returns {Promise<{ product: Record<string, unknown>; inventory: unknown[]; shopPolicies?: Record<string, unknown> | null; productReviews?: unknown[]; reviewMetrics?: Record<string, unknown> | null }>}
 */
export async function getStorefrontProduct(productId) {
  const id = String(productId ?? '').trim();
  if (!id) throw new Error('Product id is required');
  const res = await apiFetch(`/storefront/product/${encodeURIComponent(id)}`);
  return readJson(res);
}
