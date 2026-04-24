CREATE TABLE disputes (
  id BIGSERIAL PRIMARY KEY,
  dispute_ref VARCHAR(40) UNIQUE NOT NULL,
  customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id BIGINT,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  reason TEXT NOT NULL,
  description TEXT,
  source VARCHAR(30) NOT NULL DEFAULT 'customer',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_disputes_customer_id ON disputes(customer_id);
CREATE INDEX idx_disputes_order_id ON disputes(order_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_created_at ON disputes(created_at DESC);
