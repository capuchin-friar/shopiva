import { Alert } from 'react-native';
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

/** @returns {Promise<{ returns: unknown[] }>} */
export async function fetchBuyerReturns() {
  const res = await apiFetchAuth('/buyer/returns');
  return readJson(res);
}

/** @returns {Promise<{ return: Record<string, unknown> }>} */
export async function fetchBuyerReturn(returnId) {
  const id = encodeURIComponent(String(returnId ?? '').trim());
  if (!id) throw new Error('returnId is required');
  const res = await apiFetchAuth(`/buyer/returns/${id}`);
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

/**
 * Open a dispute on an order (buyer).
 * @param {{
 *   order_id: number;
 *   reason: string;
 *   description?: string | null;
 *   metadata?: Record<string, unknown>;
 * }} body
 * @returns {Promise<{ message: string; dispute: Record<string, unknown> }>}
 */
export async function createBuyerDispute(body) {
  const res = await apiFetchAuth('/buyer/disputes', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return readJson(res);
}

/** @returns {Promise<{ lines: unknown[] }>} */
export async function fetchBuyerCart() {
  const res = await apiFetchAuth('/buyer/cart');
  return readJson(res);
}


/** @returns {Promise<{ lines: unknown[] }>} */
export async function fetchBuyerCartProductShopId(productId) {
  const res = await apiFetchAuth(`/buyer/cart/${productId}`);
  return readJson(res);
}

/**
 * Confirm cart Paystack payment and create buyer↔vendor chat room (also clears cart server-side).
 * @param {{ reference: string; shipping_naira?: number }} body
 */
export async function confirmCheckoutPayment(body) {
  const res = await apiFetchAuth('/buyer/checkout/confirm-payment', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return readJson(res);
}

/**
 * @param {number} inventoryId
 * @param {number} [quantity]
 * @param {{ unitPrice?: number }} [opts] — when set (e.g. selected variant), stored as line snapshot after server validation
 * @returns {Promise<Record<string, unknown>>}
 */
export async function addBuyerCartLine(inventoryId, quantity = 1, opts = {}) {
  const unitPrice = opts && typeof opts === 'object' && 'unitPrice' in opts ? Number(/** @type {{ unitPrice?: unknown }} */ (opts).unitPrice) : NaN;
  const payload = {
    inventory_id: inventoryId,
    quantity: quantity ?? 1,
  };
  if (Number.isFinite(unitPrice) && unitPrice >= 0) {
    /** @type {Record<string, unknown>} */ (payload).unit_price = unitPrice;
  }
  const res = await apiFetchAuth('/buyer/cart', {
    method: 'POST',
    body: JSON.stringify(payload),
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


export async function createReview( body ) {
  const res = await apiFetchAuth(`/buyer/review`, {
    method: 'POST',
    body: JSON.stringify(body)
  });
  return readJson(res);
}


  //   fetch(`https://cs-node.vercel.app/review`, {
  //     method: 'post',

  //     headers: {
  //       'Content-Type': 'Application/json',
  //     },
  //     body: JSON.stringify({
  //       // shop_id: shop?.shop_id,
  //       // product_id: product?.product_id,
  //       // buyer_id: user?.user_id,
  //       // review: reviewType,
  //       // date: new Date(),
  //       // comment,
  //       // rating,

  //       shop_id, 
  //       customer_id, 
  //       order_id, 
  //       rating, 
  //       review_tag, 
  //       comment, 
  //       image_urls
  //     }),
  //   })
  //     .then(async result => {
  //       let response = await result.json();
  //       setIsSubmitting(false);

  //       Alert.alert('Review Submitted', 'Thank you for your feedback!', [
  //         {
  //           text: 'OK',
  //           onPress: () =>
  //             navigation.navigate('product', { data: product, reviewed: true }),
  //         },
  //       ]);
  //     })
  //     .catch(err => {
  //       Alert.alert('Network error, please try again.');
  //       setIsSubmitting(false);
  //       console.log(err);
  //     });
  // };