-- Per-user read receipts (maps to MessageRead; one row per user per message).

CREATE TABLE chat_message_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (message_id, user_id)
);

CREATE INDEX idx_chat_message_reads_message_id ON chat_message_reads(message_id);
CREATE INDEX idx_chat_message_reads_user_id ON chat_message_reads(user_id);
