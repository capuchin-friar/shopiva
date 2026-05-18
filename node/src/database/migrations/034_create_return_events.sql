

CREATE TABLE return_events (
    id SERIAL PRIMARY KEY,

    return_id INTEGER NOT NULL REFERENCES returns(id) ON DELETE CASCADE,

    event_type VARCHAR(100) NOT NULL,
    stage VARCHAR(50) NOT NULL,

    actor_type VARCHAR(20) NOT NULL,

    actor_id VARCHAR,

    outcome VARCHAR(20) NOT NULL,

    notes TEXT,

    meta JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);