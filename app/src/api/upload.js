import { apiFetchAuthMultipart } from './client';

/**
 * Upload product image files to backend Cloudinary endpoint.
 * POST /shop/:shopId/product/upload
 * @param {number | string} shopId
 * @param {{ uri: string; name: string; type: string }} file
 * @returns {Promise<{ image: { url: string; public_id: string; width: number; height: number; format: string; bytes: number } }>}
 */
export async function uploadProductImage(shopId, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await apiFetchAuthMultipart(`/shop/${encodeURIComponent(String(shopId))}/product/upload`, {
    method: 'POST',
    body: form,
  });
  return readJson(res);
}

async function readJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const hint = data?.error || data?.message || `Request failed (HTTP ${res.status})`;
    throw new Error(String(hint));
  }
  return data;
}
