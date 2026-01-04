-- Migration: Create user_cvs table for storing manually created CVs
-- This is separate from the 'resumes' table which stores parsed CVs from PDF uploads

CREATE TABLE IF NOT EXISTS user_cvs (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'Untitled CV',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_cvs_updated_at ON user_cvs(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_cvs_title ON user_cvs(title);

-- Add comment
COMMENT ON TABLE user_cvs IS 'Stores user-created CVs with full JSON data';
COMMENT ON COLUMN user_cvs.data IS 'Full CV data as JSON including metadata, profile, experience, education, skills, etc.';
