-- Persist Paystack webhook payloads (charges, transfers, etc.) for reconciliation and auditing.

CREATE TABLE paystack_transactions (
    id BIGSERIAL PRIMARY KEY,
    paystack_charge_id BIGINT,
    reference TEXT NOT NULL,
    event TEXT NOT NULL,
    amount BIGINT,
    currency VARCHAR(16),
    status VARCHAR(128),
    channel VARCHAR(64),
    customer_email TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    paid_at TIMESTAMPTZ,
    raw_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (reference)
);

CREATE INDEX idx_paystack_transactions_created_at ON paystack_transactions (created_at DESC);
CREATE INDEX idx_paystack_transactions_event ON paystack_transactions (event);
CREATE INDEX idx_paystack_transactions_paystack_charge_id ON paystack_transactions (paystack_charge_id)
    WHERE paystack_charge_id IS NOT NULL;
