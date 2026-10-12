-- ============================================================
-- AITAG MVP Package Updates & 4-Category Tier Expansion
-- Complies with D:\Hayat\Modifications (Edits to MVP & Pilot Catalogue)
-- Tiers renamed: Package 1, Package 2, Package 3 (aliased with beginner/medium/expert)
-- ============================================================

-- 1. Ensure columns exist on aitag_packages
ALTER TABLE aitag_packages ADD COLUMN IF NOT EXISTS benefits JSONB NOT NULL DEFAULT '[]';

-- 2. Adjust constraint on aitag_package_tiers to allow package_1, package_2, package_3
ALTER TABLE aitag_package_tiers DROP CONSTRAINT IF EXISTS aitag_package_tiers_tier_name_check;
ALTER TABLE aitag_package_tiers ADD CONSTRAINT aitag_package_tiers_tier_name_check 
  CHECK (tier_name IN ('beginner', 'medium', 'expert', 'package_1', 'package_2', 'package_3'));

-- 3. Clear old packages and seed the complete updated MVP Catalogue
DELETE FROM aitag_package_tiers;
DELETE FROM aitag_packages;

-- Insert 1: AI Product Photo Makeover
INSERT INTO aitag_packages (id, slug, title, tagline, description, category, icon, image_url, badge, display_order, benefits)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'ai-product-photo-makeover',
  'AI Product Photo Makeover',
  'Transform phone photos into studio-grade e-commerce product listings',
  'Send us simple photos of your products taken on your phone. We''ll use AI to remove messy backgrounds, fix the lighting and colours, and place your products in clean, professional settings. Your photos will be ready for Amazon, Flipkart, Meesho, Instagram or your WhatsApp catalogue. You don''t need a studio or a photographer.',
  'Product Visuals',
  'Camera',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
  'Best Seller',
  1,
  '[
    "Better photos get more clicks and more sales online",
    "Saves ₹5,000–₹20,000 compared with a studio photoshoot",
    "Images meet marketplace rules (white background, correct size), so listings are less likely to be rejected"
  ]'::jsonb
);

-- Tiers for AI Product Photo Makeover
INSERT INTO aitag_package_tiers (package_id, tier_name, price_min, price_max, delivery_days_min, delivery_days_max, revisions_included, deliverable_summary, inclusions, exclusions)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'package_1',
    999, 999, 2, 3, 1,
    '5 photos, white background, 1 platform size, 1 revision',
    '["5 clean product photos", "Pure white background", "1 platform size optimized", "Lighting and color fixes", "1 revision included", "High-quality JPG/PNG format"]'::jsonb,
    '["Lifestyle background scenes", "AI model placements"]'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'package_2',
    2999, 2999, 2, 4, 2,
    '15 photos, white + lifestyle backgrounds, 2 platform sizes, 2 revisions',
    '["15 product photos (white & lifestyle)", "Clean white + AI lifestyle scenes", "2 platform sizes optimized", "Lighting & color fixes, blemish cleanup", "2 revisions included"]'::jsonb,
    '["AI human model casting", "3D asset rendering"]'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'package_3',
    5999, 7999, 3, 6, 2,
    '35 photos, AI model or lifestyle scenes, catalogue-ready set, 2 revisions',
    '["35 photos (full catalogue-ready set)", "AI model or lifestyle scenes", "Multi-angle scenes & closeups", "Complete blemish & color correction", "2 revisions included"]'::jsonb,
    '["Physical studio photoshoot"]'::jsonb
  );

-- Insert 2: AI Product Listing & Description Writing (Starts at ₹499)
INSERT INTO aitag_packages (id, slug, title, tagline, description, category, icon, image_url, badge, display_order, benefits)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'ai-product-listing-description',
  'AI Product Listing & Description Writing',
  'High-ranking marketplace listings & descriptions that turn viewers into buyers',
  'Tell us about your product. We''ll write clear, attractive titles, descriptions and key features that help customers find it and decide to buy. We can write in English, Hindi or your regional language, for Amazon, Flipkart, Meesho, your website or WhatsApp.',
  'E-Commerce & Copy',
  'Edit3',
  'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800',
  'Starts at ₹499',
  2,
  '[
    "Your product shows up more often in marketplace searches",
    "Clear descriptions mean fewer customer questions and fewer returns",
    "One product can be listed across several platforms quickly"
  ]'::jsonb
);

-- Tiers for AI Product Listing & Description Writing
INSERT INTO aitag_package_tiers (package_id, tier_name, price_min, price_max, delivery_days_min, delivery_days_max, revisions_included, deliverable_summary, inclusions, exclusions)
VALUES
  (
    '22222222-2222-2222-2222-222222222222',
    'package_1',
    499, 999, 1, 2, 1,
    '1 product, 1 language, 1 platform, 1 article, 1 revision',
    '["Product title with buyer keywords", "5 bullet-point features + full description", "List of search keywords and tags", "1 language (English/Hindi/Regional)", "Copy-paste ready file (Word/Excel)", "1 revision included"]'::jsonb,
    '["Competitor keyword analysis", "Multiple platform formatting"]'::jsonb
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'package_2',
    1499, 2499, 2, 4, 2,
    '1 product, 1 language, 2 platforms, 2 articles, 2 revisions',
    '["Formatted for 2 platforms (e.g. Amazon & Meesho)", "2 articles / descriptions", "Keyword tags & bullet features", "Copy-paste ready file (Word/Excel)", "2 revisions included"]'::jsonb,
    '["Direct seller account upload"]'::jsonb
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'package_3',
    4299, 6999, 4, 7, 2,
    '2 to 3 products, 1-3 languages, 1-3 platforms, 3 articles, competitor keyword check, 2 revisions',
    '["Full coverage for 2 to 3 products", "1–3 languages (multilingual listing)", "Formatted for up to 3 platforms", "Competitor keyword gap check", "2 revisions included"]'::jsonb,
    '["Paid ads setup"]'::jsonb
  );

-- Insert 3: AI Social Media Content Pack
INSERT INTO aitag_packages (id, slug, title, tagline, description, category, icon, image_url, badge, display_order, benefits)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'ai-social-media-content-pack',
  'AI Social Media Content Pack',
  'A complete monthly social media calendar with branded graphics & copy',
  'We''ll create a month of ready-to-post content for your Instagram, Facebook or WhatsApp Status. That includes eye-catching designs, catchy captions and the right hashtags, all matched to your business and festival dates. You just post, or we can give you a calendar telling you what to post and when.',
  'Social & Marketing',
  'Share2',
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
  'Popular',
  3,
  '[
    "You stay visible to customers every day without spending hours on content",
    "Your brand looks professional and consistent",
    "Festival and offer posts help bring in more enquiries"
  ]'::jsonb
);

-- Tiers for AI Social Media Content Pack
INSERT INTO aitag_package_tiers (package_id, tier_name, price_min, price_max, delivery_days_min, delivery_days_max, revisions_included, deliverable_summary, inclusions, exclusions)
VALUES
  (
    '33333333-3333-3333-3333-333333333333',
    'package_1',
    2499, 2999, 3, 5, 1,
    '8 posts per month, 1 platform, captions in 1 language, 1 revision',
    '["8 designed post images in brand colors", "Captions & hashtags for every post", "1 platform (Instagram/FB/WhatsApp)", "1 revision included"]'::jsonb,
    '["Story templates", "Content calendar schedule"]'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'package_2',
    3999, 4999, 4, 6, 2,
    '15 posts + 4 stories, 2 platforms, 1 language, festival posts, 2 revisions',
    '["15 designed posts + 4 stories", "Festival and special offer posts", "Formatted for 2 platforms", "Content calendar with posting schedule", "2 revisions included"]'::jsonb,
    '["Animated carousel videos"]'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'package_3',
    7499, 9299, 5, 7, 2,
    '25 posts + 6 stories, 1-2 languages, content calendar, carousel posts, 2 revisions',
    '["25 posts + 6 stories (full month coverage)", "Carousel posts included", "Captions in 1–2 languages", "Complete monthly content calendar", "2 revisions included"]'::jsonb,
    '["Daily manual posting/account login"]'::jsonb
  );

-- Insert 4: AI Website Landing Page
INSERT INTO aitag_packages (id, slug, title, tagline, description, category, icon, image_url, badge, display_order, benefits)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'ai-website-landing-page',
  'AI Website Landing Page',
  'High-converting one-page website designed to turn visitors into enquiries',
  'Need a simple website for your business? We''ll build a one-page website that tells customers who you are, what you sell, your prices or offers, and how to contact you. It works well on mobile phones and has a WhatsApp or call button, so customers can reach you in one tap. AI helps us write the text and design it quickly, so you get it faster and at a lower cost.',
  'Web & Funnels',
  'Globe',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  'High ROI',
  4,
  '[
    "Your business looks trustworthy and can be found on Google",
    "One link to share on WhatsApp, Instagram, visiting cards and Google Maps",
    "Turns visitors into enquiries with call, WhatsApp and enquiry-form buttons",
    "Much cheaper and faster than a full multi-page website"
  ]'::jsonb
);

-- Tiers for AI Website Landing Page
INSERT INTO aitag_package_tiers (package_id, tier_name, price_min, price_max, delivery_days_min, delivery_days_max, revisions_included, deliverable_summary, inclusions, exclusions)
VALUES
  (
    '44444444-4444-4444-4444-444444444444',
    'package_1',
    3499, 4999, 4, 5, 1,
    'Ready-made template, up to 5 sections, WhatsApp/call button, mobile-friendly, 1 revision',
    '["1-page mobile-friendly website", "Up to 5 custom sections", "WhatsApp click-to-chat & Call buttons", "AI-crafted business copywriting", "1 revision included"]'::jsonb,
    '["Domain & hosting fees (customer-owned)", "Custom enquiry backend"]'::jsonb
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'package_2',
    7999, 9999, 5, 7, 2,
    'Custom design, up to 8 sections, enquiry form, Google Maps, basic Google search setup, domain connection, 2 revisions',
    '["Custom design with up to 8 sections", "Lead capture enquiry form", "Google Maps location embedding", "Basic Google Search / SEO setup", "Custom domain connection", "2 revisions included"]'::jsonb,
    '["Domain registration fees", "Multi-page e-commerce cart"]'::jsonb
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'package_3',
    18999, 24999, 7, 10, 2,
    'Premium design, booking or payment link, visitor tracking (Google Analytics), speed check, 30 days of support, 2 revisions',
    '["Premium bespoke conversion design", "Payment link or booking integration", "Visitor tracking (Google Analytics)", "Mobile speed optimization", "30 days post-launch support", "2 revisions included"]'::jsonb,
    '["Hosting/domain subscriptions (customer-owned)"]'::jsonb
  );

-- Insert 5: AI Promo Video & Reels Creation (Catalog & Scale)
INSERT INTO aitag_packages (id, slug, title, tagline, description, category, icon, image_url, badge, display_order, benefits)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'ai-promo-video-reels',
  'AI Promo Video & Reels Creation',
  'Engaging short videos for Reels, YouTube Shorts and WhatsApp with AI voiceover',
  'Give us your product photos, a few details and your offer. We''ll turn them into short, engaging videos for Instagram Reels, YouTube Shorts or WhatsApp, complete with music, text and an AI voiceover in Hindi, English or your regional language. No camera or video editing skills needed.',
  'Video & Reels',
  'Video',
  'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800',
  'Trending',
  5,
  '[
    "Short videos reach far more people than photos on social media",
    "Explains your product quickly and builds trust",
    "Costs a fraction of hiring a video agency"
  ]'::jsonb
);

-- Tiers for AI Promo Video & Reels Creation
INSERT INTO aitag_package_tiers (package_id, tier_name, price_min, price_max, delivery_days_min, delivery_days_max, revisions_included, deliverable_summary, inclusions, exclusions)
VALUES
  (
    '55555555-5555-5555-5555-555555555555',
    'package_1',
    999, 1499, 2, 2, 1,
    '2 reels (up to 30 seconds), Subtitle + music, 1 revision',
    '["2 short vertical reels (up to 30s)", "Subtitle & copyright-safe music", "Your logo & offer overlay", "Thumbnail cover image", "1 revision included"]'::jsonb,
    '["AI voiceover", "Custom video script"]'::jsonb
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'package_2',
    3499, 4999, 3, 5, 2,
    '5 reels (up to 45 seconds), AI voiceover, 1 language, 2 revisions',
    '["5 reels (up to 45s)", "AI voiceover in your chosen language", "Background music & animations", "Thumbnail cover for each", "2 revisions included"]'::jsonb,
    '["AI human avatar presenter"]'::jsonb
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'package_3',
    6999, 9999, 5, 7, 2,
    '10 reels or 1 brand video (up to 90 seconds), script writing, AI presenter, 2 revisions',
    '["10 reels or 1 brand video (up to 90s)", "Script writing included", "AI presenter or avatar", "Full multi-platform formatting", "2 revisions included"]'::jsonb,
    '["Physical camera shoot"]'::jsonb
  );
