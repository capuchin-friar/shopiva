-- Named UNIQUE constraint so INSERT ... ON CONFLICT ON CONSTRAINT ... matches reliably (fixes 42P10).
-- Resolves duplicate index from 026: drop anonymous unique index, add constraint-backed unique.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;

DROP INDEX IF EXISTS orders_payment_reference_uidx;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_reference_unique;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_reference_unique UNIQUE (payment_reference);
