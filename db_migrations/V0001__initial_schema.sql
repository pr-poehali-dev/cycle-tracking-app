CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    birth_year INTEGER NOT NULL,
    usage_mode VARCHAR(20) NOT NULL CHECK (usage_mode IN ('self', 'partner')),
    partner_code VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    goal_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, goal_type)
);

CREATE TABLE IF NOT EXISTS cycles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE,
    cycle_length INTEGER,
    is_regular BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    note_date DATE NOT NULL,
    mood VARCHAR(50),
    energy_level VARCHAR(50),
    sleep_quality VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, note_date)
);

CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    reading_time VARCHAR(20),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO articles (title, category, reading_time, content) VALUES
('Как правильно отслеживать цикл', 'Здоровье', '5 мин', 'Правильное отслеживание менструального цикла помогает лучше понимать свое тело и планировать важные события.'),
('Признаки овуляции', 'Планирование', '7 мин', 'Овуляция - это важный этап цикла. Узнайте основные признаки и симптомы.'),
('Питание и менструальный цикл', 'Питание', '4 мин', 'Правильное питание может значительно улучшить самочувствие во время цикла.')
ON CONFLICT DO NOTHING;