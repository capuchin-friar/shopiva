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

/**
 * Resolve `orders` columns once, then build SQL fragments that project the first
 * line-item's name/qty/unit_price/total + currency + order date. Each fragment
 * yields NULL when the underlying columns / data aren't present, so seeded
 * disputes (no `order_id`) still come back gracefully.
 */
type OrderEnrichmentSql = {
  joinSql: string;
  productsJoinSql: string;
  productSql: string;
  productIdSql: string;
  productDataSql: string;
  qtySql: string;
  unitPriceSql: string;
  totalSql: string;
  currencySql: string;
  orderCreatedAtSql: string;
};

const PRODUCT_DATA_NULL_SQL = "NULL::jsonb";

async function tableExists(
  dbConn: import("pg").Pool | import("pg").PoolClient,
  fqn: string
): Promise<boolean> {
  const { rows } = await dbConn.query<{ reg: string | null }>(
    `SELECT to_regclass($1)::text AS reg`,
    [fqn]
  );
  return Boolean(rows[0]?.reg);
}

async function resolveOrderEnrichmentSql(
  dbConn: import("pg").Pool | import("pg").PoolClient,
  ordersAlias: string,
  disputeAlias: string
): Promise<OrderEnrichmentSql> {
  const ordersExists = await tableExists(dbConn, "public.orders");
  const productsExists = await tableExists(dbConn, "public.products");
  if (!ordersExists) {
    return {
      joinSql: "",
      productsJoinSql: "",
      productSql: "NULL::text",
      productIdSql: "NULL::int",
      productDataSql: PRODUCT_DATA_NULL_SQL,
      qtySql: "NULL::int",
      unitPriceSql: "NULL::numeric",
      totalSql: "NULL::numeric",
      currencySql: "NULL::text",
      orderCreatedAtSql: "NULL::timestamptz",
    };
  }

  const colRes = await dbConn.query<{ column_name: string }>(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'orders'`
  );
  const cols = new Set(colRes.rows.map((r) => r.column_name));
  const pick = (...names: string[]) => names.find((n) => cols.has(n)) ?? null;

  const idCol = pick("id", "order_id") ?? "id";
  const productIdCol = pick("product_id", "productid");
  const itemsCol = pick("items", "line_items", "order_lines");
  const productNameCol = pick("product_name");
  const qtyCol = pick("quantity", "qty");
  const totalCol = pick("total", "total_amount", "amount", "subtotal");
  const currencyCol = pick("currency");
  const dateCol = pick("orderedat", "createdat", "created_at", "createdAt", "order_date");

  const o = ordersAlias;
  const d = disputeAlias;

  const joinSql = `LEFT JOIN orders ${o} ON ${o}.${idCol} = ${d}.order_id`;

  // Product link: prefer orders.product_id, fall back to items[0].productId / product_id.
  const productLinkParts: string[] = [];
  if (productIdCol) {
    productLinkParts.push(`${o}.${productIdCol}`);
  }
  if (itemsCol) {
    productLinkParts.push(
      `NULLIF(${o}.${itemsCol} -> 0 ->> 'productId', '')::int`,
      `NULLIF(${o}.${itemsCol} -> 0 ->> 'product_id', '')::int`
    );
  }
  const productLinkExpr =
    productLinkParts.length > 0 ? `COALESCE(${productLinkParts.join(", ")})` : null;

  const productsJoinSql =
    productsExists && productLinkExpr ? `LEFT JOIN products p ON p.id = ${productLinkExpr}` : "";

  const productCandidates: string[] = [];
  if (productNameCol) productCandidates.push(`NULLIF(TRIM(${o}.${productNameCol}::text), '')`);
  if (productsJoinSql) productCandidates.push(`NULLIF(TRIM(p.name), '')`);
  if (itemsCol) productCandidates.push(`NULLIF(TRIM(${o}.${itemsCol} -> 0 ->> 'name'), '')`);
  const productSql =
    productCandidates.length > 0 ? `COALESCE(${productCandidates.join(", ")})` : "NULL::text";

  const productIdSql = productsJoinSql
    ? `p.id`
    : productLinkExpr
      ? productLinkExpr
      : "NULL::int";

  const productDataSql = productsJoinSql
    ? `CASE WHEN p.id IS NOT NULL THEN jsonb_build_object(
        'id', p.id,
        'shop_id', p.shop_id,
        'name', p.name,
        'slug', p.slug,
        'brand', p.brand,
        'category', p.category,
        'subcategory', p.subcategory,
        'description', p.description,
        'short_description', p.short_description,
        'images', COALESCE(to_jsonb(p.images), '[]'::jsonb),
        'videos', COALESCE(to_jsonb(p.videos), '[]'::jsonb),
        'tags', COALESCE(to_jsonb(p.tags), '[]'::jsonb),
        'status', p.status,
        'is_published', p.is_published,
        'is_featured', p.is_featured,
        'created_at', p.created_at,
        'updated_at', p.updated_at
      ) ELSE NULL END`
    : PRODUCT_DATA_NULL_SQL;

  const qtyCandidates: string[] = [];
  if (qtyCol) qtyCandidates.push(`NULLIF(${o}.${qtyCol}, 0)::int`);
  if (itemsCol) {
    qtyCandidates.push(
      `NULLIF((SELECT SUM(COALESCE((item ->> 'quantity')::INT, 0))
        FROM jsonb_array_elements(${o}.${itemsCol}) item), 0)::int`
    );
  }
  const qtySql =
    qtyCandidates.length > 0 ? `COALESCE(${qtyCandidates.join(", ")})` : "NULL::int";

  const unitCandidates: string[] = [];
  if (itemsCol) {
    unitCandidates.push(`NULLIF(${o}.${itemsCol} -> 0 ->> 'unit_price', '')::numeric`);
    unitCandidates.push(`NULLIF(${o}.${itemsCol} -> 0 ->> 'unitPrice', '')::numeric`);
    unitCandidates.push(`NULLIF(${o}.${itemsCol} -> 0 ->> 'price', '')::numeric`);
  }
  const unitPriceSql =
    unitCandidates.length > 0 ? `COALESCE(${unitCandidates.join(", ")})` : "NULL::numeric";

  const totalCandidates: string[] = [];
  if (totalCol) totalCandidates.push(`NULLIF(${o}.${totalCol}, 0)::numeric`);
  if (itemsCol) {
    totalCandidates.push(`NULLIF(${o}.${itemsCol} -> 0 ->> 'total', '')::numeric`);
    totalCandidates.push(`NULLIF(${o}.${itemsCol} -> 0 ->> 'lineTotal', '')::numeric`);
  }
  const totalSql =
    totalCandidates.length > 0 ? `COALESCE(${totalCandidates.join(", ")})` : "NULL::numeric";

  const currencySql = currencyCol ? `${o}.${currencyCol}::text` : "NULL::text";
  const orderCreatedAtSql = dateCol ? `${o}.${dateCol}` : "NULL::timestamptz";

  return {
    joinSql,
    productsJoinSql,
    productSql,
    productIdSql,
    productDataSql,
    qtySql,
    unitPriceSql,
    totalSql,
    currencySql,
    orderCreatedAtSql,
  };
}

const CUSTOMER_NAME_SQL =
  `NULLIF(TRIM(CONCAT(COALESCE(uc.fname, ''), ' ', COALESCE(uc.lname, ''))), '')`;

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
      const dbConn = await db();
      const enrich = await resolveOrderEnrichmentSql(dbConn, "o", "d");

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
          d.updated_at,
          ${CUSTOMER_NAME_SQL} AS customer_name,
          ${enrich.productSql} AS product,
          ${enrich.productIdSql} AS product_id,
          ${enrich.productDataSql} AS product_data,
          ${enrich.qtySql} AS qty,
          ${enrich.unitPriceSql} AS unit_price,
          ${enrich.totalSql} AS total_amount,
          ${enrich.currencySql} AS currency,
          ${enrich.orderCreatedAtSql} AS order_created_at
        FROM disputes d
        ${enrich.joinSql}
        ${enrich.productsJoinSql}
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
      const enrich = await resolveOrderEnrichmentSql(dbConn, "o", "d");

      // Authorization: dispute must either belong to an order owned by the shop, or
      // carry the shop id in metadata (seeded / legacy disputes).
      const tableRes = await dbConn.query<{ reg: string | null }>(
        `SELECT to_regclass('public.orders')::text AS reg`
      );
      const ordersExists = Boolean(tableRes.rows[0]?.reg);

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
        if (shopCol) {
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
          d.updated_at,
          ${CUSTOMER_NAME_SQL} AS customer_name,
          ${enrich.productSql} AS product,
          ${enrich.productIdSql} AS product_id,
          ${enrich.productDataSql} AS product_data,
          ${enrich.qtySql} AS qty,
          ${enrich.unitPriceSql} AS unit_price,
          ${enrich.totalSql} AS total_amount,
          ${enrich.currencySql} AS currency,
          ${enrich.orderCreatedAtSql} AS order_created_at
        FROM disputes d
        ${enrich.joinSql}
        ${enrich.productsJoinSql}
        LEFT JOIN users uc ON uc.id = d.customer_id
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
