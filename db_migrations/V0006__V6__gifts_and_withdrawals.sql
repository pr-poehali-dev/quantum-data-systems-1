
-- Каталог подарков
CREATE TABLE IF NOT EXISTS t_p40384861_quantum_data_systems.gift_catalog (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    description TEXT,
    price_voices INTEGER NOT NULL CHECK (price_voices > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Отправленные подарки
CREATE TABLE IF NOT EXISTS t_p40384861_quantum_data_systems.gifts (
    id SERIAL PRIMARY KEY,
    gift_id INTEGER NOT NULL REFERENCES t_p40384861_quantum_data_systems.gift_catalog(id),
    from_user_id INTEGER NOT NULL REFERENCES t_p40384861_quantum_data_systems.users(id),
    to_user_id INTEGER NOT NULL REFERENCES t_p40384861_quantum_data_systems.users(id),
    message TEXT,
    voices_spent INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gifts_to_user ON t_p40384861_quantum_data_systems.gifts(to_user_id);
CREATE INDEX IF NOT EXISTS idx_gifts_from_user ON t_p40384861_quantum_data_systems.gifts(from_user_id);

-- Заявки на вывод голосов в рубли (карта Мир)
CREATE TABLE IF NOT EXISTS t_p40384861_quantum_data_systems.withdrawal_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p40384861_quantum_data_systems.users(id),
    voices INTEGER NOT NULL CHECK (voices >= 100),
    amount_rub NUMERIC(10,2) NOT NULL,
    card_number VARCHAR(20) NOT NULL,
    card_holder VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    admin_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON t_p40384861_quantum_data_systems.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON t_p40384861_quantum_data_systems.withdrawal_requests(status);

-- Наполняем каталог подарков
INSERT INTO t_p40384861_quantum_data_systems.gift_catalog (name, emoji, description, price_voices, sort_order) VALUES
('Цветок', '🌸', 'Нежный цветок', 10, 1),
('Сердце', '❤️', 'С любовью', 25, 2),
('Торт', '🎂', 'С днём рождения!', 50, 3),
('Корона', '👑', 'Ты лучший!', 100, 4),
('Ракета', '🚀', 'Лети к звёздам!', 150, 5),
('Бриллиант', '💎', 'Бесценно', 250, 6),
('Кубок', '🏆', 'Чемпион!', 300, 7),
('Единорог', '🦄', 'Волшебный подарок', 500, 8);
