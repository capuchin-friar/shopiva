import crypto from "crypto";
import { db } from "../../config/database.js";
import { paystack_transaction } from "../../models/paystack_transaction.js";
import type { PaystackWebhookEnvelope } from "../paystackWebhook.js";
import { resolveReference } from "../paystackWebhook.js";
import { createOrderFromWebhook } from "./webhookOrderFromPaystack.js";
import {
  expectedAmountKoboFromPricing,
  parseAndValidateOrderMetadata,
} from "./webhookMetadata.js";
import { verifyTransactionWithPaystack } from "./webhookVerifyTransaction.js";

const AMOUNT_TOLERANCE_KOBO = 150;

export type ChargeSuccessResult = {
  reference: string;
  orderId?: number;
  /** True when we did not run the full pipeline (duplicate order, bad metadata, missing reference). */
  skipped: boolean;
};

/**
 * End-to-end handler for `charge.success` after the HTTP layer has verified HMAC and parsed JSON.
 *
 * Critical path:
 * 1. Idempotency — existing `orders.payment_reference` → stop (still success for Paystack).
 * 2. Paystack verify API — authoritative status + amount + metadata.
 * 3. Validate custom metadata (reconstruct cart context).
 * 4. Amount integrity — metadata expected kobo vs Paystack amount (tolerance for rounding).
 * 5. Single DB transaction — audit delivery row (best-effort), create order, upsert `paystack_transactions`.
 */
export async function handleChargeSuccess(
  rawBody: Buffer,
  envelope: PaystackWebhookEnvelope
): Promise<ChargeSuccessResult> {
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};

  const reference = resolveReference(data);
  if (!reference) {
    console.warn("[paystack webhook] charge.success: missing reference, skipping");
    return { reference: "", skipped: true };
  }

  const pool = await db();
  const existing = await pool.query<{ one: number }>(
    `SELECT 1 AS one FROM orders WHERE payment_reference = $1 LIMIT 1`,
    [reference]
  );
  if ((existing.rowCount ?? 0) > 0) {
    return { reference, skipped: true };
  }

  const verified = await verifyTransactionWithPaystack(reference);
  if (!verified.ok) {
    throw new Error(`[paystack webhook] verify failed ref=${reference}: ${verified.message}`);
  }

  const fromWebhook =
    data.metadata &&
    typeof data.metadata === "object" &&
    !Array.isArray(data.metadata)
      ? (data.metadata as Record<string, unknown>)
      : {};
  const mergedMeta = { ...fromWebhook, ...verified.metadata };

  const parsed = parseAndValidateOrderMetadata(mergedMeta);
  if (!parsed.ok) {
    console.warn(
      `[paystack webhook] invalid metadata ref=${reference}: ${parsed.message}`
    );
    return { reference, skipped: true };
  }

  const expectedKobo = expectedAmountKoboFromPricing(parsed.ctx.pricing);
  if (expectedKobo === null || expectedKobo <= 0) {
    console.warn(
      `[paystack webhook] pricingBreakdown missing totals ref=${reference}; abort order creation`
    );
    return { reference, skipped: true };
  }

  if (Math.abs(expectedKobo - verified.amountKobo) > AMOUNT_TOLERANCE_KOBO) {
    throw new Error(
      `[paystack webhook] amount mismatch ref=${reference}: metadata ~${expectedKobo} kobo, Paystack ${verified.amountKobo} kobo`
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const bodyHash = crypto.createHash("sha256").update(rawBody).digest("hex");
    try {
      await client.query(
        `INSERT INTO paystack_webhook_deliveries (body_hash, reference, paystack_event)
         VALUES ($1, $2, $3)
         ON CONFLICT (body_hash) DO NOTHING`,
        [bodyHash, reference, "charge.success"]
      );
    } catch (e) {
      console.warn("[paystack webhook] delivery audit insert skipped:", e);
    }

    const channel =
      typeof data.channel === "string" && data.channel.trim()
        ? data.channel.trim()
        : null;

    const baseTxn = {
      paystack_charge_id: verified.chargeId,
      reference,
      event: "charge.success",
      amount: verified.amountKobo,
      currency: verified.currency,
      status: "SUCCESS",
      channel,
      customer_email: verified.customerEmail,
      paid_at: verified.paidAtIso,
      raw_payload: envelope as unknown as Record<string, unknown>,
    };

    // (a) Persist verified charge in `paystack_transactions` before mutating `orders`.
    await paystack_transaction.upsert(
      { ...baseTxn, metadata: mergedMeta },
      client
    );

    const { orderId } = await createOrderFromWebhook(client, {
      reference,
      verified,
      ctx: parsed.ctx,
    });

    // (b) Order row created; refresh metadata with internal `order_id` for support and audits.
    await paystack_transaction.upsert(
      { ...baseTxn, metadata: { ...mergedMeta, order_id: orderId } },
      client
    );

    await client.query("COMMIT");
    return { reference, orderId, skipped: false };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
