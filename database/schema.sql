CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(100) NOT NULL,

  email VARCHAR(255) UNIQUE NOT NULL,

  password_hash VARCHAR(255) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS glucose_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  glucose_value INTEGER NOT NULL CHECK (glucose_value BETWEEN 40 AND 600),

  reading_date DATE NOT NULL,

  reading_slot VARCHAR(30) NOT NULL CHECK (
    reading_slot IN (
      'Morning (fasting)',
      'After breakfast',
      'After lunch',
      'After dinner'
    )
  ),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_reading_per_slot UNIQUE (user_id, reading_date, reading_slot)
);
