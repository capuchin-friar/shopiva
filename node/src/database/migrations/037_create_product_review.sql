CREATE TABLE product_reviews (
    id SERIAL PRIMARY KEY,

    product_id INTEGER NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    order_id INTEGER NOT NULL
        REFERENCES orders(id)
        ON DELETE CASCADE,

    order_item_id INTEGER NOT NULL
        REFERENCES order_items(id)
        ON DELETE CASCADE,

    rating SMALLINT NOT NULL
        CHECK (rating BETWEEN 1 AND 5),

    comment TEXT,

    image_urls JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_product_review_per_order_item
        UNIQUE (order_item_id)
);