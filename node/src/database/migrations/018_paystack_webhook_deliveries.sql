-- Idempotent Paystack webhook handling: identical retry payloads share the same raw-body SHA-256.

CREATE TABLE paystack_webhook_deliveries (
    id BIGSERIAL PRIMARY KEY,
    body_hash TEXT NOT NULL,
    reference TEXT NOT NULL,
    paystack_event TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT paystack_webhook_deliveries_body_hash_key UNIQUE (body_hash)
);

CREATE INDEX idx_paystack_webhook_deliveries_reference ON paystack_webhook_deliveries (reference);
CREATE INDEX idx_paystack_webhook_deliveries_created_at ON paystack_webhook_deliveries (created_at DESC);
