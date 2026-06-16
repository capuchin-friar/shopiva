import { NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';

export async function GET() {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, shop_id AS "shopId", name, status, is_published AS "isPublished", created_at AS "createdAt"
       FROM products
       ORDER BY created_at DESC
       LIMIT 100`
    );

    return NextResponse.json({ products: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
