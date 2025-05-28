-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alter messages table to add session_id
ALTER TABLE messages ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES chat_sessions(id);
