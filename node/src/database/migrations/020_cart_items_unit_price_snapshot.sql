-- Snapshot the unit price chosen at add-to-cart (e.g. variant price). When NULL, list cart still uses inventory.price.
ALTER TABLE cart_items
ADD COLUMN IF NOT EXISTS unit_price_snapshot double precision NULL;

COMMENT ON COLUMN cart_items.unit_price_snapshot IS 'Unit price when the line was added (validated variant/option price). NULL falls back to inventory.price.';
