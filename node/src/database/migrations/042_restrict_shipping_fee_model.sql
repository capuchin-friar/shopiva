-- Restrict shipping_fee_models.model to 'multi_item_discount' only.
-- The "Per Item" and "Per Order (Flat)" options have been removed from the app.

-- Migrate any existing rows using the removed models to 'multi_item_discount'
-- so the new CHECK constraint does not fail on existing data.
UPDATE shipping_fee_models
SET model = 'multi_item_discount', updated_at = CURRENT_TIMESTAMP
WHERE model IN ('per_item', 'per_order_flat');

ALTER TABLE shipping_fee_models
  DROP CONSTRAINT shipping_fee_models_model_check;

ALTER TABLE shipping_fee_models
  ADD CONSTRAINT shipping_fee_models_model_check CHECK (model IN ('multi_item_discount'));
