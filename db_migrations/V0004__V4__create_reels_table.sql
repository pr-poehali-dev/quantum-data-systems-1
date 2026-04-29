
CREATE TABLE IF NOT EXISTS t_p40384861_quantum_data_systems.reels (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p40384861_quantum_data_systems.users(id),
    caption TEXT,
    video_url TEXT NOT NULL,
    cover_url TEXT,
    duration_sec INTEGER,
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    comments INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reels_user_id ON t_p40384861_quantum_data_systems.reels(user_id);
CREATE INDEX IF NOT EXISTS idx_reels_created_at ON t_p40384861_quantum_data_systems.reels(created_at DESC);
