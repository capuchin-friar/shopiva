import crypto from "crypto";
import { paystack } from "./paystack.js";
import { paystack_transaction } from "../models/paystack_transaction.js";

export type PaystackWebhookEnvelope = {
  event: string;
  data?: Record<string, unknown>;
};

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

/**
 * Parses Paystack webhook JSON and upserts `paystack_transactions`.
 * Unknown event shapes still persist using `reference` resolution rules.
 */
export async function persistPaystackWebhook(payload: PaystackWebhookEnvelope): Promise<{ stored: boolean; reference?: string }> {
  const event = payload.event ?? "unknown";
  const data = payload.data && typeof payload.data === "object" ? payload.data : {};

  const reference = resolveReference(data as Record<string, unknown>);
  if (!reference) {
    return { stored: false };
  }

  const chargeId = pickNumber((data as { id?: unknown }).id);

  const row = await paystack_transaction.upsert({
    paystack_charge_id: chargeId,
    reference,
    event,
    amount: pickNumber((data as { amount?: unknown }).amount),
    currency: pickString((data as { currency?: unknown }).currency),
    status: pickString((data as { status?: unknown }).status),
    channel: pickString((data as { channel?: unknown }).channel),
    customer_email: extractCustomerEmail(data as Record<string, unknown>),
    metadata:
      data.metadata && typeof data.metadata === "object" && data.metadata !== null && !Array.isArray(data.metadata)
        ? (data.metadata as Record<string, unknown>)
        : {},
    paid_at: pickString((data as { paid_at?: unknown }).paid_at),
    raw_payload: payload as unknown as Record<string, unknown>,
  });

  return { stored: true, reference: row.reference };
}
