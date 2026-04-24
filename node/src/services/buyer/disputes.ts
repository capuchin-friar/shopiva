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

export async function CreateBuyerDisputeService(
  customerId: number,
  payload: {
    order_id?: number | null;
    reason?: string;
    description?: string | null;
    status?: string;
    source?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const reason = String(payload.reason ?? "").trim();
  if (!reason) throw new Error("Reason is required");

  let orderId: number | null = null;
  if (payload.order_id != null) {
    const parsed = Number(payload.order_id);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error("Invalid order_id");
    }
    const buyerOrders = await orderModel.getByCustomerId(customerId);
    const ownsOrder = buyerOrders.some(
      (row: OrderListRow) => String(row.order_id) === String(parsed)
    );
    if (!ownsOrder) {
      throw new Error("Order not found for this customer");
    }
    orderId = parsed;
  }

  const createPayload: CreateBuyerDisputePayload = {
    customer_id: customerId,
    order_id: orderId,
    reason,
    description: payload.description ?? null,
    status: payload.status ?? "open",
    source: payload.source ?? "customer",
    metadata: payload.metadata ?? {},
  };

  return disputeModel.create(createPayload);
}
