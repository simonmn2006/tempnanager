
-- Gourmetta HACCP Database Schema

CREATE TABLE IF NOT EXISTS facilities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    refrigerator_count INTEGER DEFAULT 0,
    type_id TEXT,
    cooking_method_id TEXT,
    supervisor_id TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL, -- 'User', 'Manager', 'Admin', 'SuperAdmin'
    status TEXT DEFAULT 'Active',
    facility_id TEXT REFERENCES facilities(id),
    email TEXT,
    email_alerts BOOLEAN DEFAULT FALSE,
    telegram_alerts BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS refrigerators (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    facility_id TEXT REFERENCES facilities(id) ON DELETE CASCADE,
    type_name TEXT,
    status TEXT DEFAULT 'Optimal'
);

CREATE TABLE IF NOT EXISTS readings (
    id TEXT PRIMARY KEY,
    target_id TEXT NOT NULL,
    target_type TEXT NOT NULL, -- 'refrigerator' or 'menu'
    checkpoint_name TEXT NOT NULL,
    value DECIMAL NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    user_id TEXT REFERENCES users(id),
    facility_id TEXT REFERENCES facilities(id),
    reason TEXT
);

CREATE TABLE IF NOT EXISTS form_responses (
    id TEXT PRIMARY KEY,
    form_id TEXT NOT NULL,
    facility_id TEXT REFERENCES facilities(id),
    user_id TEXT REFERENCES users(id),
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    answers JSONB NOT NULL,
    signature TEXT
);

-- Seed Initial SuperAdmin (Password: super123)
-- In production, hash this with bcrypt
INSERT INTO users (id, name, username, password, role, status)
VALUES ('U-SUPER', 'System Admin', 'admin', '$2a$10$8KzXj0X9XzX9XzX9XzX9Xue...', 'SuperAdmin', 'Active')
ON CONFLICT (username) DO NOTHING;
