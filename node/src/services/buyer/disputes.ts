import {
  dispute as disputeModel,
  type BuyerDisputeRow,
  type CreateBuyerDisputePayload,
} from "../../models/buyer/dispute.js";
import { order as orderModel, type OrderListRow } from "../../models/business/product.js";

export async function GetBuyerDisputesService(customerId: number, options?: { includeClosed?: boolean }) {
  return disputeModel.getByCustomerId(customerId, options);
}

export async function GetBuyerDisputeByIdService(customerId: number, disputeId: string) {
  return disputeModel.getByCustomerAndDisputeId(customerId, disputeId);
}

function toNumericOrderId(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.trunc(n);
}

/**
 * One-time/backfill helper:
 * create open disputes from existing buyer orders that don't already have a dispute row.
 */
export async function BackfillBuyerDisputesFromOrdersService(customerId: number) {
  const [orders, existingDisputes] = await Promise.all([
    orderModel.getByCustomerId(customerId),
    disputeModel.getByCustomerId(customerId, { includeClosed: true }),
  ]);

  if (!orders.length) return { created: 0, scanned: 0 };

  const existingOrderIds = new Set(
    existingDisputes
      .map((d: BuyerDisputeRow) => (d.order_id == null ? null : String(d.order_id)))
      .filter((v: string | null): v is string => Boolean(v))
  );

  let created = 0;
  let scanned = 0;

  for (const row of orders) {
    scanned += 1;
    const numericOrderId = toNumericOrderId(row.order_id);
    if (numericOrderId == null) continue;
    const key = String(numericOrderId);
    if (existingOrderIds.has(key)) continue;

    const reason = row.product?.trim()
      ? `Issue with order item: ${row.product}`
      : "Issue with existing order";

    await disputeModel.create({
      customer_id: customerId,
      order_id: numericOrderId,
      reason,
      description: `Auto-created from existing order #${numericOrderId}.`,
      status: "open",
      source: "order_backfill",
      metadata: {
        original_status: row.status ?? null,
        original_delivery: row.delivery ?? null,
        original_payment: row.payment ?? null,
      },
    });

    existingOrderIds.add(key);
    created += 1;
  }

  return { created, scanned };
}

/** Socket / API body for opening a dispute. */
export type RaiseDisputePayload = {
  dispute_ref?: string;
  customer_id: number;
  order_id?: number | null;
  status?: string;
  reason: string;
  description?: string | null;
  source?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Normalizes and validates a raise-dispute payload.
 * @param raw - Incoming socket or HTTP body
 * @param options.requireCustomerMatch - When set, `customer_id` must equal this user id
 */
export function parseRaiseDisputePayload(
  raw: Record<string, unknown>,
  options?: { requireCustomerMatch?: number }
): RaiseDisputePayload {
  const customerId = Number(raw.customer_id);
  if (!Number.isFinite(customerId) || customerId <= 0) {
    throw new Error("customer_id is required");
  }
  if (
    options?.requireCustomerMatch != null &&
    customerId !== options.requireCustomerMatch
  ) {
    throw new Error("Unauthorized dispute submission");
  }

  const reason = String(raw.reason ?? "").trim();
  if (!reason) throw new Error("Reason is required");

  let order_id: number | null = null;
  if (raw.order_id != null && raw.order_id !== "") {
    const parsed = Number(raw.order_id);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error("Invalid order_id");
    }
    order_id = Math.trunc(parsed);
  }

  const dispute_ref = String(raw.dispute_ref ?? "").trim() || undefined;
  const descriptionRaw =
    raw.description != null ? String(raw.description).trim() : "";

  return {
    ...(dispute_ref ? { dispute_ref } : {}),
    customer_id: customerId,
    order_id,
    status: String(raw.status ?? "open").trim() || "open",
    reason,
    description: descriptionRaw || null,
    source: String(raw.source ?? "customer").trim() || "customer",
    metadata:
      raw.metadata &&
      typeof raw.metadata === "object" &&
      !Array.isArray(raw.metadata)
        ? (raw.metadata as Record<string, unknown>)
        : {},
  };
}

export async function CreateBuyerDisputeService(payload: RaiseDisputePayload) {
  const { customer_id: customerId, order_id: orderIdIn } = payload;

  let orderId: number | null = orderIdIn ?? null;
  if (orderId != null) {
    const buyerOrders = await orderModel.getByCustomerId(customerId);
    const ownsOrder = buyerOrders.some(
      (row: OrderListRow) => String(row.order_id) === String(orderId)
    );
    if (!ownsOrder) {
      throw new Error("Order not found for this customer");
    }
  }

  const createPayload: CreateBuyerDisputePayload = {
    ...(payload.dispute_ref ? { dispute_ref: payload.dispute_ref } : {}),
    customer_id: customerId,
    order_id: orderId,
    reason: payload.reason,
    description: payload.description ?? null,
    status: payload.status ?? "open",
    source: payload.source ?? "customer",
    metadata: payload.metadata ?? {},
  };

  return disputeModel.create(createPayload);
}
