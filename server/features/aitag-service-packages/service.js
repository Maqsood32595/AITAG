/**
 * AITAG Service Packages — Data Service
 * Reads packages & tiers from Supabase, with resilient fallback.
 */

const supabase = require('../../supabase');

// Default fallback data matching AITAG requirements
const FALLBACK_PACKAGES = [
  {
    slug: 'ai-product-photo-makeover',
    title: 'AI Product Photo Makeover',
    tagline: 'Transform phone photos into studio-grade e-commerce product listings',
    description: 'Turn basic smartphone photos into high-converting, professional studio images. Meets all marketplace requirements for Amazon, Flipkart, Meesho, and Shopify.',
    category: 'Product Visuals',
    icon: 'Camera',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    badge: 'Best Seller',
    display_order: 1,
    tiers: [
      {
        tier_name: 'beginner',
        price_min: 499,
        price_max: 999,
        delivery_days_min: 1,
        delivery_days_max: 2,
        revisions_included: 1,
        deliverable_summary: '5 studio cutout images with pure white background',
        inclusions: ['5 clean product photos', 'Pure white background', 'Standard marketplace size', '1 revision included'],
        exclusions: ['Lifestyle background scenes', 'Infographics or text overlays']
      },
      {
        tier_name: 'medium',
        price_min: 1499,
        price_max: 2999,
        delivery_days_min: 2,
        delivery_days_max: 3,
        revisions_included: 2,
        deliverable_summary: '15 photos with white background and AI lifestyle settings',
        inclusions: ['15 product photos (white & lifestyle)', '3 AI lifestyle background scenes', 'Optimized for Amazon/Flipkart/Shopify', '2 revisions included'],
        exclusions: ['3D model rendering', 'Packaging redesign']
      },
      {
        tier_name: 'expert',
        price_min: 3999,
        price_max: 7999,
        delivery_days_min: 3,
        delivery_days_max: 5,
        revisions_included: 2,
        deliverable_summary: '30 catalogue-ready images + promotional banner',
        inclusions: ['30 product photos (full catalogue)', 'Multi-angle scenes & closeups', '1 promotional graphic banner', 'Source files included', '2 revisions included'],
        exclusions: ['Physical studio shipping']
      }
    ]
  },
  {
    slug: 'ai-social-media-content-pack',
    title: 'AI Social Media Content Pack',
    tagline: 'A complete monthly social media calendar with branded graphics & copy',
    description: 'A ready-to-post monthly content pack designed for your brand. Includes graphics, captions, local festival creatives, and researched hashtag sets.',
    category: 'Social & Marketing',
    icon: 'Share2',
    image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    badge: 'Popular',
    display_order: 2,
    tiers: [
      {
        tier_name: 'beginner',
        price_min: 1999,
        price_max: 2999,
        delivery_days_min: 3,
        delivery_days_max: 4,
        revisions_included: 1,
        deliverable_summary: '12 graphics with captions and hashtags',
        inclusions: ['12 ready-to-post graphics', 'AI-written captions in English/Hindi', 'Researched hashtag sets', 'Canva editable link', '1 revision included'],
        exclusions: ['Video reels', 'Account management/daily posting']
      },
      {
        tier_name: 'medium',
        price_min: 2999,
        price_max: 4999,
        delivery_days_min: 4,
        delivery_days_max: 5,
        revisions_included: 2,
        deliverable_summary: '20 posts + 2 video reels + posting calendar',
        inclusions: ['20 posts (mix of product, tips, offers)', '2 AI video reel templates', 'Festival greeting creative', 'Monthly posting calendar schedule', '2 revisions included'],
        exclusions: ['Running paid ad campaigns']
      },
      {
        tier_name: 'expert',
        price_min: 5299,
        price_max: 9299,
        delivery_days_min: 5,
        delivery_days_max: 7,
        revisions_included: 2,
        deliverable_summary: 'Full month 30-post package + 4 reels + story templates',
        inclusions: ['30 daily posts for entire month', '4 short video reels with AI voiceover', 'Monthly strategy & theme guide', 'Story creatives included', '2 revisions included'],
        exclusions: ['Responding to customer DMs']
      }
    ]
  },
  {
    slug: 'ai-website-landing-page',
    title: 'AI Website Landing Page',
    tagline: 'High-converting one-page website designed to turn visitors into enquiries',
    description: 'A clean, fast, mobile-friendly landing page with AI-written copy, WhatsApp click-to-chat, contact form, and Google Maps pin to get direct customer inquiries.',
    category: 'Web & Funnels',
    icon: 'Globe',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    badge: 'High ROI',
    display_order: 3,
    tiers: [
      {
        tier_name: 'beginner',
        price_min: 2499,
        price_max: 4999,
        delivery_days_min: 4,
        delivery_days_max: 5,
        revisions_included: 1,
        deliverable_summary: '1-page website with 5 sections and direct WhatsApp CTA',
        inclusions: ['1-page mobile-friendly website', 'Up to 5 custom sections', 'WhatsApp click-to-chat & Call buttons', 'AI-crafted business copywriting', '1 revision included'],
        exclusions: ['Domain and hosting charges (paid by customer)', 'Payment gateway integration']
      },
      {
        tier_name: 'medium',
        price_min: 5999,
        price_max: 9999,
        delivery_days_min: 5,
        delivery_days_max: 7,
        revisions_included: 2,
        deliverable_summary: '8-section landing page with enquiry form and Google Maps',
        inclusions: ['Custom design with up to 8 sections', 'Lead capture enquiry form', 'Google Maps location embedding', 'Basic Google Search / SEO setup', 'Custom domain connection', '2 revisions included'],
        exclusions: ['Domain registration fees', 'Multi-page e-commerce cart']
      },
      {
        tier_name: 'expert',
        price_min: 14999,
        price_max: 24999,
        delivery_days_min: 7,
        delivery_days_max: 10,
        revisions_included: 2,
        deliverable_summary: 'Premium high-converting landing page with analytics & booking',
        inclusions: ['Premium bespoke conversion design', 'Payment link or booking integration', 'Visitor analytics tracking (Google Analytics)', 'Mobile speed optimization', '30 days post-launch support', '2 revisions included'],
        exclusions: ['Hosting/domain subscriptions (customer-owned)']
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

      // Map tiers to their packages
      return pkgs.map((pkg) => ({
        ...pkg,
        tiers: tiers
          .filter((t) => t.package_id === pkg.id)
          .sort((a, b) => {
            const order = { beginner: 1, medium: 2, expert: 3 };
            return (order[a.tier_name] || 0) - (order[b.tier_name] || 0);
          })
      }));
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
