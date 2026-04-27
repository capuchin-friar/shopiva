import crypto from "crypto";
import { Pool } from "pg";
import { db } from "../config/database.js";
import { paystack } from "./paystack.js";
import { paystack_transaction } from "../models/paystack_transaction.js";

export type PaystackWebhookEnvelope = {
  event: string;
  data?: Record<string, unknown>;
};

let paystackWebhookPool: Pool | null = null;

/**
 * Webhook-only DB override:
 * - `DB` (from .env) is used only for Paystack webhook persistence.
 * - Fallback to shared app pool when not provided.
 */
async function getPaystackWebhookPool(): Promise<Pool> {
  // const webhookDb = process.env.DB?.trim();
  const webhookDb = "postgresql://neondb_owner:npg_1xTCdDvHGk4X@ep-damp-mountain-aeunyf6d-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  if (!webhookDb) return db();
  if (!paystackWebhookPool) {
    paystackWebhookPool = new Pool({
      connectionString: webhookDb,
      max: Number(process.env.DB_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
    paystackWebhookPool.on("error", (err) => {
      console.error("Unexpected paystack webhook database pool error:", err);
    });
  }
  return paystackWebhookPool;
}

/** HMAC SHA512 of raw body; must match Paystack `x-paystack-signature`. */
export function verifyPaystackWebhookSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
  const secret = paystack.secretKey();
  if (!secret) return false;
  const sig = (signatureHeader ?? "").trim();
  if (!sig) return false;
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(sig, "hex"));
  } catch {
    return false;
  }
}

function pickString(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

function pickNumber(v: unknown): number | null {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** `paystack_transactions.amount` is BIGINT; coerce Paystack subunit amounts to integers. */
function pickAmountKobo(v: unknown): number | null {
  const n = pickNumber(v);
  if (n === null) return null;
  const t = Math.trunc(n);
  return Number.isFinite(t) ? t : null;
}

/** Only pass values PostgreSQL accepts for `TIMESTAMPTZ` (avoids invalid string → 500). */
function pickPaidAtForPg(v: unknown): string | null {
  if (typeof v !== "string" || !v.trim()) return null;
  const ms = Date.parse(v.trim());
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toISOString();
}

function extractCustomerEmail(data: Record<string, unknown>): string | null {
  const customer = data.customer;
  if (customer && typeof customer === "object" && customer !== null && "email" in customer) {
    return pickString((customer as { email?: unknown }).email);
  }
  return pickString(data.customer_email);
}

function resolveReference(data: Record<string, unknown>): string | null {
  const ref = pickString(data.reference);
  if (ref) return ref;
  const id = pickNumber(data.id);
  if (id !== null) return `paystack_txn_${id}`;
  return null;
}

export type PersistPaystackWebhookResult = {
  received: true;
  /** True when Paystack retried the same raw JSON body; DB state was not written again. */
  duplicate: boolean;
  /** True when a row in `paystack_transactions` was upserted in this request. */
  stored: boolean;
  reference?: string;
};

/**
 * Parses Paystack webhook JSON and upserts `paystack_transactions`.
 *
 * **Idempotency:** identical webhook bodies (same bytes Paystack signs) share a SHA-256 key in
 * `paystack_webhook_deliveries`. Retries return `{ duplicate: true, stored: false }` with HTTP 200
 * so Paystack stops retrying, without re-running side effects you may add after the upsert later.
 * `paystack_transactions` remains keyed by `reference` (ON CONFLICT) for one canonical row per payment ref.
 */
export async function persistPaystackWebhook(rawBody: Buffer, payload: PaystackWebhookEnvelope): Promise<PersistPaystackWebhookResult> {
  const event = payload.event ?? "unknown";
  const data = payload.data && typeof payload.data === "object" ? payload.data : {};

  const reference = resolveReference(data as Record<string, unknown>);
  if (!reference) {
    return { received: true, duplicate: false, stored: false };
  }

  const bodyHash = crypto.createHash("sha256").update(rawBody).digest("hex");
  const chargeId = pickNumber((data as { id?: unknown }).id);

  const upsertPayload = {
    paystack_charge_id: chargeId,
    reference,
    event,
    amount: pickAmountKobo((data as { amount?: unknown }).amount),
    currency: pickString((data as { currency?: unknown }).currency),
    status: pickString((data as { status?: unknown }).status),
    channel: pickString((data as { channel?: unknown }).channel),
    customer_email: extractCustomerEmail(data as Record<string, unknown>),
    metadata:
      data.metadata && typeof data.metadata === "object" && data.metadata !== null && !Array.isArray(data.metadata)
        ? (data.metadata as Record<string, unknown>)
        : {},
    paid_at: pickPaidAtForPg((data as { paid_at?: unknown }).paid_at),
    raw_payload: payload as unknown as Record<string, unknown>,
  };

  const pool = await getPaystackWebhookPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const claim = await client.query<{ id: number }>(
      `INSERT INTO paystack_webhook_deliveries (body_hash, reference, paystack_event)
       VALUES ($1, $2, $3)
       ON CONFLICT (body_hash) DO NOTHING
       RETURNING id`,
      [bodyHash, reference, event]
    );
    

    if (claim.rowCount === 0) {
      await client.query("COMMIT");
      return { received: true, duplicate: true, stored: false, reference };
    }

    const row = await paystack_transaction.upsert(upsertPayload, client);
    await client.query("COMMIT");
    return { received: true, duplicate: false, stored: true, reference: row.reference };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
