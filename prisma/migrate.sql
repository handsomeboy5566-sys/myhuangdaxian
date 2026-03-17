-- 创建签文表
CREATE TABLE IF NOT EXISTS fortune_sticks (
  id INTEGER PRIMARY KEY,
  level TEXT NOT NULL,
  title TEXT NOT NULL,
  poem TEXT NOT NULL,
  meaning TEXT NOT NULL,
  advice TEXT NOT NULL,
  story TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_level ON fortune_sticks(level);
