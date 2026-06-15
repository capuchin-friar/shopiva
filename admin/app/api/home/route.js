import { NextResponse } from 'next/server';
import { getPool } from '../../../../lib/db';

export async function GET() {
  try {
    const pool = getPool();
    const totalRes = await pool.query(`SELECT COUNT(*)::int AS total FROM users`);
    const activeRes = await pool.query(`SELECT COUNT(*)::int AS active FROM users WHERE accountstatus = 'active' OR COALESCE(status->'deleted'->>'enabled','false') = 'false'`);
    const adminsRes = await pool.query(`SELECT COUNT(*)::int AS admins FROM users WHERE role = 'admin'`);

    return NextResponse.json({
      metrics: {
        totalUsers: totalRes.rows[0].total,
        activeUsers: activeRes.rows[0].active,
        adminUsers: adminsRes.rows[0].admins,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
