/**
 * Maps backend order rows to the Orders / Order detail list shape.
 * @param {Record<string, unknown>} row
 */
export function mapOrderRowToListItem(row) {
  const orderId = row.order_id != null ? String(row.order_id) : '';
  const product = String(row.product ?? 'Order').trim() || 'Order';
  const amount = Number(row.amount) || 0;
  const qty = Number(row.qty) || 0;
  const statusRaw = String(row.status ?? '').trim() || '—';
  const status = mapOrderStatusForFilter(statusRaw);
  const location = String(row.shipping_address ?? '—').trim() || '—';
  const dateLabel = formatShortDate(row.date);

  return {
    id: orderId ? `ORD-${orderId}` : 'ORD-—',
    orderId,
    vendor: product,
    location,
    dateLabel,
    items: qty,
    valueRupees: amount,
    status,
    statusRaw,
    timeline: buildOrderTimeline(status),
  };
}

/**
 * @param {string} status
 */
export function mapOrderStatusForFilter(status) {
  const s = String(status || '').toLowerCase();
  if (s.includes('deliver') || s === 'completed' || s === 'done' || s === 'fulfilled') {
    return 'delivered';
  }
  if (
    s.includes('pending') ||
    s.includes('unpaid') ||
    s.includes('awaiting') ||
    s === 'new' ||
    s === 'created'
  ) {
    return 'pending';
  }
  return 'processing';
}

/** @param {unknown} iso */
export function formatShortDate(iso) {
  if (iso == null) return '—';
  try {
    const d = new Date(/** @type {string | number} */ (iso));
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

/**
 * @param {'pending' | 'processing' | 'delivered'} status
 */
function buildOrderTimeline(status) {
  if (status === 'delivered') {
    return [
      { title: 'Order Placed', time: null, done: true },
      { title: 'Payment Confirmed', time: null, done: true },
      { title: 'Processing', time: null, done: true },
      { title: 'Shipped', time: null, done: true },
      { title: 'Delivered', time: null, done: true },
    ];
  }
  if (status === 'processing') {
    return [
      { title: 'Order Placed', time: null, done: true },
      { title: 'Payment Confirmed', time: null, done: true },
      { title: 'Processing', time: null, done: true },
      { title: 'Shipped', time: null, done: false },
    ];
  }
  return [
    { title: 'Order Placed', time: null, done: true },
    { title: 'Payment Confirmed', time: null, done: false },
    { title: 'Processing', time: null, done: false },
    { title: 'Shipped', time: null, done: false },
  ];
}

/**
 * Maps API dispute row to Dispute list / detail screen shape.
 * @param {Record<string, unknown>} row
 */
export function mapBuyerDisputeRow(row) {
  const disputeId = String(row.dispute_id ?? row.id ?? '').trim() || 'DSP-—';
  const orderIdNum = row.order_id != null ? Number(row.order_id) : null;
  const st = String(row.status ?? 'open').toLowerCase();
  let uiStatus = 'open';
  if (st === 'resolved' || st === 'closed' || st === 'won' || st === 'lost' || st === 'denied' || st === 'dismissed' || st === 'refunded') {
    uiStatus = 'resolved';
  } else if (st === 'in_review' || st === 'awaiting_merchant' || st === 'under_review') {
    uiStatus = 'under_review';
  }

  const openedLabel = formatShortDate(row.created_at);
  const updatedLabel = formatShortDate(row.updated_at);
  const reason = String(row.reason ?? 'Dispute').trim() || 'Dispute';
  const description = String(row.description ?? '').trim();

  const customerIdNum =
    row.customer_id != null && Number.isFinite(Number(row.customer_id))
      ? Number(row.customer_id)
      : null;
  const customerNameRaw =
    typeof row.customer_name === 'string' ? row.customer_name.trim() : '';
  const customerName =
    customerNameRaw ||
    (customerIdNum != null ? `Customer #${customerIdNum}` : 'Customer');

  const vendorNameRaw =
    typeof row.vendor_name === 'string' ? row.vendor_name.trim() : '';
  const vendorName = vendorNameRaw || 'Seller';

  const productData =
    row.product_data && typeof row.product_data === 'object' && !Array.isArray(row.product_data)
      ? /** @type {Record<string, unknown>} */ (row.product_data)
      : null;
  const productIdRaw = row.product_id ?? (productData ? productData.id : null);
  const productId =
    productIdRaw != null && Number.isFinite(Number(productIdRaw))
      ? Number(productIdRaw)
      : null;
  const productNameRaw =
    (typeof row.product === 'string' ? row.product.trim() : '') ||
    (productData && typeof productData.name === 'string' ? productData.name.trim() : '');
  const lineItemName = productNameRaw || null;
  const productImagesArr =
    productData && Array.isArray(productData.images) ? productData.images : [];
  const productImage =
    productImagesArr.find((u) => typeof u === 'string' && u.trim()) || null;
  const lineItemQty =
    row.qty != null && Number.isFinite(Number(row.qty)) ? Number(row.qty) : null;
  const lineItemUnit =
    row.unit_price != null && Number.isFinite(Number(row.unit_price))
      ? Number(row.unit_price)
      : null;
  const lineItemTotalRaw =
    row.total_amount != null && Number.isFinite(Number(row.total_amount))
      ? Number(row.total_amount)
      : null;
  // If we have qty + unit but no total, derive it.
  const lineItemTotal =
    lineItemTotalRaw != null
      ? lineItemTotalRaw
      : lineItemQty != null && lineItemUnit != null
        ? lineItemQty * lineItemUnit
        : null;
  const hasLineItem = lineItemName != null || lineItemQty != null || lineItemTotal != null;

  const orderDateLabel = row.order_created_at
    ? formatShortDate(row.order_created_at)
    : openedLabel;

  return {
    id: disputeId,
    orderId: orderIdNum != null && Number.isFinite(orderIdNum) ? `ORD-${orderIdNum}` : '—',
    title: reason,
    category: 'Order dispute',
    status: uiStatus,
    openedLabel,
    updatedLabel,
    summary: (description || reason).slice(0, 160),
    description: description || reason,
    resolution: null,
    buyerReceivedItem: true,
    vendorName,
    customerId: customerIdNum,
    customerName,
    orderDateLabel,
    deliveryDateLabel: '—',
    orderNumberDisplay: orderIdNum != null && Number.isFinite(orderIdNum) ? `#${orderIdNum}` : '—',
    hasLineItem,
    lineItem: {
      name: lineItemName,
      qty: lineItemQty,
      unitPriceRupees: lineItemUnit,
      totalRupees: lineItemTotal,
      productId,
      image: productImage,
    },
    productId,
    productData,
    vendorNote: description || reason,
    disputeReason: reason,
    itemCondition: '—',
    paymentEscrowRupees: lineItemTotal ?? 0,
    preferredResolution: '—',
    expectationExpected: '',
    expectationGotInstead: description || reason,
    evidence: [],
    timeline: [
      { title: 'Dispute opened', dateLabel: openedLabel, done: true },
      { title: 'Last updated', dateLabel: updatedLabel, done: true },
    ],
  };
}
