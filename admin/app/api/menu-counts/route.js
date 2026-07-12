import { NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';

export async function GET() {
  try {
    const pool = getPool();

    const [usersRes, productsRes, inventoryRes, shopsRes, shopKycRes, ordersRes, returnsRes, disputesRes, cartRes, transactionsRes] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM products'),
      pool.query('SELECT COUNT(*)::int AS count FROM inventory'),
      pool.query('SELECT COUNT(*)::int AS count FROM shops'),
      pool.query('SELECT COUNT(*)::int AS count FROM shops WHERE NOT isverified'),
      pool.query('SELECT COUNT(*)::int AS count FROM orders'),
      pool.query('SELECT COUNT(*)::int AS count FROM returns'),
      pool.query('SELECT COUNT(*)::int AS count FROM disputes'),
      pool.query('SELECT COUNT(*)::int AS count FROM cart_items'),
      pool.query('SELECT COUNT(*)::int AS count FROM paystack_transactions'),
    ]);

    return NextResponse.json({
      users: usersRes.rows[0]?.count ?? 0,
      products: productsRes.rows[0]?.count ?? 0,
      inventory: inventoryRes.rows[0]?.count ?? 0,
      shops: shopsRes.rows[0]?.count ?? 0,
      shopKyc: shopKycRes.rows[0]?.count ?? 0,
      orders: ordersRes.rows[0]?.count ?? 0,
      returns: returnsRes.rows[0]?.count ?? 0,
      disputes: disputesRes.rows[0]?.count ?? 0,
      cart: cartRes.rows[0]?.count ?? 0,
      transactions: transactionsRes.rows[0]?.count ?? 0,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
