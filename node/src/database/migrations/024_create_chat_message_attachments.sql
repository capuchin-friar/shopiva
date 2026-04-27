-- Attachments for a message (maps to MessageAttachment).

CREATE TABLE chat_message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    file_type VARCHAR(255) NOT NULL,
    size BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_message_attachments_message_id ON chat_message_attachments(message_id);
