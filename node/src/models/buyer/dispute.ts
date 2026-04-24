import { db } from "../../config/database.js";
import { withErrorHandling } from "../../utils/errHandler.js";

export type BuyerDisputeStatus =
  | "open"
  | "in_review"
  | "awaiting_merchant"
  | "resolved"
  | "closed";

export type BuyerDisputeRow = {
  id: number;
  dispute_id: string;
  customer_id: number;
  order_id: number | null;
  status: string;
  reason: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateBuyerDisputePayload = {
  customer_id: number;
  order_id?: number | null;
  reason: string;
  description?: string | null;
  status?: BuyerDisputeStatus | string;
  source?: string;
  metadata?: Record<string, unknown>;
};

const CLOSED_STATUSES = ["resolved", "closed", "won", "lost", "denied", "dismissed", "refunded"];

function buildDisputeRef(customerId: number) {
  return `DSP-${customerId}-${Date.now()}`;
}

export class dispute {
  static create = withErrorHandling(async (payload: CreateBuyerDisputePayload): Promise<BuyerDisputeRow> => {
    const {
      customer_id,
      order_id = null,
      reason,
      description = null,
      status = "open",
      source = "customer",
      metadata = {},
    } = payload;

    const ref = buildDisputeRef(customer_id);
    const { rows } = await (await db()).query<BuyerDisputeRow>(
      `INSERT INTO disputes (
        dispute_ref, customer_id, order_id, status, reason, description, source, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
      RETURNING
        id,
        dispute_ref AS dispute_id,
        customer_id,
        order_id,
        status,
        reason,
        description,
        created_at,
        updated_at`,
      [ref, customer_id, order_id, status, reason, description, source, JSON.stringify(metadata)]
    );
    const row = rows[0];
    if (!row) throw new Error("Failed to create dispute");
    return row;
  });

  static getByCustomerId = withErrorHandling(
    async (customerId: number, options?: { includeClosed?: boolean }): Promise<BuyerDisputeRow[]> => {
      const includeClosed = Boolean(options?.includeClosed);
      const where = includeClosed
        ? `customer_id = $1`
        : `customer_id = $1 AND LOWER(status) <> ALL($2::text[])`;
      const params: unknown[] = includeClosed ? [customerId] : [customerId, CLOSED_STATUSES];

      const { rows } = await (await db()).query<BuyerDisputeRow>(
        `SELECT
          id,
          dispute_ref AS dispute_id,
          customer_id,
          order_id,
          status,
          reason,
          description,
          created_at,
          updated_at
        FROM disputes
        WHERE ${where}
        ORDER BY created_at DESC`,
        params
      );
      return rows;
    }
  );

  static getByCustomerAndDisputeId = withErrorHandling(
    async (customerId: number, disputeId: string): Promise<BuyerDisputeRow | null> => {
      const key = String(disputeId || "").trim();
      if (!key) return null;
      const { rows } = await (await db()).query<BuyerDisputeRow>(
        `SELECT
          id,
          dispute_ref AS dispute_id,
          customer_id,
          order_id,
          status,
          reason,
          description,
          created_at,
          updated_at
        FROM disputes
        WHERE customer_id = $1
          AND (dispute_ref = $2 OR id::text = $2)
        LIMIT 1`,
        [customerId, key]
      );
      return rows[0] ?? null;
    }
  );
}
