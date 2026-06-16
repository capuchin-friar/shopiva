import { NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';

export async function GET() {
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, ownerid AS "ownerId", name, status, isactive AS "isActive", category, createdat AS "createdAt"
       FROM shops
       ORDER BY createdat DESC
       LIMIT 100`
    );

    return NextResponse.json({ shops: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
