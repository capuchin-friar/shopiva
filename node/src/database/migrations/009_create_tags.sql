CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  sub_category VARCHAR(255),
  product_type VARCHAR(255)
);

CREATE INDEX idx_tags_type ON tags (type);
CREATE INDEX idx_tags_sub_category ON tags (sub_category);
CREATE INDEX idx_tags_product_type ON tags (product_type);
CREATE UNIQUE INDEX idx_tags_name_type ON tags (name, type);
