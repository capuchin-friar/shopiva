-- Chat rooms tied to an order (order_id aligns with BIGINT used in disputes / shop reviews).

CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id BIGINT NOT NULL,
    initiator INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_rooms_order_id ON chat_rooms(order_id);
CREATE INDEX idx_chat_rooms_initiator ON chat_rooms(initiator);
CREATE INDEX idx_chat_rooms_updated_at ON chat_rooms(updated_at DESC);
