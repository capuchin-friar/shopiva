import { NextResponse } from 'next/server';
import { getPool } from '../../../../lib/db';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const role = url.searchParams.get('role') || undefined;
    const os = url.searchParams.get('os') || undefined;
    const email = url.searchParams.get('email') || undefined;
    const phone = url.searchParams.get('phone') || undefined;

    const where: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (role && role !== 'All') {
      where.push(`role = $${idx++}`);
      params.push(role);
    }
    if (os && os !== 'All') {
      where.push(`os = $${idx++}`);
      params.push(os);
    }
    if (email) {
      where.push(`LOWER(email) LIKE $${idx++}`);
      params.push(`%${email.toLowerCase()}%`);
    }
    if (phone) {
      where.push(`phone LIKE $${idx++}`);
      params.push(`%${phone}%`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const sql = `SELECT id, fname, lname, email, phone, role, COALESCE(location->>'city','') as city, createdAt, lastLogin FROM users ${whereClause} ORDER BY createdAt DESC LIMIT 100`;

    const pool = getPool();
    const { rows } = await pool.query(sql, params);

    // Map rows to client-friendly shape
    const users = rows.map((r) => ({
      id: r.id,
      name: `${r.fname} ${r.lname}`,
      email: r.email,
      phone: r.phone,
      role: r.role,
      city: r.city,
      createdAt: r.createdat,
      lastLogin: r.lastlogin,
    }));

    return NextResponse.json({ users });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
