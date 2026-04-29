
CREATE TABLE IF NOT EXISTS t_p40384861_quantum_data_systems.videos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p40384861_quantum_data_systems.users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_sec INTEGER,
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_user_id ON t_p40384861_quantum_data_systems.videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON t_p40384861_quantum_data_systems.videos(created_at DESC);
