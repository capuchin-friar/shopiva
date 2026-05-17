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
  /** Optional enrichment fields populated by the *single* dispute getters only. */
  customer_name?: string | null;
  product?: string | null;
  product_id?: number | null;
  product_data?: DisputeProductData | null;
  qty?: number | null;
  unit_price?: number | null;
  total_amount?: number | null;
  currency?: string | null;
  order_created_at?: string | null;
};

/**
 * Subset of `products` columns surfaced alongside a dispute. Built server-side via
 * `jsonb_build_object` so the client receives a parsed object (or null when the
 * dispute isn't linked to a real product row).
 */
export type DisputeProductData = {
  id: number;
  shop_id: number | null;
  name: string | null;
  slug: string | null;
  brand: string | null;
  category: string | null;
  subcategory: string | null;
  description: string | null;
  short_description: string | null;
  images: string[];
  videos: string[];
  tags: string[];
  status: string | null;
  is_published: boolean | null;
  is_featured: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CreateBuyerDisputePayload = {
  dispute_ref?: string;
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

const CUSTOMER_NAME_SQL = `TRIM(CONCAT_WS(' ', uc.fname, uc.lname))`;

/**
 * `disputes.order_id` may store either `orders.id` (legacy BIGINT) or `orders.order_id` (VARCHAR public key).
 * Avoid `o.id = d.order_id` when types differ (PostgreSQL: operator does not exist: integer = character varying).
 */
const DISPUTE_ORDER_JOIN_SQL = `
  d.order_id IS NOT NULL
  AND (
    (trim(d.order_id::text) ~ '^[0-9]+$' AND o.id = trim(d.order_id::text)::bigint)
    OR (trim(d.order_id::text) !~ '^[0-9]+$' AND o.order_id = trim(d.order_id::text))
  )
`;

export class dispute {
  static create = withErrorHandling(async (payload: CreateBuyerDisputePayload): Promise<BuyerDisputeRow> => {
    const {
      dispute_ref: disputeRefIn,
      customer_id,
      order_id = null,
      reason,
      description = null,
      status = "open",
      source = "customer",
      metadata = {},
    } = payload;

    const ref =
      String(disputeRefIn ?? "").trim() || buildDisputeRef(customer_id);
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
          AND ($2 OR LOWER(status) <> ALL($3))
        ORDER BY created_at DESC`,
        [customerId, Boolean(options?.includeClosed), CLOSED_STATUSES]
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
          d.id,
          d.dispute_ref AS dispute_id,
          d.customer_id,
          d.order_id,
          d.status,
          d.reason,
          d.description,
          d.created_at,
          d.updated_at,
          ${CUSTOMER_NAME_SQL} AS customer_name,
          NULL AS product,
          NULL AS product_id,
          NULL AS product_data,
          NULL AS qty,
          NULL AS unit_price,
          NULL AS total_amount,
          o.currency AS currency,
          o.created_at AS order_created_at
        FROM disputes d
        LEFT JOIN orders o ON ${DISPUTE_ORDER_JOIN_SQL}
        LEFT JOIN users uc ON uc.id = d.customer_id
        WHERE d.customer_id = $1
          AND (d.dispute_ref = $2 OR d.id::text = $2)
        LIMIT 1`,
        [customerId, key]
      );
      return rows[0] ?? null;
    }
  );

  /**
   * Disputes for a vendor's shop. A dispute belongs to shop X when either:
   *   - its order_id resolves to an order whose shop_id is X, OR
   *   - metadata->>'shop_id' = X (seeded / legacy disputes without an order link).
   */
  static getByShopId = withErrorHandling(
    async (shopId: number, options?: { includeClosed?: boolean }): Promise<BuyerDisputeRow[]> => {
      const { rows } = await (await db()).query<BuyerDisputeRow>(
        `SELECT
          d.id,
          d.dispute_ref AS dispute_id,
          d.customer_id,
          d.order_id,
          d.status,
          d.reason,
          d.description,
          d.created_at,
          d.updated_at
        FROM disputes d
        LEFT JOIN orders o ON ${DISPUTE_ORDER_JOIN_SQL}
        WHERE (o.shop_id = $1::text OR (d.metadata ->> 'shop_id') = $1::text)
          AND ($2 OR LOWER(d.status) <> ALL($3))
        ORDER BY d.created_at DESC`,
        [shopId, Boolean(options?.includeClosed), CLOSED_STATUSES]
      );
      return rows;
    }
  );

  static getByShopAndDisputeId = withErrorHandling(
    async (shopId: number, disputeId: string): Promise<BuyerDisputeRow | null> => {
      const key = String(disputeId || "").trim();
      if (!key) return null;

      const { rows } = await (await db()).query<BuyerDisputeRow>(
        `SELECT
          d.id,
          d.dispute_ref AS dispute_id,
          d.customer_id,
          d.order_id,
          d.status,
          d.reason,
          d.description,
          d.created_at,
          d.updated_at,
          ${CUSTOMER_NAME_SQL} AS customer_name,
          NULL AS product,
          NULL AS product_id,
          NULL AS product_data,
          NULL AS qty,
          NULL AS unit_price,
          NULL AS total_amount,
          o.currency AS currency,
          o.created_at AS order_created_at
        FROM disputes d
        LEFT JOIN orders o ON ${DISPUTE_ORDER_JOIN_SQL}
        LEFT JOIN users uc ON uc.id = d.customer_id
        WHERE (o.shop_id = $1::text OR (d.metadata ->> 'shop_id') = $1::text)
          AND (d.dispute_ref = $2 OR d.id::text = $2)
        LIMIT 1`,
        [shopId, key]
      );
      return rows[0] ?? null;
    }
  );
}
