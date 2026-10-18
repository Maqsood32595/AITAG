-- ============================================================
-- AITAG Fractal Kernel — Supabase Migration Script
-- Project: byekbjxiowkrtwpsxevz (byekbjxiowkrtwpsxevz.supabase.co)
-- Run this in your Supabase SQL Editor
-- All statements are idempotent (IF NOT EXISTS / OR REPLACE)
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

-- 4. AITAG Invitations Table (was missing — was only in-memory before)
CREATE TABLE IF NOT EXISTS aitag_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES aitag_tasks(id) ON DELETE CASCADE,
  task_title TEXT NOT NULL DEFAULT 'AI Task',
  task_budget NUMERIC DEFAULT 0,
  client_email TEXT NOT NULL,
  freelancer_email TEXT NOT NULL,
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, freelancer_email)
);

-- 5. AITAG Profiles Table (was only local disk/GCS — now persisted in Supabase)
CREATE TABLE IF NOT EXISTS aitag_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES aitag_users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL UNIQUE,
  headline TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  hourly_rate NUMERIC DEFAULT 0,
  skills TEXT[] DEFAULT '{}',
  links JSONB DEFAULT '{}',
  delivered_workflows JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_aitag_tasks_user_email ON aitag_tasks(user_email);
CREATE INDEX IF NOT EXISTS idx_aitag_tasks_category ON aitag_tasks(category);
CREATE INDEX IF NOT EXISTS idx_aitag_tasks_status ON aitag_tasks(status);
CREATE INDEX IF NOT EXISTS idx_aitag_bids_user_email ON aitag_bids(user_email);
CREATE INDEX IF NOT EXISTS idx_aitag_bids_task_id ON aitag_bids(task_id);
CREATE INDEX IF NOT EXISTS idx_aitag_bids_task_owner ON aitag_bids(task_owner_email);
CREATE INDEX IF NOT EXISTS idx_aitag_invitations_freelancer ON aitag_invitations(freelancer_email);
CREATE INDEX IF NOT EXISTS idx_aitag_invitations_client ON aitag_invitations(client_email);
CREATE INDEX IF NOT EXISTS idx_aitag_profiles_email ON aitag_profiles(user_email);
CREATE INDEX IF NOT EXISTS idx_aitag_users_email_lower ON aitag_users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_aitag_invitations_client_email ON aitag_invitations(client_email);
CREATE INDEX IF NOT EXISTS idx_aitag_invitations_freelancer_email ON aitag_invitations(freelancer_email);

-- 7. Auto-increment total_bids trigger (fixes denormalized counter bug)
CREATE OR REPLACE FUNCTION increment_task_bid_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE aitag_tasks SET total_bids = total_bids + 1 WHERE id = NEW.task_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_bid_inserted ON aitag_bids;
CREATE TRIGGER on_bid_inserted
  AFTER INSERT ON aitag_bids
  FOR EACH ROW EXECUTE FUNCTION increment_task_bid_count();

-- 8. Seed 8 featured AI tasks
INSERT INTO aitag_tasks (title, category, description, deadline, budget, image, status, user_email, user_name)
VALUES
  ('Studio White-Background Cutouts for 15 Amazon Cosmetic Products', 'Product Visuals', 'We have raw smartphone photos of 15 skincare cosmetic jars. Need clean pure white backgrounds, realistic contact shadows, blemish cleanup, and Amazon-compliant 2000x2000px JPG exports.', '2026-11-15', 1499, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800', 'open', 'client@aitag.com', 'AITAG Client'),
  ('Amazon & Flipkart SEO Listing Copy for Ethnic Footwear Store', 'E-Commerce & Copy', 'Need high-converting marketplace titles, 5 benefit-driven bullet points, and high-search-volume backend keywords for 5 new sandal SKUs in English and Hindi.', '2026-11-10', 999, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800', 'open', 'client@aitag.com', 'AITAG Client'),
  ('30-Day Festival Creative & Offer Pack for Local Bakery', 'Social & Marketing', 'Need 25 branded Instagram & Facebook post designs, festive holiday greetings, discount banners, and WhatsApp Status offer templates for the upcoming festive season.', '2026-11-20', 3499, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', 'open', 'client@aitag.com', 'AITAG Client'),
  ('One-Page Mobile Website with Instant WhatsApp Button for Boutique', 'Web & Funnels', 'Need a fast, mobile-friendly single-page business website featuring our clothing collections, Google Maps shop location, customer testimonials, and direct WhatsApp click-to-chat button.', '2026-11-25', 3999, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', 'open', 'client@aitag.com', 'AITAG Client'),
  ('AI Product Photo Makeover for 20 Meesho Saree Listings', 'Product Visuals', 'Transform flat-lay smartphone saree photos into studio-lit catalogue images with clean elegant backgrounds. Must meet Meesho listing standards.', '2026-11-12', 1999, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', 'open', 'client@aitag.com', 'AITAG Client'),
  ('Multilingual Product Descriptions for Homemade Spices Brand', 'E-Commerce & Copy', 'Craft compelling, appetizing product descriptions for 8 organic masala powders in English, Hindi, and Tamil to increase buyer trust and reduce customer sizing/usage queries.', '2026-11-08', 999, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800', 'open', 'client@aitag.com', 'AITAG Client'),
  ('Instagram Carousel & Reels Cover Templates for Fitness Studio', 'Social & Marketing', 'Design 8 educational swipe-carousel graphic sets, weekly workout schedule graphics, and video reel cover cards in our brand colors with targeted hashtags.', '2026-11-18', 2499, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800', 'open', 'client@aitag.com', 'AITAG Client'),
  ('High-Converting Landing Page with Lead Enquiry Form for CA Firm', 'Web & Funnels', 'Build a clean, trustworthy one-page website explaining our tax and accounting services with an instant lead capture enquiry form, Google Search indexing, and WhatsApp CTA.', '2026-11-30', 4499, 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800', 'open', 'client@aitag.com', 'AITAG Client')
ON CONFLICT DO NOTHING;

-- 9. Case Discussions & Communications
CREATE TABLE IF NOT EXISTS aitag_case_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES aitag_orders(id) ON DELETE CASCADE,
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

