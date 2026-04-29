import crypto from "crypto";
import type { PoolClient } from "pg";
import { toJsonbTextParam } from "../../utils/pgJson.js";
import type { PaystackVerifySuccess } from "./webhookVerifyTransaction.js";
import type { ValidatedOrderContext, WebhookOrderLine } from "./webhookMetadata.js";

/** Matches `orders.status` CHECK on typical Shopiva DDL (varchar literals). */
const ORDER_STATUS_ALLOWED = new Set([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
]);

function pickCol(cols: Set<string>, ...names: string[]): string | null {
  return names.find((n) => cols.has(n)) ?? null;
}

function pickNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Paid webhook: map legacy labels (paid/success) → DB-safe status. */
function normalizeWebhookOrderStatus(raw: string): string {
  const s = String(raw ?? "").trim().toLowerCase();
  if (ORDER_STATUS_ALLOWED.has(s)) return s;
  if (s === "paid" || s === "success") return "confirmed";
  return "confirmed";
}

/**
 * Fill `subtotal`, `total`, `shippingcost` from Paystack verify + metadata.pricingBreakdown.
 * Totals use verified Naira unless metadata overrides (same rules as amount checks elsewhere).
 */
function deriveOrderMoney(
  ctx: ValidatedOrderContext,
  verifiedAmountNaira: number
): { subtotal: number; total: number; shipping: number } {
  const p = ctx.pricing;
  const shipping = Math.max(0, pickNumber(p.shippingNaira) ?? 0);

  let total = verifiedAmountNaira;
  const tn = pickNumber(p.totalNaira);
  const tk = pickNumber(p.totalKobo);
  if (tn !== null && tn >= 0) total = tn;
  else if (tk !== null && tk >= 0) total = Math.round(tk) / 100;

  let subtotal = pickNumber(p.subtotalNaira);
  if (subtotal === null || subtotal < 0) {
    subtotal = Math.max(0, total - shipping);
  }
  return { subtotal, total, shipping };
}

function safeIdent(name: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error(`Invalid SQL identifier: ${name}`);
  }
  return `"${name}"`;
}

/**
 * Lock each inventory row, verify stock and product id, then leave locks held until txn end.
 */
async function assertInventoryAllowsLines(
  client: PoolClient,
  lines: WebhookOrderLine[]
): Promise<void> {
  for (const line of lines) {
    if (!line.inventory_id) continue;
    const qty = line.quantity ?? 0;
    const { rows } = await client.query<{
      quantity: number;
      product_id: number;
      track_inventory: boolean;
      allow_backorder: boolean;
    }>(
      `SELECT quantity, product_id, track_inventory, allow_backorder
       FROM inventory WHERE id = $1 FOR UPDATE`,
      [line.inventory_id]
    );
    const row = rows[0];
    if (!row) {
      throw new Error(`Inventory line ${line.inventory_id} not found`);
    }
    const enforceStock = row.track_inventory !== false && row.allow_backorder !== true;
    if (enforceStock && row.quantity < qty) {
      throw new Error(`Insufficient stock for inventory ${line.inventory_id}`);
    }
    if (line.productId != null && row.product_id !== line.productId) {
      throw new Error(`Product/inventory mismatch for inventory ${line.inventory_id}`);
    }
  }
}

/**
 * Reduce on-hand quantity for each line (same transaction as order insert).
 * Skips rows that only reference productId (no inventory row to touch).
 * When `track_inventory` is false, quantity is left unchanged (still records sale on order).
 */
async function decrementInventoryForLines(
  client: PoolClient,
  lines: WebhookOrderLine[]
): Promise<void> {
  for (const line of lines) {
    if (!line.inventory_id) continue;
    const qty = Math.max(0, Math.trunc(Number(line.quantity ?? 0)));
    if (qty <= 0) continue;

    const { rows } = await client.query<{ track_inventory: boolean }>(
      `SELECT track_inventory FROM inventory WHERE id = $1 FOR UPDATE`,
      [line.inventory_id]
    );
    const meta = rows[0];
    if (!meta) {
      throw new Error(`Inventory line ${line.inventory_id} not found`);
    }
    if (meta.track_inventory === false) {
      continue;
    }

    const upd = await client.query(
      `UPDATE inventory
       SET quantity = GREATEST(0, quantity - $1::int), updated_at = CURRENT_TIMESTAMP
       WHERE id = $2::int AND (allow_backorder = true OR quantity >= $1::int)`,
      [qty, line.inventory_id]
    );
    if ((upd.rowCount ?? 0) !== 1) {
      throw new Error(`Failed to decrement stock for inventory ${line.inventory_id}`);
    }
  }
}

async function columnUdtName(
  client: PoolClient,
  table: string,
  column: string
): Promise<string | null> {
  const { rows } = await client.query<{ udt_name: string }>(
    `SELECT udt_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column]
  );
  return rows[0]?.udt_name ?? null;
}

async function columnPgTypes(
  client: PoolClient,
  table: string,
  column: string
): Promise<{ data_type: string | null; udt_name: string | null }> {
  const { rows } = await client.query<{ data_type: string; udt_name: string }>(
    `SELECT data_type, udt_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column]
  );
  const r = rows[0];
  return { data_type: r?.data_type ?? null, udt_name: r?.udt_name ?? null };
}

/**
 * Human-/DB-safe order number from Paystack reference (unique per payment).
 * Supports common schemas: varchar/text (use ref) or integer/bigint (deterministic hash).
 */
function deriveOrderNumberValue(
  reference: string,
  dataType: string | null,
  udtName: string | null
): string | number {
  const ref = String(reference).trim();
  const fallbackText = `ORD_${Date.now()}`;
  const dt = (dataType ?? "").toLowerCase();
  const udt = (udtName ?? "").toLowerCase();
  if (udt === "uuid") {
    return crypto.randomUUID();
  }
  const isIntFamily =
    dt === "integer" ||
    dt === "bigint" ||
    dt === "smallint" ||
    udt === "int2" ||
    udt === "int4" ||
    udt === "int8";
  if (isIntFamily) {
    let h = 2166136261;
    for (let i = 0; i < ref.length; i++) {
      h ^= ref.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const n = Math.abs(h >>> 0);
    return n === 0 ? 1 : n;
  }
  const text = (ref.length ? ref : fallbackText).replace(/[^\w.-]/g, "_").slice(0, 128);
  return text.length ? text : fallbackText;
}

async function resolveShopId(client: PoolClient, lines: WebhookOrderLine[]): Promise<number | null> {
  for (const line of lines) {
    if (line.productId) {
      const { rows } = await client.query<{ shop_id: number }>(
        `SELECT shop_id FROM products WHERE id = $1 LIMIT 1`,
        [line.productId]
      );
      if (rows[0]?.shop_id) return rows[0].shop_id;
    }
    if (line.inventory_id) {
      const { rows } = await client.query<{ shop_id: number }>(
        `SELECT p.shop_id
         FROM inventory i
         INNER JOIN products p ON p.id = i.product_id
         WHERE i.id = $1
         LIMIT 1`,
        [line.inventory_id]
      );
      if (rows[0]?.shop_id) return rows[0].shop_id;
    }
  }
  return null;
}

/**
 * Inserts one `orders` row using whatever columns exist on your `orders` table (introspected).
 * Must run inside an open transaction on `client`.
 */
export async function createOrderFromWebhook(
  client: PoolClient,
  input: {
    reference: string;
    verified: PaystackVerifySuccess;
    ctx: ValidatedOrderContext;
  }
): Promise<{ orderId: number }> {
  const { reference, verified, ctx } = input;
  const amountKobo = verified.amountKobo;

  const colRes = await client.query<{ column_name: string }>(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'orders'`
  );
  const cols = new Set(colRes.rows.map((r) => r.column_name));
  if (!cols.size) {
    throw new Error("orders table has no columns (unexpected)");
  }

  /* Prefer names from public.orders DDL (shopiva): customerid, shopid, shippingaddress, etc. */
  const customerCol = pickCol(cols, "customerid", "customer_id");
  const shopCol = pickCol(cols, "shopid", "shop_id", "shopId");
  const itemsCol = pickCol(cols, "items", "line_items", "order_lines");
  const subtotalCol = pickCol(cols, "subtotal");
  const totalCol = pickCol(cols, "total", "total_amount", "amount");
  const shippingCostCol = pickCol(cols, "shippingcost", "shipping_cost");
  const statusCol = pickCol(cols, "status", "order_status");
  const payRefCol = pickCol(cols, "payment_reference", "paymentreference");
  const productCol = pickCol(cols, "product_id", "productid");
  const paymentCol = pickCol(cols, "payment_status", "payment", "payment_method");
  const shippingCol = pickCol(cols, "shippingaddress", "shipping_address");
  const currencyCol = pickCol(cols, "currency");
  const orderNumCol = pickCol(
    cols,
    "ordernumber",
    "order_number",
    "order_no",
    "orderno",
    "orderNumber"
  );

  if (!customerCol) {
    throw new Error("orders table: missing customerid (or customer_id) column");
  }
  if (!payRefCol) {
    throw new Error("orders table: missing payment_reference column (run migration 026)");
  }
  if (!itemsCol) {
    throw new Error("orders table: missing items (or line_items) JSON column for line items");
  }

  await assertInventoryAllowsLines(client, ctx.items);
  await decrementInventoryForLines(client, ctx.items);

  const shopId = shopCol ? await resolveShopId(client, ctx.items) : null;
  if (shopCol && (shopId === null || shopId <= 0)) {
    throw new Error("Could not resolve shopid from order line products");
  }

  const itemsJson = JSON.stringify(ctx.items);
  const shippingJson =
    typeof ctx.shippingAddress === "string"
      ? ctx.shippingAddress
      : JSON.stringify(ctx.shippingAddress);

  const itemsUdt = await columnUdtName(client, "orders", itemsCol);

  const amountNaira = Math.round(amountKobo) / 100;
  const money = deriveOrderMoney(ctx, amountNaira);
  const statusPaid = normalizeWebhookOrderStatus(
    process.env.ORDER_WEBHOOK_STATUS_PAID ?? "confirmed"
  );

  const idCol = pickCol(cols, "id", "order_id") ?? "id";

  type RowPiece = { ident: string; ph: string; val: unknown };
  const pieces: RowPiece[] = [];
  let pn = 1;

  const add = (col: string, val: unknown, jsonTextJsonb = false) => {
    const ph = jsonTextJsonb ? `$${pn}::text::jsonb` : `$${pn}`;
    pn += 1;
    pieces.push({ ident: safeIdent(col), ph, val });
  };

  add(customerCol, ctx.userId);
  add(payRefCol, reference);

  if (orderNumCol) {
    const typ = await columnPgTypes(client, "orders", orderNumCol);
    add(orderNumCol, deriveOrderNumberValue(reference, typ.data_type, typ.udt_name));
  }

  let parsedItems: unknown;
  try {
    parsedItems = JSON.parse(itemsJson);
  } catch {
    parsedItems = itemsJson;
  }
  const itemsIsJson = itemsUdt === "jsonb" || itemsUdt === "json";
  if (itemsIsJson) {
    add(itemsCol, toJsonbTextParam(parsedItems), true);
  } else {
    add(
      itemsCol,
      typeof parsedItems === "string" ? parsedItems : JSON.stringify(parsedItems)
    );
  }

  if (subtotalCol) {
    add(subtotalCol, money.subtotal);
  }
  if (totalCol) {
    add(totalCol, money.total);
  }
  if (shippingCostCol) {
    add(shippingCostCol, money.shipping);
  }
  if (!subtotalCol && !totalCol) {
    const legacyAmount = pickCol(cols, "amount", "total_amount");
    if (legacyAmount) {
      add(legacyAmount, money.total);
    }
  }
  if (statusCol) {
    add(statusCol, statusPaid);
  }
  if (shopCol && shopId != null) {
    add(shopCol, shopId);
  }
  if (productCol && ctx.items[0]?.productId) {
    add(productCol, ctx.items[0].productId);
  }
  if (paymentCol) {
    add(paymentCol, "success");
  }
  if (shippingCol) {
    const shipUdt = await columnUdtName(client, "orders", shippingCol);
    if (shipUdt === "jsonb" || shipUdt === "json") {
      const wrapped =
        typeof ctx.shippingAddress === "string"
          ? { address: ctx.shippingAddress }
          : (ctx.shippingAddress as Record<string, unknown>);
      add(shippingCol, toJsonbTextParam(wrapped), true);
    } else {
      add(shippingCol, shippingJson);
    }
  }
  if (currencyCol) {
    add(currencyCol, verified.currency);
  }

  /**
   * Requires migration `027_orders_payment_reference_unique.sql` (named UNIQUE on payment_reference).
   */
  const insertSql = `
    INSERT INTO orders (${pieces.map((p) => p.ident).join(", ")})
    VALUES (${pieces.map((p) => p.ph).join(", ")})
    ON CONFLICT ON CONSTRAINT orders_payment_reference_unique DO NOTHING
    RETURNING ${safeIdent(idCol)} AS inserted_id
  `;

  const ins = await client.query<{ inserted_id: number | string | null }>(
    insertSql,
    pieces.map((p) => p.val)
  );
  let orderIdRaw = ins.rows[0]?.inserted_id;

  if (orderIdRaw === null || orderIdRaw === undefined) {
    const ex = await client.query<{ oid: number | string }>(
      `SELECT ${safeIdent(idCol)} AS oid FROM orders WHERE ${safeIdent(payRefCol)} = $1 LIMIT 1`,
      [reference]
    );
    orderIdRaw = ex.rows[0]?.oid;
  }

  if (orderIdRaw === null || orderIdRaw === undefined) {
    throw new Error("Order insert failed (no id returned)");
  }

  const orderId = typeof orderIdRaw === "string" ? Number(orderIdRaw) : orderIdRaw;
  if (!Number.isFinite(orderId)) {
    throw new Error("Order insert returned invalid id");
  }

  return { orderId };
}
