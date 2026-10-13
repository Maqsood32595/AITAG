-- ==============================================================================
-- AITAG Supabase Row Level Security (RLS) & Column-Level Privilege Hardening
-- Dimension: Complete Database Layer Defense against Autonomous AI & Data Exfiltration
-- Target Project: byekbjxiowkrtwpsxevz (byekbjxiowkrtwpsxevz.supabase.co)
-- Execution: Run this script in the Supabase Dashboard SQL Editor
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Enable RLS on all AITAG tables
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS aitag_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS aitag_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS aitag_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS aitag_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS aitag_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS aitag_service_orders ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. Drop existing policies to allow clean, idempotent re-runs
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public user profiles are viewable by authenticated users" ON aitag_users;
DROP POLICY IF EXISTS "Users can read their own account" ON aitag_users;
DROP POLICY IF EXISTS "Users can update their own account" ON aitag_users;
DROP POLICY IF EXISTS "Public directory browsing for talent" ON aitag_users;

DROP POLICY IF EXISTS "Tasks are viewable by all users" ON aitag_tasks;
DROP POLICY IF EXISTS "Authenticated users can create tasks" ON aitag_tasks;
DROP POLICY IF EXISTS "Task owners can update their own tasks" ON aitag_tasks;
DROP POLICY IF EXISTS "Task owners can delete their own tasks" ON aitag_tasks;

DROP POLICY IF EXISTS "Bids visible only to bidder and task owner" ON aitag_bids;
DROP POLICY IF EXISTS "Freelancers can place bids" ON aitag_bids;
DROP POLICY IF EXISTS "Task owners can update bid status" ON aitag_bids;

DROP POLICY IF EXISTS "Invitations visible only to counterparties" ON aitag_invitations;
DROP POLICY IF EXISTS "Clients can send invitations" ON aitag_invitations;
DROP POLICY IF EXISTS "Freelancers can update invitation status" ON aitag_invitations;

DROP POLICY IF EXISTS "Talent profiles are viewable by all" ON aitag_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON aitag_profiles;

DROP POLICY IF EXISTS "Orders viewable only by customer, assigned expert, or admin" ON aitag_service_orders;
DROP POLICY IF EXISTS "Customers can create service orders" ON aitag_service_orders;
DROP POLICY IF EXISTS "Counterparties can update order milestones" ON aitag_service_orders;

-- ------------------------------------------------------------------------------
-- 3. Column-Level Privilege Hardening: Block password_hash and direct INSERTs from anon
-- ------------------------------------------------------------------------------
-- Block anonymous role from directly inserting or modifying users
REVOKE INSERT, UPDATE, DELETE ON aitag_users FROM anon;

-- Revoke all table-level access, then grant SELECT ONLY on safe non-sensitive columns
REVOKE ALL ON aitag_users FROM anon;
GRANT SELECT (id, name, role, photo_url, created_at) ON aitag_users TO anon;
GRANT SELECT (id, name, email, role, photo_url, created_at) ON aitag_users TO authenticated;
GRANT UPDATE (name, photo_url) ON aitag_users TO authenticated;

-- Service role retains full administrative access for backend server operations
GRANT ALL ON aitag_users TO service_role;

-- ------------------------------------------------------------------------------
-- 4. aitag_users Row Level Security Policies
-- ------------------------------------------------------------------------------
-- Safe public talent directory browsing (only safe columns viewable as granted above)
CREATE POLICY "Public directory browsing for talent"
  ON aitag_users FOR SELECT
  TO anon, authenticated
  USING (true);

-- Users can only update their own account details
CREATE POLICY "Users can update their own account"
  ON aitag_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR (auth.jwt() ->> 'email') = email)
  WITH CHECK (auth.uid() = id OR (auth.jwt() ->> 'email') = email);

-- ------------------------------------------------------------------------------
-- 5. aitag_tasks Policies
-- ------------------------------------------------------------------------------
-- Public marketplace task discovery
CREATE POLICY "Tasks are viewable by all users"
  ON aitag_tasks FOR SELECT
  TO authenticated, anon
  USING (true);

-- Authenticated clients can create tasks
CREATE POLICY "Authenticated users can create tasks"
  ON aitag_tasks FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = user_email);

-- Only task owners can update their own tasks
CREATE POLICY "Task owners can update their own tasks"
  ON aitag_tasks FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email') = user_email)
  WITH CHECK ((auth.jwt() ->> 'email') = user_email);

-- Only task owners or admins can delete tasks
CREATE POLICY "Task owners can delete their own tasks"
  ON aitag_tasks FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = user_email OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ------------------------------------------------------------------------------
-- 6. aitag_bids Policies (Anti-Bid Sniping & Counterparty Isolation)
-- ------------------------------------------------------------------------------
-- Bids are strictly confidential: visible ONLY to the bidder or the task creator
CREATE POLICY "Bids visible only to bidder and task owner"
  ON aitag_bids FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = user_email OR
    (auth.jwt() ->> 'email') = task_owner_email OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Authenticated freelancers can insert their own bids
CREATE POLICY "Freelancers can place bids"
  ON aitag_bids FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = user_email);

-- Task owners can update bid status (Accept / Reject)
CREATE POLICY "Task owners can update bid status"
  ON aitag_bids FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email') = task_owner_email);

-- ------------------------------------------------------------------------------
-- 7. aitag_invitations Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Invitations visible only to counterparties"
  ON aitag_invitations FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = client_email OR
    (auth.jwt() ->> 'email') = freelancer_email OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Clients can send invitations"
  ON aitag_invitations FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = client_email);

CREATE POLICY "Freelancers can update invitation status"
  ON aitag_invitations FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email') = freelancer_email);

-- ------------------------------------------------------------------------------
-- 8. aitag_profiles Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Talent profiles are viewable by all"
  ON aitag_profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON aitag_profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    (auth.jwt() ->> 'email') = user_email
  )
  WITH CHECK (
    auth.uid() = user_id OR
    (auth.jwt() ->> 'email') = user_email
  );

-- ------------------------------------------------------------------------------
-- 9. aitag_service_orders Policies (BOLA / IDOR Defense)
-- ------------------------------------------------------------------------------
CREATE POLICY "Orders viewable only by customer, assigned expert, or admin"
  ON aitag_service_orders FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = customer_email OR
    (auth.jwt() ->> 'email') = assigned_expert_email OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Customers can create service orders"
  ON aitag_service_orders FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = customer_email);

CREATE POLICY "Counterparties can update order milestones"
  ON aitag_service_orders FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = customer_email OR
    (auth.jwt() ->> 'email') = assigned_expert_email OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ==============================================================================
-- Verification Query: Check that RLS is active on all tables
-- ==============================================================================
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'aitag_%';
