
CREATE TABLE IF NOT EXISTS t_p40384861_quantum_data_systems.music (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p40384861_quantum_data_systems.users(id),
    title VARCHAR(200) NOT NULL,
    artist VARCHAR(200) NOT NULL,
    audio_url TEXT NOT NULL,
    cover_url TEXT,
    duration_sec INTEGER,
    plays INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_music_user_id ON t_p40384861_quantum_data_systems.music(user_id);
CREATE INDEX IF NOT EXISTS idx_music_created_at ON t_p40384861_quantum_data_systems.music(created_at DESC);
