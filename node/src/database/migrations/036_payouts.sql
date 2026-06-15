CREATE TABLE shop_payouts (
    id SERIAL PRIMARY KEY,

    order_id VARCHAR(50) NOT NULL ,
    shop_id VARCHAR(50) NOT NULL ,

    gross_amount NUMERIC(12,2) NOT NULL,
    commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    net_amount NUMERIC(12,2) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    transfer_reference VARCHAR(255),

    paid_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT shop_payouts_status_check
    CHECK (
        status IN (
            'pending',
            'processing',
            'paid',
            'failed'
        )
    )
);
-- CREATE INDEX idx_shop_payouts_status
-- ON shop_payouts(status);

-- CREATE INDEX idx_shop_payouts_shop_id
-- ON shop_payouts(shop_id);

-- CREATE UNIQUE INDEX idx_shop_payouts_order_id
-- ON shop_payouts(order_id);