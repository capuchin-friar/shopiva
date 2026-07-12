import { NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';

export async function GET() {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, product_id AS "productId", sku, quantity, reserved_quantity AS "reservedQuantity", price, track_inventory AS "trackInventory", updated_at AS "updatedAt"
       FROM inventory
       ORDER BY updated_at DESC
       LIMIT 100`
    );

    return NextResponse.json({ inventory: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
