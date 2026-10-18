-- ============================================================
-- AITAG Migration: Account Lifecycle & Cascading Deletions
-- Slice: aitag-account-lifecycle
-- Enables database indexes and cascade safety for user deletion
-- ============================================================

-- 1. Index on aitag_users email for high-speed deletion lookups
CREATE INDEX IF NOT EXISTS idx_aitag_users_email_lower ON aitag_users(LOWER(email));

-- 2. Index on child tables for email-based cascade queries
CREATE INDEX IF NOT EXISTS idx_aitag_bids_user_email ON aitag_bids(user_email);
CREATE INDEX IF NOT EXISTS idx_aitag_invitations_client_email ON aitag_invitations(client_email);
CREATE INDEX IF NOT EXISTS idx_aitag_invitations_freelancer_email ON aitag_invitations(freelancer_email);
CREATE INDEX IF NOT EXISTS idx_aitag_tasks_user_email ON aitag_tasks(user_email);
CREATE INDEX IF NOT EXISTS idx_aitag_profiles_user_email ON aitag_profiles(user_email);
