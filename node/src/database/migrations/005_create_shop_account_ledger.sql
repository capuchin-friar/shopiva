CREATE TABLE shop_account_ledger (
  id BIGSERIAL PRIMARY KEY,

  shop_account_id BIGINT
    REFERENCES shop_accounts(id) ON DELETE CASCADE,

  -- Context
  source_type VARCHAR(30) NOT NULL
    CHECK (source_type IN (
      'order_payment',
      'escrow_release',
      'refund',
      'dispute_hold',
      'payout',
      'adjustment'
    )),

  source_id BIGINT, -- order_id, dispute_id, payout_id, etc.

  -- Money
  amount DECIMAL(15,2) NOT NULL,
  direction VARCHAR(10) NOT NULL
    CHECK (direction IN ('credit', 'debit')),

  balance_after DECIMAL(15,2),

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
