import { NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const isVerified = url.searchParams.get('isVerified') || undefined;
    const query = url.searchParams.get('query') || undefined;

    const where = [];
    const params = [];
    let idx = 1;

    if (isVerified && isVerified !== 'All') {
      where.push(`s.isverified = $${idx++}`);
      params.push(isVerified === 'true');
    }

    if (query) {
      where.push(
        `(s.name ILIKE $${idx} OR u.email ILIKE $${idx} OR u.phone ILIKE $${idx})`,
      );
      params.push(`%${query}%`);
      idx += 1;
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const pool = getPool();

    const { rows } = await pool.query(
      `SELECT s.id,
              s.ownerid AS "ownerId",
              CONCAT(u.fname, ' ', u.lname) AS "ownerName",
              u.email AS "ownerEmail",
              u.phone AS "ownerPhone",
              s.name,
              s.status,
              s.isverified AS "isVerified",
              s.verificationdocuments->'businessLicense'->>'verified' AS "businessLicenseVerified",
              s.verificationdocuments->'businessLicense'->>'url' AS "businessLicenseUrl",
              s.verificationdocuments->'taxId'->>'verified' AS "taxIdVerified",
              s.verificationdocuments->'taxId'->>'url' AS "taxIdUrl",
              s.verificationdocuments->'identityProof'->>'verified' AS "identityProofVerified",
              s.verificationdocuments->'identityProof'->>'url' AS "identityProofUrl",
              s.createdat AS "createdAt"
       FROM shops s
       LEFT JOIN users u ON u.id = s.ownerid
       ${whereClause}
       ORDER BY s.createdat DESC
       LIMIT 100`,
      params,
    );

    return NextResponse.json({ "shop-kyc": rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
