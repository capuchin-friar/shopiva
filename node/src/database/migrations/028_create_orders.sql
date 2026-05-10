CREATE TABLE orders (
    id SERIAL PRIMARY KEY,

    order_id VARCHAR(50) NOT NULL UNIQUE,

    customer_id VARCHAR NOT NULL,
    shop_id VARCHAR NOT NULL,

    amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,

    shipping_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax NUMERIC(12,2) NOT NULL DEFAULT 0,
    charges NUMERIC(12,2) NOT NULL DEFAULT 0,

    total_paid NUMERIC(12,2) NOT NULL DEFAULT 0,

    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',

    fulfillment_status VARCHAR(50) NOT NULL DEFAULT 'processing',
    escrow_status VARCHAR(50) NOT NULL DEFAULT 'locked',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'paid',

    shipping_address TEXT NOT NULL,

    payment_reference VARCHAR(255),

    shipping_method VARCHAR(100),

    estimated_delivery_date TIMESTAMP,

    tracking_number VARCHAR(255),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,

    order_id VARCHAR NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    item_id VARCHAR NOT NULL,

    units INTEGER NOT NULL DEFAULT 1,

    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,

    total_price NUMERIC(12,2) NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE order_events (
    id SERIAL PRIMARY KEY,

    order_id VARCHAR NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    event_type VARCHAR(100) NOT NULL,
    stage VARCHAR(50) NOT NULL,

    actor_type VARCHAR(20) NOT NULL,

    actor_id VARCHAR,

    outcome VARCHAR(20) NOT NULL,

    notes TEXT,

    meta JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);