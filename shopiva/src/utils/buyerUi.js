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
    vendorName: 'Seller',
    orderDateLabel: openedLabel,
    deliveryDateLabel: '—',
    orderNumberDisplay: orderIdNum != null && Number.isFinite(orderIdNum) ? `#${orderIdNum}` : '—',
    lineItem: {
      name: reason,
      qty: 1,
      unitPriceRupees: 0,
      totalRupees: 0,
    },
    vendorNote: description || reason,
    disputeReason: reason,
    itemCondition: '—',
    paymentEscrowRupees: 0,
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
