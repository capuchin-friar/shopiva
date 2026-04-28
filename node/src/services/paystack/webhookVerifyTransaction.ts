import { paystack } from "../paystack.js";

export type PaystackVerifySuccess = {
  ok: true;
  reference: string;
  amountKobo: number;
  currency: string;
  metadata: Record<string, unknown>;
  customerEmail: string | null;
  paidAtIso: string | null;
  chargeId: number | null;
  rawData: Record<string, unknown>;
};

export type PaystackVerifyFailure = { ok: false; message: string };

/**
 * Server-side confirmation: never trust webhook body alone — Paystack verify API is source of truth.
 * @see https://paystack.com/docs/api/#transaction-verify
 */
export async function verifyTransactionWithPaystack(
  reference: string
): Promise<PaystackVerifySuccess | PaystackVerifyFailure> {
  const ref = String(reference ?? "").trim();
  if (!ref) {
    return { ok: false, message: "Missing reference" };
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await paystack.verifyTransaction(ref)) as Record<string, unknown>;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: msg };
  }

  if (raw.status !== true) {
    return {
      ok: false,
      message: String(raw.message ?? "Paystack verify returned non-success status flag"),
    };
  }

  const data = raw.data && typeof raw.data === "object" ? (raw.data as Record<string, unknown>) : null;
  if (!data) {
    return { ok: false, message: "Paystack verify: missing data object" };
  }

  const payStatus = String(data.status ?? "").toLowerCase();
  if (payStatus !== "success") {
    return { ok: false, message: `Paystack verify: transaction status is ${data.status ?? "unknown"}` };
  }

  const amountRaw = data.amount;
  const amountKobo =
    typeof amountRaw === "number"
      ? Math.trunc(amountRaw)
      : typeof amountRaw === "string" && amountRaw.trim()
        ? Math.trunc(Number(amountRaw))
        : NaN;
  if (!Number.isFinite(amountKobo) || amountKobo <= 0) {
    return { ok: false, message: "Paystack verify: invalid amount" };
  }

  const currency = String(data.currency ?? "NGN").toUpperCase();
  const meta =
    data.metadata && typeof data.metadata === "object" && !Array.isArray(data.metadata)
      ? (data.metadata as Record<string, unknown>)
      : {};

  const customer = data.customer;
  let customerEmail: string | null = null;
  if (customer && typeof customer === "object" && customer !== null && "email" in customer) {
    const em = (customer as { email?: unknown }).email;
    customerEmail = typeof em === "string" && em.trim() ? em.trim() : null;
  }
  if (!customerEmail && typeof data.customer_email === "string" && data.customer_email.trim()) {
    customerEmail = data.customer_email.trim();
  }

  const paidRaw = data.paid_at;
  let paidAtIso: string | null = null;
  if (typeof paidRaw === "string" && paidRaw.trim()) {
    const ms = Date.parse(paidRaw.trim());
    paidAtIso = Number.isNaN(ms) ? null : new Date(ms).toISOString();
  }

  const idRaw = data.id;
  const chargeId =
    typeof idRaw === "number"
      ? Math.trunc(idRaw)
      : typeof idRaw === "string" && idRaw.trim()
        ? Math.trunc(Number(idRaw))
        : null;

  const refOut = typeof data.reference === "string" && data.reference.trim() ? data.reference.trim() : ref;

  return {
    ok: true,
    reference: refOut,
    amountKobo,
    currency,
    metadata: meta,
    customerEmail,
    paidAtIso,
    chargeId: chargeId !== null && Number.isFinite(chargeId) ? chargeId : null,
    rawData: data,
  };
}
