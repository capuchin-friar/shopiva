CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,

    product_id INT NOT NULL
        REFERENCES products(id) ON DELETE CASCADE,

    sku VARCHAR(100) UNIQUE,

    price NUMERIC(15,2) NOT NULL,
    compare_at_price NUMERIC(15,2),
    cost_price NUMERIC(15,2),

    currency VARCHAR(3) DEFAULT 'USD',

    quantity INT DEFAULT 0,

    reserved_quantity INT DEFAULT 0,

    low_stock_threshold INT DEFAULT 5,

    track_inventory BOOLEAN DEFAULT true,
    allow_backorder BOOLEAN DEFAULT false,

    taxable BOOLEAN DEFAULT true,
    tax_rate NUMERIC(5,2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_product ON inventory(product_id);