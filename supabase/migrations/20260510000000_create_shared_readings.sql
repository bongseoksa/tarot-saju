-- shared_readings: stores shared tarot reading results (insert on share click only)
CREATE TABLE shared_readings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id    text NOT NULL,
  theme_title text NOT NULL,
  cards       jsonb NOT NULL,
  interpretation text NOT NULL,
  summary     text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  expires_at  timestamptz DEFAULT now() + interval '30 days'
);

CREATE INDEX idx_shared_readings_expires ON shared_readings (expires_at);

-- RLS
ALTER TABLE shared_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read" ON shared_readings FOR SELECT USING (true);
CREATE POLICY "anyone can insert" ON shared_readings FOR INSERT WITH CHECK (true);
