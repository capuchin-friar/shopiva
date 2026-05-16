CREATE TABLE refunds (
    id BIGSERIAL PRIMARY KEY,

    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    reason TEXT NOT NULL,
    refund_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_refunds_order_id ON refunds(order_id);
CREATE INDEX idx_refunds_customer_id ON refunds(customer_id);
CREATE INDEX idx_refunds_vendor_id ON refunds(vendor_id);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_created_at ON refunds(created_at DESC);
