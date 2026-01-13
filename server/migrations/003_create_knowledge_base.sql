-- Migration: Add knowledge_base table for RAG of criteria
-- Description: Table to store job requirements, ATS best practices, and tech trends
-- Embeddings: gemini-embedding-001 (768 dimensions) via OpenRouter

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS knowledge_base (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('job_requirements', 'ats_best_practices', 'tech_trends')),
  role TEXT,
  seniority TEXT CHECK (seniority IN ('Junior', 'Mid', 'Senior') OR seniority IS NULL),
  category TEXT,
  content TEXT NOT NULL,
  embedding vector(768),
  source TEXT,
  confidence INTEGER DEFAULT 100 CHECK (confidence >= 0 AND confidence <= 100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for vector similarity search using HNSW
CREATE INDEX IF NOT EXISTS knowledge_embedding_idx 
  ON knowledge_base 
  USING hnsw (embedding vector_cosine_ops);

-- Index for filtering by role
CREATE INDEX IF NOT EXISTS knowledge_role_idx 
  ON knowledge_base (role);

-- Index for filtering by type
CREATE INDEX IF NOT EXISTS knowledge_type_idx 
  ON knowledge_base (type);

-- Index for filtering by seniority
CREATE INDEX IF NOT EXISTS knowledge_seniority_idx 
  ON knowledge_base (seniority);

-- Comments
COMMENT ON TABLE knowledge_base IS 'Knowledge base for RAG: job requirements, ATS rules, and tech trends';
COMMENT ON COLUMN knowledge_base.embedding IS 'Gemini embedding (768 dims) for semantic search';
COMMENT ON COLUMN knowledge_base.confidence IS 'Confidence score 0-100 for this knowledge entry';
