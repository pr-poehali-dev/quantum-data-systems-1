
-- Добавляем баланс голосов пользователю
ALTER TABLE t_p40384861_quantum_data_systems.users
  ADD COLUMN IF NOT EXISTS voice_balance INTEGER NOT NULL DEFAULT 0;

-- Таблица пополнений голосов (покупки за рубли)
CREATE TABLE IF NOT EXISTS t_p40384861_quantum_data_systems.voice_purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p40384861_quantum_data_systems.users(id),
    amount_voices INTEGER NOT NULL,
    amount_rub NUMERIC(10,2) NOT NULL,
    payment_id TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица донатов (голоса от одного пользователя другому)
CREATE TABLE IF NOT EXISTS t_p40384861_quantum_data_systems.donations (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL REFERENCES t_p40384861_quantum_data_systems.users(id),
    to_user_id INTEGER NOT NULL REFERENCES t_p40384861_quantum_data_systems.users(id),
    voices INTEGER NOT NULL CHECK (voices > 0),
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donations_from ON t_p40384861_quantum_data_systems.donations(from_user_id);
CREATE INDEX IF NOT EXISTS idx_donations_to ON t_p40384861_quantum_data_systems.donations(to_user_id);
