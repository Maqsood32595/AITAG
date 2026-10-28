/**
 * AITAG Service Packages — Fractal Kernel Child Module
 * =====================================================
 * Implements the Binary Pricing Architecture (Starter / Pro).
 * 4 productized services for Indian SMBs with 24–48h delivery.
 *
 * Architecture: Fractal Kernel → Child (service-packages) → Grandchild (catalog-validator, tier-resolver)
 * Ref: D:\Hayat\AITAG\new implementations\indian_smb_productized_services_and_pricing.md
 */

const supabase = require('../../supabase');

// ─────────────────────────────────────────────────────────
// GRANDCHILD: Binary Tier Resolver
// Maps any legacy tier name to the new binary model
// ─────────────────────────────────────────────────────────
const TIER_ALIAS_MAP = {
  package_1: 'starter',
  beginner: 'starter',
  starter: 'starter',
  package_2: 'pro',
  package_3: 'pro',
  medium: 'pro',
  expert: 'pro',
  pro: 'pro',
};

function resolveTierAlias(tierName) {
  const key = (tierName || '').toLowerCase().trim();
  return TIER_ALIAS_MAP[key] || 'starter';
}

// ─────────────────────────────────────────────────────────
// GRANDCHILD: Catalog Validator
// Validates package structure before serving
// ─────────────────────────────────────────────────────────
function validatePackage(pkg) {
  if (!pkg.slug || !pkg.title || !Array.isArray(pkg.tiers)) {
    throw new Error(`Invalid package structure: ${pkg.slug}`);
  }
  pkg.tiers.forEach((tier) => {
    if (!['starter', 'pro'].includes(tier.tier_name)) {
      throw new Error(`Invalid tier name "${tier.tier_name}" in package "${pkg.slug}" — must be starter or pro`);
    }
    if (typeof tier.price_min !== 'number' || tier.price_min <= 0) {
      throw new Error(`Invalid price_min in tier "${tier.tier_name}" of package "${pkg.slug}"`);
    }
  });
  return true;
}

// ─────────────────────────────────────────────────────────
// CHILD: Authoritative Binary Pricing Catalog
// Binary Model: Starter (₹1,499) | Pro (₹3,499)
// Delivery: 2–6 days (Starter: 2–4 days | Pro: 4–6 days). 0% ongoing maintenance.
// ─────────────────────────────────────────────────────────
const FALLBACK_PACKAGES = [
  {
    slug: 'ai-product-photo-makeover',
    title: 'AI Product Photo Makeover',
    tagline: 'Studio-grade marketplace photos from your phone in 2–4 days',
    description:
      'Send us simple phone photos of your products. We use AI to remove backgrounds, fix lighting, add professional settings, and make your photos marketplace-ready for Amazon, Flipkart, Meesho, Instagram or WhatsApp catalogue — no studio or photographer needed.',
    category: 'Product Visuals',
    icon: 'Camera',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    badge: 'Best Seller',
    display_order: 1,
    benefits: [
      'Better photos get more clicks and more sales online',
      'Saves ₹15,000+ compared with a physical studio photoshoot',
      'Images meet marketplace rules (white background, correct size) — zero listing rejections',
      '100% marketplace-compliant: Amazon, Flipkart, Meesho, Myntra'
    ],
    pipeline: '📱 Phone photo → AI background removal → Ambient shadow → Lifestyle scenes → Marketplace-ready delivery',
    tiers: [
      {
        tier_name: 'starter',
        display_name: 'Starter',
        price_min: 1499,
        price_max: 1499,
        delivery_hours_min: 48,
        delivery_hours_max: 96,
        delivery_days_min: 2,
        delivery_days_max: 4,
        revisions_included: 1,
        deliverable_summary: '10 product photos, pure white background, 2000×2000px, 1 revision',
        inclusions: [
          '10 clean product photos',
          'Pure white background RGB(255,255,255) — marketplace compliant',
          'Realistic ambient contact shadow (no floating look)',
          '2000×2000px high-resolution standard',
          'Lighting and color correction',
          '1 revision included',
          'High-quality JPG/PNG delivery'
        ],
        exclusions: ['Lifestyle background scenes', 'AI model placements']
      },
      {
        tier_name: 'pro',
        display_name: 'Pro',
        price_min: 3499,
        price_max: 3499,
        delivery_hours_min: 96,
        delivery_hours_max: 144,
        delivery_days_min: 4,
        delivery_days_max: 6,
        revisions_included: 2,
        deliverable_summary: '25 photos: 15 white-bg + 8 lifestyle scenes + 2 infographics, 2 revisions',
        inclusions: [
          '25 high-resolution product images',
          '15x pure white background multi-angle shots',
          '8x AI lifestyle scenes (kitchen, marble, festive/Diwali)',
          '2x feature/dimension callout infographics (reduces return rates)',
          'Full web-optimised WebP + original PNG archive',
          '2 revisions included'
        ],
        exclusions: ['Physical studio photoshoot', '3D rendering']
      }
    ]
  },
  {
    slug: 'ai-marketing-video-reels',
    title: 'Marketing Video & Promo Reels',
    tagline: 'Viral-ready Instagram Reels, YouTube Shorts & WhatsApp Status in 2–6 days',
    description:
      'We create vertical 9:16 promo reels for your business using AI voiceover, dynamic captions and royalty-free music — ready to post on Instagram, YouTube Shorts or WhatsApp Status. No filming needed. You provide your product details and we deliver scroll-stopping videos.',
    category: 'Social & Marketing',
    icon: 'Video',
    image_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800',
    badge: 'High ROI',
    display_order: 2,
    benefits: [
      'Reels get 3–5× more reach than static posts on Instagram and Facebook',
      'Natural Indian AI voiceover builds instant trust with local audiences',
      'No filming or video editing skills required — fully AI-automated pipeline',
      'Alex Hormozi-style dynamic captions that stop the scroll'
    ],
    pipeline: '✍️ LLM script → 🎙️ ElevenLabs Indian voiceover → 🎬 HeyGen avatar/slideshow → 📦 MP4 delivery',
    tiers: [
      {
        tier_name: 'starter',
        display_name: 'Starter',
        price_min: 1499,
        price_max: 1499,
        delivery_hours_min: 48,
        delivery_hours_max: 96,
        delivery_days_min: 2,
        delivery_days_max: 4,
        revisions_included: 1,
        deliverable_summary: '2x 15–30s vertical promo reels, Indian AI voiceover, animated captions, 1 revision',
        inclusions: [
          '2x 15–30s vertical promo reels (9:16)',
          'Direct-response hook script (English or Hinglish)',
          'Natural Indian AI voiceover via ElevenLabs',
          'Alex Hormozi-style dynamic animated captions',
          'Trending royalty-free background audio',
          '1 revision included',
          'HD MP4 file delivery'
        ],
        exclusions: ['Cover thumbnails', 'Multi-language versions']
      },
      {
        tier_name: 'pro',
        display_name: 'Pro',
        price_min: 3499,
        price_max: 3499,
        delivery_hours_min: 96,
        delivery_hours_max: 144,
        delivery_days_min: 4,
        delivery_days_max: 6,
        revisions_included: 2,
        deliverable_summary: '5x reels (full week campaign), thumbnails, 1080p MP4, 2 revisions',
        inclusions: [
          '5x 15–30s vertical promo reels (full week campaign)',
          'Mixed content: 2x Offer Promos, 2x Educational/Benefits, 1x Brand Story',
          'Custom high-contrast video cover thumbnails for Instagram Grid',
          'High-definition 1080p MP4 file delivery',
          '2 revisions included'
        ],
        exclusions: ['Manual account posting', 'Paid ad setup']
      }
    ]
  },
  {
    slug: 'ai-website-landing-page',
    title: '5-Page Static Business Website',
    tagline: 'Mobile-first website live in 2–6 days — zero ongoing maintenance, zero hosting fees',
    description:
      'We build a fast, mobile-friendly static website for your business using AI-generated content and modern design. Pure static HTML means it loads in under 1 second on 4G, cannot break from plugin updates, and requires zero monthly hosting fees when deployed on Cloudflare Pages or Netlify.',
    category: 'Web & Digital Presence',
    icon: 'Globe',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    badge: 'Zero Maintenance',
    display_order: 3,
    benefits: [
      'Sub-second load times on mobile 4G/5G — no WordPress slowness',
      'One link to share on WhatsApp, Instagram, visiting cards and Google Maps',
      'Floating WhatsApp button converts visitors to enquiries instantly',
      'Zero ongoing hosting cost when deployed to Cloudflare Pages or Netlify'
    ],
    pipeline: '📝 5-question WhatsApp form → 🤖 LLM AST HTML generator → 🌐 Cloudflare Pages deployment in 15s',
    tiers: [
      {
        tier_name: 'starter',
        display_name: 'Starter',
        price_min: 1999,
        price_max: 1999,
        delivery_hours_min: 48,
        delivery_hours_max: 96,
        delivery_days_min: 2,
        delivery_days_max: 4,
        revisions_included: 1,
        deliverable_summary: '1-page express landing page, WhatsApp button, mobile-first, Cloudflare deployment, 1 revision',
        inclusions: [
          '1-page express mobile-first landing page',
          'Hero Banner + About + Services Grid + Google Maps',
          'Floating WhatsApp Chat button (wa.me direct link)',
          'AI-crafted business copywriting',
          'Free Cloudflare Pages deployment + ownership transfer',
          '1 revision included'
        ],
        exclusions: ['Domain registration fees (customer-paid)', 'Multi-page site', 'Contact form backend']
      },
      {
        tier_name: 'pro',
        display_name: 'Pro',
        price_min: 3499,
        price_max: 3499,
        delivery_hours_min: 96,
        delivery_hours_max: 144,
        delivery_days_min: 4,
        delivery_days_max: 6,
        revisions_included: 2,
        deliverable_summary: 'Full 5-page static site, lead form, SEO meta, Analytics, Netlify transfer, 2 revisions',
        inclusions: [
          'Full 5-page static website (index, about, services, portfolio, contact)',
          'Responsive Vanilla CSS design — no frameworks to break',
          'Serverless lead contact form (email notification via Formspree)',
          'On-page local SEO meta tags & Google Analytics setup',
          'Complete ZIP handover + Cloudflare/Netlify ownership transfer',
          '2 revisions included'
        ],
        exclusions: ['Domain registration fees (customer-paid)', 'E-commerce cart', 'CMS / WordPress']
      }
    ]
  },
  {
    slug: 'ai-logo-identity-kit',
    title: 'Logo Design & Indian SMB Identity Kit',
    tagline: 'Professional logo, visiting card & GST invoice template in 2–6 days',
    description:
      'We design a professional logo for your business using AI and deliver it in formats ready for digital use and physical print — visiting cards, GST invoices, WhatsApp DP, letterheads, shop banners and flex printing. Everything your new or growing Indian business needs to look credible from day one.',
    category: 'Branding & Print',
    icon: 'Palette',
    image_url: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=800',
    badge: 'New Business Essential',
    display_order: 4,
    benefits: [
      'Looks professional and credible from day one — builds customer trust instantly',
      'Print-ready for visiting cards, shop banners, flex printing and GST invoices',
      'Full commercial copyright ownership — legally yours forever',
      'Works for both digital (WhatsApp, Instagram) and physical print (Tally, Vyapar, Zoho Books)'
    ],
    pipeline: '🎨 Recraft V3 logo generation → Vectorizer.ai SVG cleanup → 📄 Puppeteer PDF invoice/card render',
    tiers: [
      {
        tier_name: 'starter',
        display_name: 'Starter',
        price_min: 1499,
        price_max: 1499,
        delivery_hours_min: 48,
        delivery_hours_max: 96,
        delivery_days_min: 2,
        delivery_days_max: 4,
        revisions_included: 1,
        deliverable_summary: 'Primary vector SVG logo, transparent PNG (light & dark), WhatsApp DP, full copyright transfer',
        inclusions: [
          'Primary logo in vector SVG (infinitely scalable for shop banners)',
          'High-resolution transparent PNG — light & dark background versions',
          'Circular-cropped WhatsApp DP & Social Media Profile Avatar',
          'Full commercial copyright ownership transfer',
          '1 revision included'
        ],
        exclusions: ['Visiting card print file', 'GST invoice template', 'Brand guide']
      },
      {
        tier_name: 'pro',
        display_name: 'Pro',
        price_min: 3499,
        price_max: 3499,
        delivery_hours_min: 96,
        delivery_hours_max: 144,
        delivery_days_min: 4,
        delivery_days_max: 6,
        revisions_included: 2,
        deliverable_summary: 'Full logo kit + print-ready visiting card (CMYK 300 DPI) + GST invoice + letterhead + brand guide',
        inclusions: [
          'Everything in Starter PLUS:',
          'Print-ready Visiting Card (3.5" × 2" Indian standard, bleed, CMYK 300 DPI PDF)',
          'A4 GST Tax Invoice & Bill Header template (Tally / Vyapar / Zoho Books ready)',
          'Official Letterhead template (Word & PDF)',
          'Mini Brand Guide (HEX color palette & font pairings)',
          '2 revisions included'
        ],
        exclusions: ['Physical card printing costs (customer-paid)', 'Animation or motion graphics']
      }
    ]
  }
];

// Validate catalog integrity on startup
FALLBACK_PACKAGES.forEach((pkg) => {
  try {
    validatePackage(pkg);
  } catch (e) {
    console.error(`❌ [ServicePackages] Catalog validation failed: ${e.message}`);
  }
});

// ─────────────────────────────────────────────────────────
// CHILD: ServicePackagesService
// ─────────────────────────────────────────────────────────
class ServicePackagesService {
  /**
   * Normalise a raw package record (DB or fallback) so tiers always use
   * the binary 'starter' | 'pro' naming convention.
   */
  normalisePackage(pkg) {
    if (!pkg) return null;
    return {
      ...pkg,
      tiers: (pkg.tiers || []).map((t) => ({
        ...t,
        tier_name: resolveTierAlias(t.tier_name),
        display_name: t.display_name || (resolveTierAlias(t.tier_name) === 'starter' ? 'Starter' : 'Pro'),
      }))
    };
  }

  async getAllPackages() {
    try {
      const { data, error } = await supabase
        .from('aitag_service_packages')
        .select('*, tiers:aitag_service_tiers(*)')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((p) => this.normalisePackage(p));
      }
    } catch (e) {
      console.warn('⚠️ [ServicePackages] Supabase getAllPackages fallback:', e.message);
    }

    return FALLBACK_PACKAGES.map((p) => this.normalisePackage(p));
  }

  async getPackageBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('aitag_service_packages')
        .select('*, tiers:aitag_service_tiers(*)')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        return this.normalisePackage(data);
      }
    } catch (e) {
      console.warn(`⚠️ [ServicePackages] Supabase getPackageBySlug fallback for ${slug}:`, e.message);
    }

    const found = FALLBACK_PACKAGES.find((p) => p.slug === slug);
    return found ? this.normalisePackage(found) : null;
  }

  /**
   * Resolve tier details from a package + tier name (supports binary aliases)
   */
  resolveTier(pkg, requestedTierName) {
    const canonical = resolveTierAlias(requestedTierName);
    return (pkg.tiers || []).find((t) => t.tier_name === canonical) || pkg.tiers?.[0] || null;
  }

  /**
   * Expose the tier alias resolver as a static util for other modules
   */
  resolveAlias(tierName) {
    return resolveTierAlias(tierName);
  }

  /**
   * Return the full catalog including pipeline blueprints and benefits
   */
  getCatalog() {
    return FALLBACK_PACKAGES;
  }
}

module.exports = new ServicePackagesService();
