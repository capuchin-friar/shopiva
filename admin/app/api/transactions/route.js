import { NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';

export async function GET() {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, reference, event, amount, currency, status, customer_email AS "customerEmail", created_at AS "createdAt"
       FROM paystack_transactions
       ORDER BY created_at DESC
       LIMIT 100`
    );

    return NextResponse.json({ transactions: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
