-- ============================================================
-- AITAG Fractal Kernel — Supabase Migration Script
-- Run this in your Supabase SQL Editor (new tables only)
-- Existing tables are NOT touched.
-- ============================================================

-- 1. AITAG Users Table
CREATE TABLE IF NOT EXISTS aitag_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  photo_url TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'freelancer' CHECK (role IN ('client', 'freelancer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AITAG Tasks Table
CREATE TABLE IF NOT EXISTS aitag_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  deadline DATE NOT NULL,
  budget NUMERIC NOT NULL,
  image TEXT DEFAULT 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'completed', 'cancelled')),
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  total_bids INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AITAG Bids Table
CREATE TABLE IF NOT EXISTS aitag_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES aitag_tasks(id) ON DELETE CASCADE,
  task_title TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  task_owner_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, user_email)
);

-- 4. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_aitag_tasks_user_email ON aitag_tasks(user_email);
CREATE INDEX IF NOT EXISTS idx_aitag_tasks_category ON aitag_tasks(category);
CREATE INDEX IF NOT EXISTS idx_aitag_bids_user_email ON aitag_bids(user_email);
CREATE INDEX IF NOT EXISTS idx_aitag_bids_task_id ON aitag_bids(task_id);

-- 5. Seed 8 featured AI tasks
INSERT INTO aitag_tasks (title, category, description, deadline, budget, image, status, user_email, user_name)
VALUES
  ('Build AI-Powered Resume Screener', 'AI Engineering', 'Develop an LLM-based resume screening tool that ranks candidates by role fit using GPT-4o and a custom scoring rubric.', '2026-09-15', 3500, 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800', 'open', 'client@aitag.com', 'AITAG Client'),
  ('Fine-tune LLaMA 3 for Legal Documents', 'Machine Learning', 'Fine-tune a LLaMA 3 8B model on a proprietary legal document dataset. Must support Indian contract law terminology.', '2026-09-20', 6200, 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800', 'open', 'client@aitag.com', 'AITAG Client'),
  ('Design AI Chatbot UI/UX in Figma', 'Design', 'Create a complete Figma design system for a conversational AI chatbot — includes dark/light modes, message states, and streaming text components.', '2026-09-10', 1800, 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800', 'open', 'client@aitag.com', 'AITAG Client'),
  ('Implement RAG Pipeline with Pinecone', 'AI Engineering', 'Build a Retrieval-Augmented Generation pipeline using LangChain + Pinecone for a SaaS knowledge base product. Include chunking, embedding, and reranking.', '2026-09-30', 4800, 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800', 'open', 'client@aitag.com', 'AITAG Client'),
  ('ML Ops Pipeline on AWS SageMaker', 'ML Ops', 'Set up a complete MLOps pipeline: model training, versioning, canary deployment, and monitoring dashboards on AWS SageMaker.', '2026-10-05', 7500, 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800', 'open', 'client@aitag.com', 'AITAG Client'),
  ('Write Technical AI Blog Series (10 posts)', 'Writing', 'Write 10 in-depth technical blog posts on applied AI topics: prompt engineering, RAG, fine-tuning, AI agents, and cost optimization. SEO-optimized.', '2026-09-25', 2200, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800', 'open', 'client@aitag.com', 'AITAG Client'),
  ('Build Autonomous AI Agent with Tools', 'AI Engineering', 'Create a multi-tool autonomous AI agent using OpenAI function calling — capable of web search, code execution, and calendar management.', '2026-10-15', 5500, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800', 'open', 'client@aitag.com', 'AITAG Client'),
  ('Computer Vision QA System for Manufacturing', 'Machine Learning', 'Build a real-time defect detection system using YOLOv10 for a manufacturing line. Must achieve >95% precision on the provided dataset.', '2026-10-20', 9000, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800', 'open', 'client@aitag.com', 'AITAG Client')
ON CONFLICT DO NOTHING;
