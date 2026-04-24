CREATE TABLE tag_aliases (
  id SERIAL PRIMARY KEY,
  tag_id INTEGER NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
  alias VARCHAR(255) NOT NULL
);

CREATE INDEX idx_tag_aliases_tag_id ON tag_aliases (tag_id);
CREATE UNIQUE INDEX idx_tag_aliases_tag_id_alias ON tag_aliases (tag_id, alias);
