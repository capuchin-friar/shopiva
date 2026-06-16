import { NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';

export async function GET() {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, user_id AS "userId", inventory_id AS "inventoryId", quantity, created_at AS "createdAt"
       FROM cart_items
       ORDER BY created_at DESC
       LIMIT 100`
    );

    return NextResponse.json({ cart: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
