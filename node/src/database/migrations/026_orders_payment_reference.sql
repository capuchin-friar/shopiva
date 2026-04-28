-- Idempotent Paystack webhooks: one order per payment reference.
-- Safe if `orders` already has the column (IF NOT EXISTS).

DO $$
BEGIN
  IF to_regclass('public.orders') IS NOT NULL THEN
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_reference_uidx
      ON orders (payment_reference);
  END IF;
END $$;
