import { NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';

export async function GET() {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, order_id AS "orderId", customer_id AS "customerId", shop_id AS "shopId", status, estimated_delivery_date AS "estimatedDeliveryDate", created_at AS "createdAt"
       FROM returns
       ORDER BY created_at DESC
       LIMIT 100`
    );

    return NextResponse.json({ returns: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
