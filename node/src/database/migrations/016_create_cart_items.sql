-- Buyer cart lines: one row per customer + inventory (SKU) pair.
-- Price and product metadata are read from inventory + products at query time.

CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    inventory_id INT NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1
        CHECK (quantity >= 1 AND quantity <= 99),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, inventory_id)
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_inventory_id ON cart_items(inventory_id);
