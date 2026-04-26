import { PAYSTACK_PUBLIC_KEY } from '@env';

/**
 * Paystack public key from `.env` (see `.env.example`). Never put secret keys in the app.
 * @returns {string}
 */
export function getPaystackPublicKey() {
  return String(PAYSTACK_PUBLIC_KEY ?? '').trim();
}

/** @returns {boolean} */
export function isPaystackConfigured() {
  const k = getPaystackPublicKey();
  return k.startsWith('pk_test_') || k.startsWith('pk_live_');
}
