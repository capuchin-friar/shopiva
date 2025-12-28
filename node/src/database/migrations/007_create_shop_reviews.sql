CREATE TABLE shop_reviews (
  id BIGSERIAL PRIMARY KEY,

  -- Relations
  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  reviewer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,

  -- Review content
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(120),
  comment TEXT,

  -- Moderation
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  hidden_reason TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One review per order per user
  UNIQUE (shop_id, reviewer_id, order_id)
);

