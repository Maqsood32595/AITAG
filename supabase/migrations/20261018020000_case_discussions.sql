-- ============================================================
-- AITAG Migration: Case Discussions & Communications
-- Slice: aitag-case-discussions
-- Persistent audit history for order case communications with attachments
-- ============================================================

CREATE TABLE IF NOT EXISTS aitag_case_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'freelancer', 'client')),
  message TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_messages_order_id ON aitag_case_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_case_messages_sender_email ON aitag_case_messages(LOWER(sender_email));
CREATE INDEX IF NOT EXISTS idx_case_messages_created_at ON aitag_case_messages(created_at ASC);
