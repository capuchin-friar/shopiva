import type { PoolClient } from "pg";
import type { PaystackVerifySuccess } from "./webhookVerifyTransaction.js";
import type { ValidatedOrderContext, WebhookOrderLine } from "./webhookMetadata.js";

const AMOUNT_TOLERANCE_KOBO = 150;

function pickCol(cols: Set<string>, ...names: string[]): string | null {
  return names.find((n) => cols.has(n)) ?? null;
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
  const expectedTolerance = AMOUNT_TOLERANCE_KOBO;

  const colRes = await client.query<{ column_name: string }>(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'orders'`
  );
  const cols = new Set(colRes.rows.map((r) => r.column_name));
  if (!cols.size) {
    throw new Error("orders table has no columns (unexpected)");
  }

  const customerCol = pickCol(cols, "customer_id", "customerid");
  const itemsCol = pickCol(cols, "items", "line_items", "order_lines");
  const amountCol = pickCol(cols, "total_amount", "amount", "total", "subtotal");
  const statusCol = pickCol(cols, "status", "order_status");
  const payRefCol = pickCol(cols, "payment_reference", "paymentreference");
  const shopCol = pickCol(cols, "shop_id", "shopid", "shopId");
  const productCol = pickCol(cols, "product_id", "productid");
  const paymentCol = pickCol(cols, "payment_status", "payment", "payment_method");
  const shippingCol = pickCol(cols, "shipping_address", "shippingaddress");
  const currencyCol = pickCol(cols, "currency");

  if (!customerCol) {
    throw new Error("orders table: missing customer_id (or customerid) column");
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
    throw new Error("Could not resolve shop_id from order line products");
  }

  const itemsJson = JSON.stringify(ctx.items);
  const shippingJson =
    typeof ctx.shippingAddress === "string"
      ? ctx.shippingAddress
      : JSON.stringify(ctx.shippingAddress);

  const amountNaira = Math.round(amountKobo) / 100;
  const statusPaid =
    (process.env.ORDER_WEBHOOK_STATUS_PAID ?? "paid").trim() || "paid";

  const idCol = pickCol(cols, "id", "order_id") ?? "id";

  const columns: string[] = [];
  const values: unknown[] = [];

  const push = (col: string, val: unknown) => {
    columns.push(safeIdent(col));
    values.push(val);
  };

  push(customerCol, ctx.userId);
  push(payRefCol, reference);
  try {
    push(itemsCol, JSON.parse(itemsJson));
  } catch {
    push(itemsCol, itemsJson);
  }

  if (amountCol) {
    push(amountCol, amountNaira);
  }
  if (statusCol) {
    push(statusCol, statusPaid);
  }
  if (shopCol && shopId != null) {
    push(shopCol, shopId);
  }
  if (productCol && ctx.items[0]?.productId) {
    push(productCol, ctx.items[0].productId);
  }
  if (paymentCol) {
    push(paymentCol, "success");
  }
  if (shippingCol) {
    push(shippingCol, shippingJson);
  }
  if (currencyCol) {
    push(currencyCol, verified.currency);
  }

  const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(", ");

  const insertSql = `
    INSERT INTO orders (${columns.join(", ")})
    VALUES (${placeholders})
    ON CONFLICT (${safeIdent(payRefCol)}) DO NOTHING
    RETURNING ${safeIdent(idCol)} AS inserted_id
  `;

  const ins = await client.query<{ inserted_id: number | string | null }>(insertSql, values);
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
