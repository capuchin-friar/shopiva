/**
 * POST /webhooks/paystack — Paystack webhook listener (raw JSON body required for signature verification).
 */

import type { Request, Response } from "express";
import {
  verifyPaystackWebhookSignature,
  persistPaystackWebhook,
  type PaystackWebhookEnvelope,
} from "../../services/paystackWebhook.js";

export async function PaystackWebhookController(req: Request, res: Response) {
  const raw = req.body;
  if (!Buffer.isBuffer(raw)) {
    res.status(500).json({ error: "Webhook misconfigured: expected raw body" });
    return;
  }

  const signature = req.get("x-paystack-signature");
  if (!verifyPaystackWebhookSignature(raw, signature)) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  let payload: PaystackWebhookEnvelope;
  try {
    payload = JSON.parse(raw.toString("utf8")) as PaystackWebhookEnvelope;
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  try {
    const result = await persistPaystackWebhook(raw, payload);
    res.status(200).json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const root = err instanceof Error && err.cause !== undefined ? err.cause : err;
    const pg = root as { code?: string; detail?: string; constraint?: string; table?: string };
    if (pg.code) {
      console.error("paystack webhook persist error:", msg, {
        code: pg.code,
        detail: pg.detail,
        constraint: pg.constraint,
        table: pg.table,
      });
    } else {
      console.error("paystack webhook persist error:", msg);
    }
    res.status(500).json({ error: msg });
  }
}
