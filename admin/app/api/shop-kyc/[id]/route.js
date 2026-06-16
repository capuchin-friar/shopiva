import { NextResponse } from 'next/server';
import { getPool } from '../../../../lib/db';

export async function GET(request, { params }) {
  try {
    const shopId = Number(params.id);
    if (Number.isNaN(shopId)) {
      return NextResponse.json({ error: 'Invalid shop identifier' }, { status: 400 });
    }

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
              s.location->>'address' AS "shopAddress",
              s.verificationdocuments->'businessLicense'->>'verified' AS "businessLicenseVerified",
              s.verificationdocuments->'businessLicense'->>'url' AS "businessLicenseUrl",
              s.verificationdocuments->'businessLicense'->>'submittedAt' AS "businessLicenseSubmittedAt",
              s.verificationdocuments->'cacDocument'->>'verified' AS "cacDocumentVerified",
              s.verificationdocuments->'cacDocument'->>'url' AS "cacDocumentUrl",
              s.verificationdocuments->'cacDocument'->>'submittedAt' AS "cacDocumentSubmittedAt",
              s.verificationdocuments->'proofOfAddress'->>'verified' AS "proofOfAddressVerified",
              s.verificationdocuments->'proofOfAddress'->>'url' AS "proofOfAddressUrl",
              s.verificationdocuments->'proofOfAddress'->>'submittedAt' AS "proofOfAddressSubmittedAt",
              s.verificationdocuments->'identityProof'->>'verified' AS "identityProofVerified",
              s.verificationdocuments->'identityProof'->>'url' AS "identityProofUrl",
              s.verificationdocuments->'identityProof'->>'submittedAt' AS "identityProofSubmittedAt",
              s.createdat AS "createdAt"
       FROM shops s
       LEFT JOIN users u ON u.id = s.ownerid
       WHERE s.id = $1
       LIMIT 1`,
      [shopId],
    );

    return NextResponse.json({ shop: rows[0] ?? null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const shopId = Number(params.id);
    const body = await request.json();
    const action = body.action;
    const docKey = body.docKey;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const pool = getPool();

    if (docKey) {
      const validKeys = ['businessLicense', 'cacDocument', 'proofOfAddress', 'identityProof'];
      if (!validKeys.includes(docKey)) {
        return NextResponse.json({ error: 'Invalid document key' }, { status: 400 });
      }

      const verified = action === 'approve';
      await pool.query(
        `UPDATE shops SET verificationdocuments = jsonb_set(verificationdocuments, $1, to_jsonb($2::boolean), true) WHERE id = $3`,
        [[docKey, 'verified'], verified, shopId],
      );

      return NextResponse.json({ success: true, action, docKey });
    }

    const isVerified = action === 'approve';
    const status = action === 'approve' ? 'active' : 'pending_approval';

    await pool.query(
      `UPDATE shops SET isverified = $1, status = $2 WHERE id = $3`,
      [isVerified, status, shopId],
    );

    return NextResponse.json({ success: true, action });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
