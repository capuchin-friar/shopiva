import { db } from "../../config/database.js";
import { buildStorefrontProductDetail } from "../business/storefrontProductDto.js";
import { inventory, product } from "../../models/business/product.js";
import type { InventoryRow, ProductRow } from "../../models/business/product.js";

export type CartLineJoined = {
  cart_item_id: number;
  inventory_id: number;
  quantity: number;
  unit_price: number;
  currency: string;
  sku: string | null;
  product_id: number;
  product_name: string;
  images: unknown;
};

function priceNear(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.5;
}

/**
 * Prices the storefront would show for this SKU / product (inventory row + variant DTO prices).
 * Used to validate an optional client-supplied unit price at add-to-cart.
 */
function collectAllowedCartUnitPrices(
  prod: ProductRow,
  invRows: InventoryRow[],
  inventoryId: number
): number[] {
  const detail = buildStorefrontProductDetail(prod, invRows);
  const allowed = new Set<number>();
  const inv = invRows.find((r) => r.id === inventoryId);
  if (inv) {
    const n = Number(inv.price);
    if (Number.isFinite(n) && n >= 0) allowed.add(n);
  }
  const rec = detail as Record<string, unknown>;
  const top = Number(rec.price);
  if (Number.isFinite(top) && top >= 0) allowed.add(top);
  const vars = rec.variants;
  if (Array.isArray(vars)) {
    for (const v of vars) {
      if (!v || typeof v !== "object") continue;
      const o = v as { id?: unknown; price?: unknown };
      const vid = Number(o.id);
      const p = Number(o.price);
      if (!Number.isFinite(p) || p < 0) continue;
      if (!Number.isFinite(vid) || vid <= 0) {
        allowed.add(p);
      } else if (vid === inventoryId) {
        allowed.add(p);
      }
    }
  }
  return [...allowed];
}

function clientUnitPriceAllowed(client: number, allowed: number[]): boolean {
  if (!Number.isFinite(client) || client < 0) return false;
  if (!allowed.length) return true;
  return allowed.some((a) => priceNear(client, a));
}

async function cartTableExists(): Promise<boolean> {
  const { rows } = await (await db()).query<{ reg: string | null }>(
    `SELECT to_regclass('public.cart_items')::text AS reg`
  );
  return Boolean(rows[0]?.reg);
}

export async function listCartLinesForUser(userId: number): Promise<CartLineJoined[]> {
  if (!(await cartTableExists())) return [];
  const { rows } = await (await db()).query<CartLineJoined>(
    `SELECT
      c.id AS cart_item_id,
      c.inventory_id,
      c.quantity,
      COALESCE(c.unit_price_snapshot, i.price::float8) AS unit_price,
      COALESCE(NULLIF(TRIM(i.currency::text), ''), 'NGN') AS currency,
      i.sku,
      p.id AS product_id,
      p.name AS product_name,
      p.images
    FROM cart_items c
    INNER JOIN inventory i ON i.id = c.inventory_id
    INNER JOIN products p ON p.id = i.product_id
    WHERE c.user_id = $1
    ORDER BY c.updated_at DESC`,
    [userId]
  );
  return rows;
}

export async function addOrIncrementCartLine(
  userId: number,
  inventoryId: number,
  addQty: number,
  clientUnitPrice?: number | null
): Promise<{ cart_item_id: number; quantity: number }> {
  if (!(await cartTableExists())) throw new Error("Cart is not available on this database");
  if (!Number.isFinite(inventoryId) || inventoryId <= 0) throw new Error("Invalid inventory_id");
  const q = Math.min(99, Math.max(1, Math.trunc(addQty) || 1));

  const inv = await (await db()).query<{ id: number }>(
    `SELECT i.id FROM inventory i INNER JOIN products p ON p.id = i.product_id WHERE i.id = $1`,
    [inventoryId]
  );
  if (!inv.rows[0]) throw new Error("Inventory item not found");

  let snapshotPrice: number | null = null;
  if (clientUnitPrice != null && Number.isFinite(Number(clientUnitPrice))) {
    const invRow = await inventory.getById(inventoryId);
    if (!invRow) throw new Error("Inventory item not found");
    const prod = await product.getById(invRow.product_id);
    if (!prod) throw new Error("Product not found");
    const invRows = await inventory.getByProductId(invRow.product_id);
    const allowed = collectAllowedCartUnitPrices(prod, invRows, inventoryId);
    const client = Number(clientUnitPrice);
    if (!clientUnitPriceAllowed(client, allowed)) {
      throw new Error("Price for this option is out of date. Refresh the product page and try again.");
    }
    snapshotPrice = client;
  }

  const { rows } = await (await db()).query<{ id: number; quantity: number }>(
    `INSERT INTO cart_items (user_id, inventory_id, quantity, unit_price_snapshot)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, inventory_id)
     DO UPDATE SET
       quantity = LEAST(cart_items.quantity + EXCLUDED.quantity, 99),
       unit_price_snapshot = COALESCE(EXCLUDED.unit_price_snapshot, cart_items.unit_price_snapshot),
       updated_at = now()
     RETURNING id, quantity`,
    [userId, inventoryId, q, snapshotPrice]
  );
  const row = rows[0];
  if (!row) throw new Error("Could not update cart");
  return { cart_item_id: row.id, quantity: row.quantity };
}

export async function setCartLineQuantity(
  userId: number,
  cartItemId: number,
  quantity: number
): Promise<{ cart_item_id: number; quantity: number } | null> {
  if (!(await cartTableExists())) throw new Error("Cart is not available on this database");
  const q = Math.min(99, Math.max(1, Math.trunc(quantity) || 1));
  const { rows } = await (await db()).query<{ id: number; quantity: number }>(
    `UPDATE cart_items SET quantity = $3, updated_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING id, quantity`,
    [cartItemId, userId, q]
  );
  const row = rows[0];
  if (!row) return null;
  return { cart_item_id: row.id, quantity: row.quantity };
}

export async function deleteCartLine(userId: number, cartItemId: number): Promise<boolean> {
  if (!(await cartTableExists())) return false;
  const { rowCount } = await (await db()).query(`DELETE FROM cart_items WHERE id = $1 AND user_id = $2`, [
    cartItemId,
    userId,
  ]);
  return (rowCount ?? 0) > 0;
}
