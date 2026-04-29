import { apiFetch } from './client';

/**
 * @typedef {object} VendorMapShop
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {number} lat
 * @property {number} lng
 * @property {string | null} [state]
 * @property {string | null} [address]
 * @property {string | null} [city]
 */

/**
 * Public map discovery — same contract as the website (`site/lib/productApi.js` → `getVendorsOnMapByCategory`).
 * Node route: `GET /discover/vendors-on-map?category=...`
 *
 * @param {string} category - Top-level category key (e.g. from `mvp_category.json` on the site: "fashion", …)
 * @returns {Promise<VendorMapShop[]>}
 */
export async function getVendorsOnMapByCategory(category) {
  const trimmed = String(category ?? '').trim();
  if (!trimmed) {
    throw new Error('category is required');
  }
  const q = encodeURIComponent(trimmed);
  const res = await apiFetch(`/discover/vendors-on-map?category=${q}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const hint =
      data?.error ||
      data?.message ||
      (typeof data?.details === 'string' ? data.details : null) ||
      `Could not load vendors (HTTP ${res.status}). Is the Node API running?`;
    throw new Error(hint);
  }
  return Array.isArray(data.vendors) ? data.vendors : [];
}



/** @returns {Promise<{ orders: unknown[] }>} */
export async function fetchVendorOrders() {
  const res = await apiFetchAuth('/vendor/orders');
  return readJson(res);
}

/** @returns {Promise<{ order: Record<string, unknown> }>} */
export async function fetchVendorOrder(orderId) {
  const id = encodeURIComponent(String(orderId ?? '').trim());
  if (!id) throw new Error('orderId is required');
  const res = await apiFetchAuth(`/vendor/orders/${id}`);
  return readJson(res);
}
