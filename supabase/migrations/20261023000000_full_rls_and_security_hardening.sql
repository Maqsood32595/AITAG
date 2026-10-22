-- ============================================================
-- AITAG Migration: Full-Suite Row-Level Security (RLS) & Hardening
-- Slice: aitag-security-guard / Core Database
-- Applies comprehensive RLS, column protection, public read policies,
-- and grants across all public AITAG tables.
-- ============================================================

-- 1. Ensure Table aitag_case_messages exists
CREATE TABLE IF NOT EXISTS public.aitag_case_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'freelancer', 'client')),
  message TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_messages_order_id ON public.aitag_case_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_case_messages_sender_email ON public.aitag_case_messages(LOWER(sender_email));
CREATE INDEX IF NOT EXISTS idx_case_messages_created_at ON public.aitag_case_messages(created_at ASC);

-- 2. Ensure attachments column in aitag_tasks
ALTER TABLE IF EXISTS public.aitag_tasks
  ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 3. High-speed lookup & account lifecycle indexes
CREATE INDEX IF NOT EXISTS idx_aitag_users_email_lower ON public.aitag_users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_aitag_bids_user_email ON public.aitag_bids(user_email);
CREATE INDEX IF NOT EXISTS idx_aitag_invitations_client_email ON public.aitag_invitations(client_email);
CREATE INDEX IF NOT EXISTS idx_aitag_invitations_freelancer_email ON public.aitag_invitations(freelancer_email);
CREATE INDEX IF NOT EXISTS idx_aitag_tasks_user_email ON public.aitag_tasks(user_email);
CREATE INDEX IF NOT EXISTS idx_aitag_profiles_user_email ON public.aitag_profiles(user_email);

-- 4. Enable Row Level Security (RLS) on ALL public AITAG tables
ALTER TABLE public.aitag_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aitag_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aitag_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aitag_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aitag_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aitag_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aitag_package_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aitag_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aitag_case_messages ENABLE ROW LEVEL SECURITY;

-- 5. Revoke sensitive columns from anon/authenticated
REVOKE SELECT (password_hash) ON public.aitag_users FROM anon, authenticated;

-- 6. Setup Public Read Policies for marketplace catalogs
DROP POLICY IF EXISTS "Public read packages" ON public.aitag_packages;
CREATE POLICY "Public read packages" ON public.aitag_packages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read package tiers" ON public.aitag_package_tiers;
CREATE POLICY "Public read package tiers" ON public.aitag_package_tiers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read profiles" ON public.aitag_profiles;
CREATE POLICY "Public read profiles" ON public.aitag_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read tasks" ON public.aitag_tasks;
CREATE POLICY "Public read tasks" ON public.aitag_tasks FOR SELECT USING (true);

-- 7. Ensure service_role has unconditional permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
