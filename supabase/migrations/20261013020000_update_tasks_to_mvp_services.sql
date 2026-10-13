-- ============================================================
-- Migration: 20261013020000_update_tasks_to_mvp_services.sql
-- Description: Replaces legacy enterprise developer tasks with
-- 8 practical small-business AI tasks matching the 4 core categories:
-- 'Product Visuals', 'E-Commerce & Copy', 'Social & Marketing', 'Web & Funnels'.
-- ============================================================

-- 1. Remove legacy developer tasks that match old categories
DELETE FROM aitag_tasks 
WHERE category IN ('AI Engineering', 'Machine Learning', 'ML Ops', 'Data Science', 'Design', 'Writing', 'Web Development', 'Mobile Development');

-- 2. Insert 8 practical small-business tasks
INSERT INTO aitag_tasks (title, category, description, deadline, budget, image, status, user_email, user_name)
VALUES
  (
    'Studio White-Background Cutouts for 15 Amazon Cosmetic Products',
    'Product Visuals',
    'We have raw smartphone photos of 15 skincare cosmetic jars. Need clean pure white backgrounds, realistic contact shadows, blemish cleanup, and Amazon-compliant 2000x2000px JPG exports.',
    '2026-11-15',
    1499,
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
    'open',
    'client@aitag.com',
    'AITAG Client'
  ),
  (
    'Amazon & Flipkart SEO Listing Copy for Ethnic Footwear Store',
    'E-Commerce & Copy',
    'Need high-converting marketplace titles, 5 benefit-driven bullet points, and high-search-volume backend keywords for 5 new sandal SKUs in English and Hindi.',
    '2026-11-10',
    999,
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
    'open',
    'client@aitag.com',
    'AITAG Client'
  ),
  (
    '30-Day Festival Creative & Offer Pack for Local Bakery',
    'Social & Marketing',
    'Need 25 branded Instagram & Facebook post designs, festive holiday greetings, discount banners, and WhatsApp Status offer templates for the upcoming festive season.',
    '2026-11-20',
    3499,
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    'open',
    'client@aitag.com',
    'AITAG Client'
  ),
  (
    'One-Page Mobile Website with Instant WhatsApp Button for Boutique',
    'Web & Funnels',
    'Need a fast, mobile-friendly single-page business website featuring our clothing collections, Google Maps shop location, customer testimonials, and direct WhatsApp click-to-chat button.',
    '2026-11-25',
    3999,
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    'open',
    'client@aitag.com',
    'AITAG Client'
  ),
  (
    'AI Product Photo Makeover for 20 Meesho Saree Listings',
    'Product Visuals',
    'Transform flat-lay smartphone saree photos into studio-lit catalogue images with clean elegant backgrounds. Must meet Meesho listing standards.',
    '2026-11-12',
    1999,
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
    'open',
    'client@aitag.com',
    'AITAG Client'
  ),
  (
    'Multilingual Product Descriptions for Homemade Spices Brand',
    'E-Commerce & Copy',
    'Craft compelling, appetizing product descriptions for 8 organic masala powders in English, Hindi, and Tamil to increase buyer trust and reduce customer sizing/usage queries.',
    '2026-11-08',
    899,
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800',
    'open',
    'client@aitag.com',
    'AITAG Client'
  ),
  (
    'Instagram Carousel & Reels Cover Templates for Fitness Studio',
    'Social & Marketing',
    'Design 8 educational swipe-carousel graphic sets, weekly workout schedule graphics, and video reel cover cards in our brand colors with targeted hashtags.',
    '2026-11-18',
    2499,
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
    'open',
    'client@aitag.com',
    'AITAG Client'
  ),
  (
    'High-Converting Landing Page with Lead Enquiry Form for CA Firm',
    'Web & Funnels',
    'Build a clean, trustworthy one-page website explaining our tax and accounting services with an instant lead capture enquiry form, Google Search indexing, and WhatsApp CTA.',
    '2026-11-30',
    4499,
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    'open',
    'client@aitag.com',
    'AITAG Client'
  );
