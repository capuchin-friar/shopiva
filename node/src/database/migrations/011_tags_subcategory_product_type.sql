-- Optional scope for tags: filter by sub-category and/or product type
ALTER TABLE tags
  ADD COLUMN IF NOT EXISTS sub_category VARCHAR(255),
  ADD COLUMN IF NOT EXISTS product_type VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_tags_sub_category ON tags (sub_category);
CREATE INDEX IF NOT EXISTS idx_tags_product_type ON tags (product_type);
