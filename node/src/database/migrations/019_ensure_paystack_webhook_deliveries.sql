-- Ensure paystack_webhook_deliveries exists (repairs DBs where 018 was recorded but the table is missing,
-- or restores where only migrations metadata was replayed).

CREATE TABLE IF NOT EXISTS paystack_webhook_deliveries (
    id BIGSERIAL PRIMARY KEY,
    body_hash TEXT NOT NULL,
    reference TEXT NOT NULL,
    paystack_event TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT paystack_webhook_deliveries_body_hash_key UNIQUE (body_hash)
);

CREATE INDEX IF NOT EXISTS idx_paystack_webhook_deliveries_reference ON paystack_webhook_deliveries (reference);
CREATE INDEX IF NOT EXISTS idx_paystack_webhook_deliveries_created_at ON paystack_webhook_deliveries (created_at DESC);
