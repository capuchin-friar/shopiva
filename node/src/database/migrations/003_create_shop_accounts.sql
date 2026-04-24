CREATE TABLE shop_accounts (
  id BIGSERIAL PRIMARY KEY,

  shop_id BIGINT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,

  -- Balances (denormalized for speed)
  available_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  pending_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  frozen_balance DECIMAL(15,2) NOT NULL DEFAULT 0,

  -- Currency
  currency CHAR(3) NOT NULL DEFAULT 'NGN',

  -- Status
  status VARCHAR(20) NOT NULL
    CHECK (status IN ('active', 'suspended', 'closed')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (shop_id)
);
