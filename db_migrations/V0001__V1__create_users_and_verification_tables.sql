
CREATE TABLE IF NOT EXISTS t_p40384861_quantum_data_systems.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p40384861_quantum_data_systems.verification_purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p40384861_quantum_data_systems.users(id),
    amount_rub NUMERIC(10, 2) NOT NULL DEFAULT 299.00,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_id VARCHAR(255),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON t_p40384861_quantum_data_systems.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON t_p40384861_quantum_data_systems.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON t_p40384861_quantum_data_systems.users(role);
CREATE INDEX IF NOT EXISTS idx_verification_purchases_user_id ON t_p40384861_quantum_data_systems.verification_purchases(user_id);
