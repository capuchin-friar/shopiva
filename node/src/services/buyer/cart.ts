import { db } from "../../config/database.js";

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
      i.price::float8 AS unit_price,
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
  addQty: number
): Promise<{ cart_item_id: number; quantity: number }> {
  if (!(await cartTableExists())) throw new Error("Cart is not available on this database");
  if (!Number.isFinite(inventoryId) || inventoryId <= 0) throw new Error("Invalid inventory_id");
  const q = Math.min(99, Math.max(1, Math.trunc(addQty) || 1));

  const inv = await (await db()).query<{ id: number }>(
    `SELECT i.id FROM inventory i INNER JOIN products p ON p.id = i.product_id WHERE i.id = $1`,
    [inventoryId]
  );
  if (!inv.rows[0]) throw new Error("Inventory item not found");

  const { rows } = await (await db()).query<{ id: number; quantity: number }>(
    `INSERT INTO cart_items (user_id, inventory_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, inventory_id)
     DO UPDATE SET
       quantity = LEAST(cart_items.quantity + EXCLUDED.quantity, 99),
       updated_at = now()
     RETURNING id, quantity`,
    [userId, inventoryId, q]
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
