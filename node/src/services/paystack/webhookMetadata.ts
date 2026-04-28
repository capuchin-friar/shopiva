export type WebhookOrderLine = {
  productId?: number;
  quantity?: number;
  variant?: unknown;
  inventory_id?: number;
};

export type WebhookPricingBreakdown = {
  totalKobo?: number;
  totalNaira?: number;
  subtotalNaira?: number;
  shippingNaira?: number;
  currency?: string;
  [key: string]: unknown;
};

export type ValidatedOrderContext = {
  userId: number;
  items: WebhookOrderLine[];
  shippingAddress: unknown;
  pricing: WebhookPricingBreakdown;
};

function pickNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Metadata must match what you pass at Paystack initialize (customer-facing checkout).
 * All order reconstruction happens from this payload + Paystack verify (amount).
 */
export function parseAndValidateOrderMetadata(
  metadata: Record<string, unknown>
): { ok: true; ctx: ValidatedOrderContext } | { ok: false; message: string } {
  const userId = pickNumber(metadata.userId ?? metadata.user_id);
  if (userId === null || userId <= 0) {
    return { ok: false, message: "metadata.userId is missing or invalid" };
  }

  /** Paystack sometimes returns nested metadata as JSON strings — normalize for verify + webhook merge. */
  let itemsRaw: unknown = metadata.items;
  if (typeof itemsRaw === "string" && itemsRaw.trim()) {
    try {
      itemsRaw = JSON.parse(itemsRaw) as unknown;
    } catch {
      return { ok: false, message: "metadata.items is not valid JSON" };
    }
  }
  if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
    return { ok: false, message: "metadata.items must be a non-empty array" };
  }

  const items: WebhookOrderLine[] = [];
  for (const row of itemsRaw) {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      return { ok: false, message: "metadata.items contains invalid entry" };
    }
    const o = row as Record<string, unknown>;
    const productId = pickNumber(o.productId ?? o.product_id);
    const quantity = pickNumber(o.quantity ?? o.qty);
    const inventory_id = pickNumber(o.inventory_id ?? o.inventoryId);
    if ((productId === null || productId <= 0) && (inventory_id === null || inventory_id <= 0)) {
      return { ok: false, message: "Each item needs productId or inventory_id" };
    }
    if (quantity === null || quantity <= 0) {
      return { ok: false, message: "Each item needs a positive quantity" };
    }
    const line: WebhookOrderLine = { quantity, variant: o.variant };
    if (productId !== null && productId > 0) {
      line.productId = productId;
    }
    if (inventory_id !== null && inventory_id > 0) {
      line.inventory_id = inventory_id;
    }
    items.push(line);
  }

  const shippingAddress = metadata.shippingAddress ?? metadata.shipping_address;
  if (shippingAddress === undefined || shippingAddress === null) {
    return { ok: false, message: "metadata.shippingAddress is required" };
  }

  const pricingRaw = metadata.pricingBreakdown ?? metadata.pricing_breakdown;
  if (!pricingRaw || typeof pricingRaw !== "object" || Array.isArray(pricingRaw)) {
    return { ok: false, message: "metadata.pricingBreakdown must be an object" };
  }
  const pricing = pricingRaw as WebhookPricingBreakdown;

  return {
    ok: true,
    ctx: {
      userId,
      items,
      shippingAddress,
      pricing,
    },
  };
}

/** Expected amount in kobo from client metadata (for fraud / mismatch checks). */
export function expectedAmountKoboFromPricing(pricing: WebhookPricingBreakdown): number | null {
  const direct = pickNumber(pricing.totalKobo);
  if (direct !== null && direct > 0) return Math.trunc(direct);
  const naira = pickNumber(pricing.totalNaira);
  if (naira !== null && naira > 0) return Math.round(naira * 100);
  const sub = pickNumber(pricing.subtotalNaira);
  const ship = pickNumber(pricing.shippingNaira) ?? 0;
  if (sub !== null && sub >= 0) {
    return Math.round((sub + Math.max(0, ship)) * 100);
  }
  return null;
}
