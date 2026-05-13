CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,

    order_id VARCHAR(50) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,

    item_id VARCHAR NOT NULL,

    units INTEGER NOT NULL DEFAULT 1,

    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,

    total_price NUMERIC(12,2) NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

