-- ============================================================
-- AITAG Migration: Task Attachments & Asset Materials
-- Slice: aitag-tasks
-- Adds persistent attachments array to aitag_tasks
-- ============================================================

ALTER TABLE IF EXISTS aitag_tasks
ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;
