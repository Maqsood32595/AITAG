-- ============================================================
-- AITAG Pilot AI Service Packages & Order Workflow Migration
-- Project: trdwewugrqdpopzqhkuk (Dev Database)
-- Supports Fractal Kernel slices: packages, orders
-- ============================================================

-- 1. Pilot Service Packages Table
CREATE TABLE IF NOT EXISTS aitag_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  image_url TEXT,
  badge TEXT DEFAULT 'Popular',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Package Tiers Table (Beginner, Medium, Expert)
CREATE TABLE IF NOT EXISTS aitag_package_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES aitag_packages(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL CHECK (tier_name IN ('beginner', 'medium', 'expert')),
  price_min NUMERIC NOT NULL,
  price_max NUMERIC NOT NULL,
  delivery_days_min INT NOT NULL,
  delivery_days_max INT NOT NULL,
  revisions_included INT NOT NULL DEFAULT 1,
  inclusions JSONB NOT NULL DEFAULT '[]',
  exclusions JSONB NOT NULL DEFAULT '[]',
  deliverable_summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(package_id, tier_name)
);

-- 3. Service Orders Table (8-Stage Workflow State Machine)
CREATE TABLE IF NOT EXISTS aitag_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  package_slug TEXT NOT NULL,
  tier_name TEXT NOT NULL,
  package_title TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  business_name TEXT DEFAULT '',
  business_type TEXT DEFAULT '',
  brief_notes TEXT DEFAULT '',
  uploaded_assets JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN (
    'REQUESTED', 'QUALIFIED', 'MATCHED', 'SCOPE_CONFIRMED', 
    'PAID', 'ACTIVE', 'DRAFT_SUBMITTED', 'REVISION', 'COMPLETED', 'DISPUTED'
  )),
  agreed_price NUMERIC NOT NULL,
  platform_fee NUMERIC DEFAULT 0,
  expert_payout NUMERIC DEFAULT 0,
  assigned_expert_email TEXT DEFAULT '',
  assigned_expert_name TEXT DEFAULT '',
  draft_deliverables JSONB NOT NULL DEFAULT '[]',
  final_deliverables JSONB NOT NULL DEFAULT '[]',
  revision_notes TEXT DEFAULT '',
  rating INT DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  testimonial TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_aitag_orders_customer_email ON aitag_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_aitag_orders_expert_email ON aitag_orders(assigned_expert_email);
CREATE INDEX IF NOT EXISTS idx_aitag_orders_status ON aitag_orders(status);
CREATE INDEX IF NOT EXISTS idx_aitag_packages_slug ON aitag_packages(slug);

-- 4. Seed 3 Pilot Packages
INSERT INTO aitag_packages (slug, title, tagline, description, category, icon, image_url, badge, display_order)
VALUES
  (
    'ai-product-photo-makeover',
    'AI Product Photo Makeover',
    'Transform phone photos into studio-grade e-commerce product listings',
    'Turn basic smartphone photos into high-converting, professional studio images. Meets all marketplace requirements for Amazon, Flipkart, Meesho, and Shopify.',
    'Product Visuals',
    'Camera',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    'Best Seller',
    1
  ),
  (
    'ai-social-media-content-pack',
    'AI Social Media Content Pack',
    'A complete monthly social media calendar with branded graphics & copy',
    'A ready-to-post monthly content pack designed for your brand. Includes graphics, captions, local festival creatives, and researched hashtag sets.',
    'Social & Marketing',
    'Share2',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    'Popular',
    2
  ),
  (
    'ai-website-landing-page',
    'AI Website Landing Page',
    'High-converting one-page website designed to turn visitors into enquiries',
    'A clean, fast, mobile-friendly landing page with AI-written copy, WhatsApp click-to-chat, contact form, and Google Maps pin to get direct customer inquiries.',
    'Web & Funnels',
    'Globe',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    'High ROI',
    3
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  image_url = EXCLUDED.image_url,
  badge = EXCLUDED.badge,
  display_order = EXCLUDED.display_order;

-- 5. Seed Package Tiers for AI Product Photo Makeover
WITH p AS (SELECT id FROM aitag_packages WHERE slug = 'ai-product-photo-makeover')
INSERT INTO aitag_package_tiers (package_id, tier_name, price_min, price_max, delivery_days_min, delivery_days_max, revisions_included, inclusions, exclusions, deliverable_summary)
SELECT p.id, 'beginner', 499, 999, 1, 2, 1,
  '["5 clean product photos", "Pure white background", "Standard marketplace size", "1 revision included"]'::jsonb,
  '["Lifestyle background scenes", "Infographics or text overlays"]'::jsonb,
  '5 studio cutout images with pure white background'
FROM p
ON CONFLICT (package_id, tier_name) DO UPDATE SET
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  delivery_days_min = EXCLUDED.delivery_days_min,
  delivery_days_max = EXCLUDED.delivery_days_max,
  revisions_included = EXCLUDED.revisions_included,
  inclusions = EXCLUDED.inclusions,
  exclusions = EXCLUDED.exclusions,
  deliverable_summary = EXCLUDED.deliverable_summary;

WITH p AS (SELECT id FROM aitag_packages WHERE slug = 'ai-product-photo-makeover')
INSERT INTO aitag_package_tiers (package_id, tier_name, price_min, price_max, delivery_days_min, delivery_days_max, revisions_included, inclusions, exclusions, deliverable_summary)
SELECT p.id, 'medium', 1499, 2999, 2, 3, 2,
  '["15 product photos (white & lifestyle)", "3 AI lifestyle background scenes", "Optimized for Amazon/Flipkart/Shopify", "2 revisions included"]'::jsonb,
  '["3D model rendering", "Packaging redesign"]'::jsonb,
  '15 photos with white background and AI lifestyle settings'
FROM p
ON CONFLICT (package_id, tier_name) DO UPDATE SET
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  delivery_days_min = EXCLUDED.delivery_days_min,
  delivery_days_max = EXCLUDED.delivery_days_max,
  revisions_included = EXCLUDED.revisions_included,
  inclusions = EXCLUDED.inclusions,
  exclusions = EXCLUDED.exclusions,
  deliverable_summary = EXCLUDED.deliverable_summary;

WITH p AS (SELECT id FROM aitag_packages WHERE slug = 'ai-product-photo-makeover')
INSERT INTO aitag_package_tiers (package_id, tier_name, price_min, price_max, delivery_days_min, delivery_days_max, revisions_included, inclusions, exclusions, deliverable_summary)
SELECT p.id, 'expert', 3999, 7999, 3, 5, 2,
  '["30 product photos (full catalogue)", "Multi-angle scenes & closeups", "1 promotional graphic banner", "Source files included", "2 revisions included"]'::jsonb,
  '["Physical studio shipping"]'::jsonb,
  '30 catalogue-ready images + promotional banner'
FROM p
ON CONFLICT (package_id, tier_name) DO UPDATE SET
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  delivery_days_min = EXCLUDED.delivery_days_min,
  delivery_days_max = EXCLUDED.delivery_days_max,
  revisions_included = EXCLUDED.revisions_included,
  inclusions = EXCLUDED.inclusions,
  exclusions = EXCLUDED.exclusions,
  deliverable_summary = EXCLUDED.deliverable_summary;

-- 6. Seed Package Tiers for AI Social Media Content Pack
WITH p AS (SELECT id FROM aitag_packages WHERE slug = 'ai-social-media-content-pack')
INSERT INTO aitag_package_tiers (package_id, tier_name, price_min, price_max, delivery_days_min, delivery_days_max, revisions_included, inclusions, exclusions, deliverable_summary)
SELECT p.id, 'beginner', 1999, 2999, 3, 4, 1,
  '["12 ready-to-post graphics", "AI-written captions in English/Hindi", "Researched hashtag sets", "Canva editable link", "1 revision included"]'::jsonb,
  '["Video reels", "Account management/daily posting"]'::jsonb,
  '12 graphics with captions and hashtags'
FROM p
ON CONFLICT (package_id, tier_name) DO UPDATE SET
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  delivery_days_min = EXCLUDED.delivery_days_min,
  delivery_days_max = EXCLUDED.delivery_days_max,
  revisions_included = EXCLUDED.revisions_included,
  inclusions = EXCLUDED.inclusions,
  exclusions = EXCLUDED.exclusions,
  deliverable_summary = EXCLUDED.deliverable_summary;

WITH p AS (SELECT id FROM aitag_packages WHERE slug = 'ai-social-media-content-pack')
INSERT INTO aitag_package_tiers (package_id, tier_name, price_min, price_max, delivery_days_min, delivery_days_max, revisions_included, inclusions, exclusions, deliverable_summary)
SELECT p.id, 'medium', 2999, 4999, 4, 5, 2,
  '["20 posts (mix of product, tips, offers)", "2 AI video reel templates", "Festival greeting creative", "Monthly posting calendar schedule", "2 revisions included"]'::jsonb,
  '["Running paid ad campaigns"]'::jsonb,
  '20 posts + 2 video reels + posting calendar'
FROM p
ON CONFLICT (package_id, tier_name) DO UPDATE SET
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  delivery_days_min = EXCLUDED.delivery_days_min,
  delivery_days_max = EXCLUDED.delivery_days_max,
  revisions_included = EXCLUDED.revisions_included,
  inclusions = EXCLUDED.inclusions,
  exclusions = EXCLUDED.exclusions,
  deliverable_summary = EXCLUDED.deliverable_summary;

WITH p AS (SELECT id FROM aitag_packages WHERE slug = 'ai-social-media-content-pack')
INSERT INTO aitag_package_tiers (package_id, tier_name, price_min, price_max, delivery_days_min, delivery_days_max, revisions_included, inclusions, exclusions, deliverable_summary)
SELECT p.id, 'expert', 5299, 9299, 5, 7, 2,
  '["30 daily posts for entire month", "4 short video reels with AI voiceover", "Monthly strategy & theme guide", "Story creatives included", "2 revisions included"]'::jsonb,
  '["Responding to customer DMs"]'::jsonb,
  'Full month 30-post package + 4 reels + story templates'
FROM p
ON CONFLICT (package_id, tier_name) DO UPDATE SET
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  delivery_days_min = EXCLUDED.delivery_days_min,
  delivery_days_max = EXCLUDED.delivery_days_max,
  revisions_included = EXCLUDED.revisions_included,
  inclusions = EXCLUDED.inclusions,
  exclusions = EXCLUDED.exclusions,
  deliverable_summary = EXCLUDED.deliverable_summary;

-- 7. Seed Package Tiers for AI Website Landing Page
WITH p AS (SELECT id FROM aitag_packages WHERE slug = 'ai-website-landing-page')
INSERT INTO aitag_package_tiers (package_id, tier_name, price_min, price_max, delivery_days_min, delivery_days_max, revisions_included, inclusions, exclusions, deliverable_summary)
SELECT p.id, 'beginner', 2499, 4999, 4, 5, 1,
  '["1-page mobile-friendly website", "Up to 5 custom sections", "WhatsApp click-to-chat & Call buttons", "AI-crafted business copywriting", "1 revision included"]'::jsonb,
  '["Domain and hosting charges (paid by customer)", "Payment gateway integration"]'::jsonb,
  '1-page website with 5 sections and direct WhatsApp CTA'
FROM p
ON CONFLICT (package_id, tier_name) DO UPDATE SET
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  delivery_days_min = EXCLUDED.delivery_days_min,
  delivery_days_max = EXCLUDED.delivery_days_max,
  revisions_included = EXCLUDED.revisions_included,
  inclusions = EXCLUDED.inclusions,
  exclusions = EXCLUDED.exclusions,
  deliverable_summary = EXCLUDED.deliverable_summary;

WITH p AS (SELECT id FROM aitag_packages WHERE slug = 'ai-website-landing-page')
INSERT INTO aitag_package_tiers (package_id, tier_name, price_min, price_max, delivery_days_min, delivery_days_max, revisions_included, inclusions, exclusions, deliverable_summary)
SELECT p.id, 'medium', 5999, 9999, 5, 7, 2,
  '["Custom design with up to 8 sections", "Lead capture enquiry form", "Google Maps location embedding", "Basic Google Search / SEO setup", "Custom domain connection", "2 revisions included"]'::jsonb,
  '["Domain registration fees", "Multi-page e-commerce cart"]'::jsonb,
  '8-section landing page with enquiry form and Google Maps'
FROM p
ON CONFLICT (package_id, tier_name) DO UPDATE SET
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  delivery_days_min = EXCLUDED.delivery_days_min,
  delivery_days_max = EXCLUDED.delivery_days_max,
  revisions_included = EXCLUDED.revisions_included,
  inclusions = EXCLUDED.inclusions,
  exclusions = EXCLUDED.exclusions,
  deliverable_summary = EXCLUDED.deliverable_summary;

WITH p AS (SELECT id FROM aitag_packages WHERE slug = 'ai-website-landing-page')
INSERT INTO aitag_package_tiers (package_id, tier_name, price_min, price_max, delivery_days_min, delivery_days_max, revisions_included, inclusions, exclusions, deliverable_summary)
SELECT p.id, 'expert', 14999, 24999, 7, 10, 2,
  '["Premium bespoke conversion design", "Payment link or booking integration", "Visitor analytics tracking (Google Analytics)", "Mobile speed optimization", "30 days post-launch support", "2 revisions included"]'::jsonb,
  '["Hosting/domain subscriptions (customer-owned)"]'::jsonb,
  'Premium high-converting landing page with analytics & booking'
FROM p
ON CONFLICT (package_id, tier_name) DO UPDATE SET
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  delivery_days_min = EXCLUDED.delivery_days_min,
  delivery_days_max = EXCLUDED.delivery_days_max,
  revisions_included = EXCLUDED.revisions_included,
  inclusions = EXCLUDED.inclusions,
  exclusions = EXCLUDED.exclusions,
  deliverable_summary = EXCLUDED.deliverable_summary;
