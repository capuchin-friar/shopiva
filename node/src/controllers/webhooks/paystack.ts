/**
 * POST /webhook/paystack — verifies HMAC, then `handleChargeSuccess` → `parseAndValidateOrderMetadata`
 * (`node/src/services/paystack/webhookMetadata.ts`) for `metadata.items` / pricing / shipping.
 *
 * POST /webhooks/paystack and POST /webhook/paystack
 * Raw JSON body is required so HMAC-SHA512 can be verified before parsing.
 */

import type { Request, Response } from "express";
import { verifyWebhookSignature } from "../../services/paystack/webhookSignature.js";
import { handleChargeSuccess } from "../../services/paystack/webhookChargeSuccess.js";
import type { PaystackWebhookEnvelope } from "../../services/paystackWebhook.js";

export async function PaystackWebhookController(req: Request, res: Response): Promise<void> {
  const raw = req.body;
  if (!Buffer.isBuffer(raw)) {
    res.status(500).json({ error: "Webhook misconfigured: expected raw body buffer" });
    return;
  }

  const signature = req.get("x-paystack-signature");
  if (!verifyWebhookSignature(raw, signature)) {
    res.sendStatus(400);
    return;
  }

  let payload: PaystackWebhookEnvelope;
  try {
    payload = JSON.parse(raw.toString("utf8")) as PaystackWebhookEnvelope;
  } catch {
    res.sendStatus(400);
    return;
  }

  const event = String(payload.event ?? "");
  if (event !== "charge.success") {
    res.sendStatus(200);
    return;
  }

  try {
    await handleChargeSuccess(raw, payload);
    res.sendStatus(200);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const root = err instanceof Error && err.cause !== undefined ? err.cause : err;
    const pg = root as { code?: string; detail?: string; constraint?: string; table?: string };
    if (pg.code) {
      console.error("paystack webhook charge.success error:", msg, {
        code: pg.code,
        detail: pg.detail,
        constraint: pg.constraint,
        table: pg.table,
      });
    } else {
      console.error("paystack webhook charge.success error:", msg);
    }
    res.sendStatus(500);
  }
}
