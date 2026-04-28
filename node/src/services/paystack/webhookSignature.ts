import crypto from "crypto";
import { paystack } from "../paystack.js";

/**
 * Paystack signs the **raw** JSON body with HMAC-SHA512 using the secret key.
 * Compare using timing-safe equality to prevent timing attacks.
 */
export function verifyWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined
): boolean {
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
