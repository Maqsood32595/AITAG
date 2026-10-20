/**
 * AITAG Service Packages — Data Service
 * Reads packages & tiers from Supabase, with resilient fallback.
 * Complies with D:\Hayat\Modifications (Edits to MVP & Pilot Catalogue)
 */

const supabase = require('../../supabase');

// Default fallback data matching AITAG updated MVP requirements
const FALLBACK_PACKAGES = [
  {
    slug: 'ai-product-photo-makeover',
    title: 'AI Product Photo Makeover',
    tagline: 'Transform phone photos into studio-grade e-commerce product listings',
    description: 'Send us simple photos of your products taken on your phone. We\'ll use AI to remove messy backgrounds, fix the lighting and colours, and place your products in clean, professional settings. Your photos will be ready for Amazon, Flipkart, Meesho, Instagram or your WhatsApp catalogue. You don\'t need a studio or a photographer.',
    category: 'Product Visuals',
    icon: 'Camera',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    badge: 'Best Seller',
    display_order: 1,
    benefits: [
      'Better photos get more clicks and more sales online',
      'Saves ₹5,000–₹20,000 compared with a studio photoshoot',
      'Images meet marketplace rules (white background, correct size), so listings are less likely to be rejected'
    ],
    tiers: [
      {
        tier_name: 'package_1',
        price_min: 999,
        price_max: 999,
        delivery_days_min: 2,
        delivery_days_max: 3,
        revisions_included: 1,
        deliverable_summary: '5 photos, white background, 1 platform size, 1 revision',
        inclusions: ['5 clean product photos', 'Pure white background', '1 platform size optimized', 'Lighting and color fixes', '1 revision included', 'High-quality JPG/PNG format'],
        exclusions: ['Lifestyle background scenes', 'AI model placements']
      },
      {
        tier_name: 'package_2',
        price_min: 2999,
        price_max: 2999,
        delivery_days_min: 2,
        delivery_days_max: 4,
        revisions_included: 2,
        deliverable_summary: '15 photos, white + lifestyle backgrounds, 2 platform sizes, 2 revisions',
        inclusions: ['15 product photos (white & lifestyle)', 'Clean white + AI lifestyle scenes', '2 platform sizes optimized', 'Lighting & color fixes, blemish cleanup', '2 revisions included'],
        exclusions: ['AI human model casting', '3D asset rendering']
      },
      {
        tier_name: 'package_3',
        price_min: 5999,
        price_max: 7999,
        delivery_days_min: 3,
        delivery_days_max: 6,
        revisions_included: 2,
        deliverable_summary: '35 photos, AI model or lifestyle scenes, catalogue-ready set, 2 revisions',
        inclusions: ['35 photos (full catalogue-ready set)', 'AI model or lifestyle scenes', 'Multi-angle scenes & closeups', 'Complete blemish & color correction', '2 revisions included'],
        exclusions: ['Physical studio photoshoot']
      }
    ]
  },
  {
    slug: 'ai-product-listing-description',
    title: 'AI Product Listing & Description Writing',
    tagline: 'High-ranking marketplace listings & descriptions that turn viewers into buyers',
    description: 'Tell us about your product. We\'ll write clear, attractive titles, descriptions and key features that help customers find it and decide to buy. We can write in English, Hindi or your regional language, for Amazon, Flipkart, Meesho, your website or WhatsApp.',
    category: 'E-Commerce & Copy',
    icon: 'Edit3',
    image_url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800',
    badge: 'Starts at ₹999',
    display_order: 2,
    benefits: [
      'Your product shows up more often in marketplace searches',
      'Clear descriptions mean fewer customer questions and fewer returns',
      'One product can be listed across several platforms quickly'
    ],
    tiers: [
      {
        tier_name: 'package_1',
        price_min: 999,
        price_max: 999,
        delivery_days_min: 1,
        delivery_days_max: 2,
        revisions_included: 1,
        deliverable_summary: '1 product, 1 language, 1 platform, 1 article, 1 revision',
        inclusions: ['Product title with buyer keywords', '5 bullet-point features + full description', 'List of search keywords and tags', '1 language (English/Hindi/Regional)', 'Copy-paste ready file (Word/Excel)', '1 revision included'],
        exclusions: ['Competitor keyword analysis', 'Multiple platform formatting']
      },
      {
        tier_name: 'package_2',
        price_min: 1499,
        price_max: 2499,
        delivery_days_min: 2,
        delivery_days_max: 4,
        revisions_included: 2,
        deliverable_summary: '1 product, 1 language, 2 platforms, 2 articles, 2 revisions',
        inclusions: ['Formatted for 2 platforms (e.g. Amazon & Meesho)', '2 articles / descriptions', 'Keyword tags & bullet features', 'Copy-paste ready file (Word/Excel)', '2 revisions included'],
        exclusions: ['Direct seller account upload']
      },
      {
        tier_name: 'package_3',
        price_min: 4299,
        price_max: 6999,
        delivery_days_min: 4,
        delivery_days_max: 7,
        revisions_included: 2,
        deliverable_summary: '2 to 3 products, 1-3 languages, 1-3 platforms, 3 articles, competitor keyword check, 2 revisions',
        inclusions: ['Full coverage for 2 to 3 products', '1–3 languages (multilingual listing)', 'Formatted for up to 3 platforms', 'Competitor keyword gap check', '2 revisions included'],
        exclusions: ['Paid ads setup']
      }
    ]
  },
  {
    slug: 'ai-social-media-content-pack',
    title: 'AI Social Media Content Pack',
    tagline: 'A complete monthly social media calendar with branded graphics & copy',
    description: 'We\'ll create a month of ready-to-post content for your Instagram, Facebook or WhatsApp Status. That includes eye-catching designs, catchy captions and the right hashtags, all matched to your business and festival dates. You just post, or we can give you a calendar telling you what to post and when.',
    category: 'Social & Marketing',
    icon: 'Share2',
    image_url: '/images/packages/nt-text-logo.png',
    badge: 'Popular',
    display_order: 3,
    benefits: [
      'You stay visible to customers every day without spending hours on content',
      'Your brand looks professional and consistent',
      'Festival and offer posts help bring in more enquiries'
    ],
    tiers: [
      {
        tier_name: 'package_1',
        price_min: 2499,
        price_max: 2999,
        delivery_days_min: 3,
        delivery_days_max: 5,
        revisions_included: 1,
        deliverable_summary: '8 posts per month, 1 platform, captions in 1 language, 1 revision',
        inclusions: ['8 designed post images in brand colors', 'Captions & hashtags for every post', '1 platform (Instagram/FB/WhatsApp)', '1 revision included'],
        exclusions: ['Story templates', 'Content calendar schedule']
      },
      {
        tier_name: 'package_2',
        price_min: 3999,
        price_max: 4999,
        delivery_days_min: 4,
        delivery_days_max: 6,
        revisions_included: 2,
        deliverable_summary: '15 posts + 4 stories, 2 platforms, 1 language, festival posts, 2 revisions',
        inclusions: ['15 designed posts + 4 stories', 'Festival and special offer posts', 'Formatted for 2 platforms', 'Content calendar with posting schedule', '2 revisions included'],
        exclusions: ['Animated carousel videos']
      },
      {
        tier_name: 'package_3',
        price_min: 7499,
        price_max: 9299,
        delivery_days_min: 5,
        delivery_days_max: 7,
        revisions_included: 2,
        deliverable_summary: '25 posts + 6 stories, 1-2 languages, content calendar, carousel posts, 2 revisions',
        inclusions: ['25 posts + 6 stories (full month coverage)', 'Carousel posts included', 'Captions in 1–2 languages', 'Complete monthly content calendar', '2 revisions included'],
        exclusions: ['Daily manual posting/account login']
      }
    ]
  },
  {
    slug: 'ai-website-landing-page',
    title: 'AI Website Landing Page',
    tagline: 'High-converting one-page website designed to turn visitors into enquiries',
    description: 'Need a simple website for your business? We\'ll build a one-page website that tells customers who you are, what you sell, your prices or offers, and how to contact you. It works well on mobile phones and has a WhatsApp or call button, so customers can reach you in one tap. AI helps us write the text and design it quickly, so you get it faster and at a lower cost.',
    category: 'Web & Funnels',
    icon: 'Globe',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    badge: 'High ROI',
    display_order: 4,
    benefits: [
      'Your business looks trustworthy and can be found on Google',
      'One link to share on WhatsApp, Instagram, visiting cards and Google Maps',
      'Turns visitors into enquiries with call, WhatsApp and enquiry-form buttons',
      'Much cheaper and faster than a full multi-page website'
    ],
    tiers: [
      {
        tier_name: 'package_1',
        price_min: 3499,
        price_max: 4999,
        delivery_days_min: 4,
        delivery_days_max: 5,
        revisions_included: 1,
        deliverable_summary: 'Ready-made template, up to 5 sections, WhatsApp/call button, mobile-friendly, 1 revision',
        inclusions: ['1-page mobile-friendly website', 'Up to 5 custom sections', 'WhatsApp click-to-chat & Call buttons', 'AI-crafted business copywriting', '1 revision included'],
        exclusions: ['Domain & hosting fees (customer-owned)', 'Custom enquiry backend']
      },
      {
        tier_name: 'package_2',
        price_min: 7999,
        price_max: 9999,
        delivery_days_min: 5,
        delivery_days_max: 7,
        revisions_included: 2,
        deliverable_summary: 'Custom design, up to 8 sections, enquiry form, Google Maps, basic Google search setup, domain connection, 2 revisions',
        inclusions: ['Custom design with up to 8 sections', 'Lead capture enquiry form', 'Google Maps location embedding', 'Basic Google Search / SEO setup', 'Custom domain connection', '2 revisions included'],
        exclusions: ['Domain registration fees', 'Multi-page e-commerce cart']
      },
      {
        tier_name: 'package_3',
        price_min: 18999,
        price_max: 24999,
        delivery_days_min: 7,
        delivery_days_max: 10,
        revisions_included: 2,
        deliverable_summary: 'Premium design, booking or payment link, visitor tracking (Google Analytics), speed check, 30 days of support, 2 revisions',
        inclusions: ['Premium bespoke conversion design', 'Payment link or booking integration', 'Visitor tracking (Google Analytics)', 'Mobile speed optimization', '30 days post-launch support', '2 revisions included'],
        exclusions: ['Hosting/domain subscriptions (customer-owned)']
      }
    ]
  },
  {
    slug: 'ai-promo-video-reels',
    title: 'AI Promo Video & Reels Creation',
    tagline: 'Engaging short videos for Reels, YouTube Shorts and WhatsApp with AI voiceover',
    description: 'Give us your product photos, a few details and your offer. We\'ll turn them into short, engaging videos for Instagram Reels, YouTube Shorts or WhatsApp, complete with music, text and an AI voiceover in Hindi, English or your regional language. No camera or video editing skills needed.',
    category: 'Video & Reels',
    icon: 'Video',
    image_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800',
    badge: 'Trending',
    display_order: 5,
    benefits: [
      'Short videos reach far more people than photos on social media',
      'Explains your product quickly and builds trust',
      'Costs a fraction of hiring a video agency'
    ],
    tiers: [
      {
        tier_name: 'package_1',
        price_min: 999,
        price_max: 1499,
        delivery_days_min: 2,
        delivery_days_max: 2,
        revisions_included: 1,
        deliverable_summary: '2 reels (up to 30 seconds), Subtitle + music, 1 revision',
        inclusions: ['2 short vertical reels (up to 30s)', 'Subtitle & copyright-safe music', 'Your logo & offer overlay', 'Thumbnail cover image', '1 revision included'],
        exclusions: ['AI voiceover', 'Custom video script']
      },
      {
        tier_name: 'package_2',
        price_min: 3499,
        price_max: 4999,
        delivery_days_min: 3,
        delivery_days_max: 5,
        revisions_included: 2,
        deliverable_summary: '5 reels (up to 45 seconds), AI voiceover, 1 language, 2 revisions',
        inclusions: ['5 reels (up to 45s)', 'AI voiceover in your chosen language', 'Background music & animations', 'Thumbnail cover for each', '2 revisions included'],
        exclusions: ['AI human avatar presenter']
      },
      {
        tier_name: 'package_3',
        price_min: 6999,
        price_max: 9999,
        delivery_days_min: 5,
        delivery_days_max: 7,
        revisions_included: 2,
        deliverable_summary: '10 reels or 1 brand video (up to 90 seconds), script writing, AI presenter, 2 revisions',
        inclusions: ['10 reels or 1 brand video (up to 90s)', 'Script writing included', 'AI presenter or avatar', 'Full multi-platform formatting', '2 revisions included'],
        exclusions: ['Physical camera shoot']
      }
    ]
  }
];

class ServicePackagesService {
  async getAllPackages() {
    try {
      const { data: pkgs, error: pErr } = await supabase
        .from('aitag_packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (pErr || !pkgs || pkgs.length === 0) {
        return FALLBACK_PACKAGES;
      }

      const { data: tiers, error: tErr } = await supabase
        .from('aitag_package_tiers')
        .select('*');

      if (tErr || !tiers) {
        return FALLBACK_PACKAGES;
      }

      // Map tiers to their packages with dual-compatibility sorting
      return pkgs.map((pkg) => {
        const pkgTiers = tiers.filter((t) => t.package_id === pkg.id);
        const sortedTiers = pkgTiers.sort((a, b) => {
          const order = {
            package_1: 1, beginner: 1,
            package_2: 2, medium: 2,
            package_3: 3, expert: 3
          };
          return (order[a.tier_name] || 0) - (order[b.tier_name] || 0);
        });

        const resolvedTiers = sortedTiers.length > 0 ? sortedTiers : (FALLBACK_PACKAGES.find(f => f.slug === pkg.slug)?.tiers || []);
        const sanitizedTiers = resolvedTiers.map(tier => ({
          ...tier,
          price_min: Math.max(Number(tier.price_min) || 0, 999),
          price_max: Math.max(Number(tier.price_max) || 0, 999)
        }));

        return {
          ...pkg,
          image_url: (pkg.slug === 'ai-social-media-content-pack' || (pkg.image_url && pkg.image_url.includes('1611162617474')))
            ? '/images/packages/nt-text-logo.png'
            : pkg.image_url,
          badge: (pkg.badge || '').replace('₹499', '₹999'),
          benefits: pkg.benefits || [],
          tiers: sanitizedTiers
        };
      });
    } catch (err) {
      console.warn('⚠️ ServicePackages fallback invoked:', err.message);
      return FALLBACK_PACKAGES;
    }
  }

  async getPackageBySlug(slug) {
    const all = await this.getAllPackages();
    return all.find((p) => p.slug === slug) || null;
  }
}

module.exports = new ServicePackagesService();
