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

  /**
   * Disputes for a vendor's shop. A dispute is "responsible to shop X" when either:
   *   - its order_id resolves to orders.shopid = X (real buyer-flow disputes), OR
   *   - metadata->>'shop_id' = X (hand-seeded / legacy disputes without an order link).
   *
   * The orders join is detected at runtime so this works whether or not the orders
   * table exists in the current environment.
   */
  static getByShopId = withErrorHandling(
    async (shopId: number, options?: { includeClosed?: boolean }): Promise<BuyerDisputeRow[]> => {
      const dbConn = await db();
      const includeClosed = Boolean(options?.includeClosed);

      const tableRes = await dbConn.query<{ reg: string | null }>(
        `SELECT to_regclass('public.orders')::text AS reg`
      );
      const ordersExists = Boolean(tableRes.rows[0]?.reg);

      let ordersJoinSql = "";
      let ordersWhereSql = "FALSE";
      if (ordersExists) {
        const colRes = await dbConn.query<{ column_name: string }>(
          `SELECT column_name
           FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = 'orders'`
        );
        const cols = new Set(colRes.rows.map((r) => r.column_name));
        const pick = (...names: string[]) => names.find((n) => cols.has(n)) ?? null;
        const shopCol = pick("shopid", "shop_id", "shopId");
        const orderIdCol = pick("id", "order_id") ?? "id";
        if (shopCol) {
          ordersJoinSql = `LEFT JOIN orders o ON o.${orderIdCol} = d.order_id`;
          ordersWhereSql = `o.${shopCol} = $1`;
        }
      }

      const statusFilter = includeClosed
        ? ""
        : `AND LOWER(d.status) <> ALL($2::text[])`;
      const params: unknown[] = includeClosed ? [shopId] : [shopId, CLOSED_STATUSES];

      const { rows } = await dbConn.query<BuyerDisputeRow>(
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
        ${ordersJoinSql}
        WHERE (
          ${ordersWhereSql}
          OR (d.metadata ->> 'shop_id') = $1::text
        )
        ${statusFilter}
        ORDER BY d.created_at DESC`,
        params
      );
      return rows;
    }
  );

  static getByShopAndDisputeId = withErrorHandling(
    async (shopId: number, disputeId: string): Promise<BuyerDisputeRow | null> => {
      const key = String(disputeId || "").trim();
      if (!key) return null;

      const dbConn = await db();

      const tableRes = await dbConn.query<{ reg: string | null }>(
        `SELECT to_regclass('public.orders')::text AS reg`
      );
      const ordersExists = Boolean(tableRes.rows[0]?.reg);

      let ordersJoinSql = "";
      let ordersWhereSql = "FALSE";
      if (ordersExists) {
        const colRes = await dbConn.query<{ column_name: string }>(
          `SELECT column_name
           FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = 'orders'`
        );
        const cols = new Set(colRes.rows.map((r) => r.column_name));
        const pick = (...names: string[]) => names.find((n) => cols.has(n)) ?? null;
        const shopCol = pick("shopid", "shop_id", "shopId");
        const orderIdCol = pick("id", "order_id") ?? "id";
        if (shopCol) {
          ordersJoinSql = `LEFT JOIN orders o ON o.${orderIdCol} = d.order_id`;
          ordersWhereSql = `o.${shopCol} = $1`;
        }
      }

      const { rows } = await dbConn.query<BuyerDisputeRow>(
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
        ${ordersJoinSql}
        WHERE (
          ${ordersWhereSql}
          OR (d.metadata ->> 'shop_id') = $1::text
        )
          AND (d.dispute_ref = $2 OR d.id::text = $2)
        LIMIT 1`,
        [shopId, key]
      );
      return rows[0] ?? null;
    }
  );
}
