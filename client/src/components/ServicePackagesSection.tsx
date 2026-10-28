import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Paper, Tabs, Tab,
  Button, Chip, Stack, List, ListItem, ListItemIcon, ListItemText,
  CircularProgress, Alert, Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import BoltIcon from '@mui/icons-material/Bolt';
import ReplayIcon from '@mui/icons-material/Replay';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LanguageIcon from '@mui/icons-material/Language';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import PaletteIcon from '@mui/icons-material/Palette';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { servicePackagesApi } from '../api';
import OrderBriefModal from './OrderBriefModal';

const FALLBACK_PACKAGES = [
  {
    slug: 'ai-product-photo-makeover',
    title: 'AI Product Photo Makeover',
    tagline: 'Studio-grade marketplace photos from your phone in 2–4 days',
    description:
      'Send us simple photos of your products taken on your phone. We use AI to remove messy backgrounds, fix lighting, add realistic contact shadows and professional settings. Marketplace-ready for Amazon, Flipkart, Meesho, Instagram or WhatsApp catalogue — no studio or photographer needed.',
    category: 'Product Visuals',
    badge: 'Best Seller',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    benefits: [
      'Better photos get more clicks and more sales online',
      'Saves ₹15,000+ compared with a physical studio photoshoot',
      '100% marketplace-compliant: Amazon, Flipkart, Meesho, Myntra (zero listing rejections)'
    ],
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
        deliverable_summary: '10 product photos, pure white background RGB(255,255,255), 2000×2000px, 1 revision',
        inclusions: [
          '10 clean product photos',
          'Pure white background RGB(255,255,255) — marketplace compliant',
          'Realistic ambient contact shadow (no floating sticker look)',
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
          '2x feature/dimension callout infographics (reduces returns)',
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
    badge: 'High ROI',
    image_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800',
    benefits: [
      'Reels get 3–5× more reach than static posts on Instagram and Facebook',
      'Natural Indian AI voiceover builds instant trust with local audiences',
      'Alex Hormozi-style dynamic animated captions that stop the scroll'
    ],
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
          '2x 15–30s vertical promo reels (9:16 format)',
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
      'We build a fast, mobile-friendly static website for your business using AI-generated content and modern design. Pure static HTML means it loads in under 1 second on 4G, cannot break from plugin updates, and requires zero monthly hosting fees on Cloudflare Pages or Netlify.',
    category: 'Web & Digital Presence',
    badge: 'Zero Maintenance',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    benefits: [
      'Sub-second load times on mobile 4G/5G — no WordPress slowness',
      'One link to share on WhatsApp, Instagram, visiting cards and Google Maps',
      'Floating WhatsApp button converts visitors to enquiries instantly'
    ],
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
          'Responsive Vanilla CSS design — no plugins to break',
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
      'We design a professional logo for your business using AI and deliver it in formats ready for digital use and physical print — visiting cards, GST invoices, WhatsApp DP, letterheads, shop banners and flex printing. Everything your growing business needs to look credible from day one.',
    category: 'Branding & Print',
    badge: 'New Business Essential',
    image_url: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=800',
    benefits: [
      'Looks professional and credible from day one — builds customer trust instantly',
      'Print-ready for visiting cards, shop banners, flex printing and GST invoices',
      'Full commercial copyright ownership — legally yours forever'
    ],
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

export const ServicePackagesSection: React.FC = () => {
  const [packages, setPackages] = useState<any[]>(FALLBACK_PACKAGES);
  const [loading, setLoading] = useState(false);
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({
    'ai-product-photo-makeover': 'starter',
    'ai-marketing-video-reels': 'starter',
    'ai-website-landing-page': 'starter',
    'ai-logo-identity-kit': 'starter'
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [activePackage, setActivePackage] = useState<any>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const res = await servicePackagesApi.getAll();
        if (res.data?.success && res.data?.packages?.length > 0) {
          setPackages(res.data.packages);
        }
      } catch (err) {
        console.warn('Using fallback package catalogue:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleTierChange = (slug: string, newTier: string) => {
    setSelectedTiers((prev) => ({ ...prev, [slug]: newTier }));
  };

  const handleOpenModal = (pkg: any) => {
    setActivePackage(pkg);
    setModalOpen(true);
  };

  const getPackageIcon = (category: string) => {
    if (category.includes('Visual')) return <CameraAltIcon sx={{ color: '#0891b2' }} />;
    if (category.includes('Social') || category.includes('Video')) return <VideoCameraBackIcon sx={{ color: '#e11d48' }} />;
    if (category.includes('Branding') || category.includes('Print')) return <PaletteIcon sx={{ color: '#7c3aed' }} />;
    return <LanguageIcon sx={{ color: '#10b981' }} />;
  };

  return (
    <Box id="packages" sx={{ pt: 5, pb: 10, bgcolor: '#f8fafc', position: 'relative' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: 16, color: '#4f46e5 !important' }} />}
            label="PRODUCTIZED AI SERVICES FOR INDIAN SMBS"
            sx={{
              bgcolor: '#eef2ff',
              color: '#4338ca',
              fontWeight: 700,
              letterSpacing: '0.5px',
              fontSize: '0.75rem',
              mb: 2,
              px: 1
            }}
          />
          <Typography
            variant="h3"
            fontWeight={800}
            color="#0f172a"
            sx={{
              letterSpacing: '-1px',
              fontSize: { xs: '2rem', md: '2.5rem' },
              mb: 1.5,
              fontFamily: 'Inter, sans-serif'
            }}
          >
            Affordable AI Services for Everyday Entrepreneurs
          </Typography>
          <Typography
            variant="body1"
            fontWeight={500}
            color="#64748b"
            sx={{
              maxWidth: 720,
              mx: 'auto',
              fontSize: '1.05rem',
              lineHeight: 1.6
            }}
          >
            “You do not need to learn AI. Tell us what your business needs, and AITAG will connect you with vetted AI experts who deliver practical, reliable and affordable business outcomes — starting at just ₹1,499.”
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#4f46e5' }} />
          </Box>
        ) : (
          <Grid container spacing={4} alignItems="stretch">
            {packages.map((pkg) => {
              const currentTierKey = selectedTiers[pkg.slug] || (pkg.tiers?.[0]?.tier_name || 'starter');
              const currentTier = (pkg.tiers || []).find(
                (t: any) => t.tier_name.toLowerCase() === currentTierKey.toLowerCase()
              ) || pkg.tiers?.[0];

              const isPro = (currentTier?.tier_name || '').toLowerCase() === 'pro';
              const deliveryText = currentTier?.delivery_days_min && currentTier?.delivery_days_max
                ? `${currentTier.delivery_days_min}–${currentTier.delivery_days_max} Days Delivery`
                : (isPro ? '4–6 Days Delivery' : '2–4 Days Delivery');

              return (
                <Grid item xs={12} md={6} key={pkg.slug} sx={{ display: 'flex' }}>
                  <Paper
                    elevation={0}
                    onClick={() => handleOpenModal(pkg)}
                    sx={{
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden',
                      bgcolor: '#ffffff',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 20px 30px -10px rgba(79, 70, 229, 0.14)',
                        borderColor: '#a5b4fc'
                      }
                    }}
                  >
                    {/* Image Cover */}
                    <Box sx={{ position: 'relative', height: 200, width: '100%', bgcolor: '#0f172a', overflow: 'hidden' }}>
                      <img
                        src={pkg.image_url}
                        alt={pkg.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          bgcolor: 'rgba(15, 23, 42, 0.85)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: 2,
                          px: 1.5,
                          py: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75
                        }}
                      >
                        {getPackageIcon(pkg.category)}
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#ffffff', letterSpacing: 0.3 }}>
                          {pkg.category}
                        </Typography>
                      </Box>
                      {pkg.badge && (
                        <Chip
                          label={pkg.badge}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: '#4f46e5',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                          }}
                        />
                      )}
                    </Box>

                    {/* Card Content */}
                    <Box sx={{ p: { xs: 2.5, sm: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontWeight: 750, fontSize: '1rem', color: '#0f172a', mb: 0.5, lineHeight: 1.35, fontFamily: 'Inter, sans-serif' }}>
                        {pkg.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: '#64748b', mb: 1.5, lineHeight: 1.45, fontFamily: 'Inter, sans-serif' }}>
                        {pkg.tagline}
                      </Typography>

                      {/* Full Service Description */}
                      <Typography sx={{ fontSize: '0.8rem', color: '#334155', mb: 2, lineHeight: 1.5, bgcolor: '#f8fafc', p: 1.5, borderRadius: 2, border: '1px solid #f1f5f9', fontFamily: 'Inter, sans-serif' }}>
                        {pkg.description}
                      </Typography>

                      {/* How It Helps Your Business (Benefits) */}
                      {pkg.benefits && pkg.benefits.length > 0 && (
                        <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                            <TrendingUpIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#166534', letterSpacing: 0.5 }}>
                              HOW IT HELPS YOUR BUSINESS:
                            </Typography>
                          </Stack>
                          {pkg.benefits.map((b: string, idx: number) => (
                            <Stack direction="row" spacing={1} alignItems="flex-start" key={idx} sx={{ mb: 0.25 }}>
                              <Typography sx={{ color: '#16a34a', fontWeight: 900, fontSize: '0.72rem' }}>•</Typography>
                              <Typography sx={{ lineHeight: 1.45, fontWeight: 500, fontSize: '0.78rem', color: '#166534' }}>
                                {b}
                              </Typography>
                            </Stack>
                          ))}
                        </Box>
                      )}

                      {/* Tier Switcher Tabs (Starter / Pro) */}
                      <Box sx={{ borderBottom: '1px solid #e2e8f0', mb: 2 }} onClick={(e) => e.stopPropagation()}>
                        <Tabs
                          value={currentTierKey}
                          onChange={(_, val) => handleTierChange(pkg.slug, val)}
                          variant="fullWidth"
                          sx={{
                            minHeight: 36,
                            '& .MuiTab-root': {
                              minHeight: 36,
                              py: 0.5,
                              fontSize: '0.82rem',
                              fontWeight: 750,
                              textTransform: 'none',
                              color: '#64748b',
                              cursor: 'pointer',
                              '&.Mui-selected': { color: '#4f46e5' }
                            },
                            '& .MuiTabs-indicator': {
                              bgcolor: '#4f46e5',
                              height: 3,
                              borderRadius: 1.5
                            }
                          }}
                        >
                          {(pkg.tiers || []).map((t: any) => (
                            <Tab
                              key={t.tier_name}
                              label={t.display_name || (t.tier_name === 'starter' ? 'Starter' : 'Pro')}
                              value={t.tier_name}
                            />
                          ))}
                        </Tabs>
                      </Box>

                      {/* Pricing & Accurate Delivery Time Box */}
                      <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                          Transparent Fixed Price
                        </Typography>
                        <Stack direction="row" alignItems="baseline" spacing={1}>
                          <Typography sx={{ fontWeight: 850, color: '#10b981', fontSize: '1.25rem', lineHeight: 1.1 }}>
                            ₹{currentTier ? Number(currentTier.price_min).toLocaleString('en-IN') : '—'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                            (All-Inclusive Fixed Cost)
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            icon={<BoltIcon sx={{ fontSize: 13, color: '#0891b2 !important' }} />}
                            label={deliveryText}
                            size="small"
                            sx={{ bgcolor: '#ecfeff', color: '#0e7490', fontWeight: 700, fontSize: '0.68rem' }}
                          />
                          <Chip
                            icon={<ReplayIcon sx={{ fontSize: 13, color: '#10b981 !important' }} />}
                            label={`${currentTier?.revisions_included || 1} Revision Included`}
                            size="small"
                            sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: '0.68rem' }}
                          />
                        </Stack>
                      </Box>

                      <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

                      {/* Deliverable Summary */}
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b', mb: 1 }}>
                        {currentTier?.deliverable_summary}
                      </Typography>

                      {/* Inclusions List */}
                      <List dense sx={{ py: 0, mb: 2, flexGrow: 1 }}>
                        {(currentTier?.inclusions || []).map((inc: string, idx: number) => (
                          <ListItem key={idx} disableGutters sx={{ py: 0.25, alignItems: 'flex-start' }}>
                            <ListItemIcon sx={{ minWidth: 22, mt: 0.4 }}>
                              <CheckCircleIcon sx={{ fontSize: 15, color: '#10b981' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={inc}
                              primaryTypographyProps={{ color: '#334155', fontSize: '0.78rem', lineHeight: 1.4 }}
                            />
                          </ListItem>
                        ))}
                      </List>

                      {/* Out-of-Scope (Exclusions) Note */}
                      {(currentTier?.exclusions || []).length > 0 && (
                        <Box sx={{ bgcolor: '#f8fafc', p: 1.2, borderRadius: 2, mb: 2, border: '1px dashed #cbd5e1' }}>
                          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'block', mb: 0.5 }}>
                            Exclusions (Transparent Scope):
                          </Typography>
                          {currentTier.exclusions.map((exc: string, idx: number) => (
                            <Stack direction="row" spacing={0.5} alignItems="center" key={idx} sx={{ mb: 0.2 }}>
                              <CloseIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                              <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {exc}
                              </Typography>
                            </Stack>
                          ))}
                        </Box>
                      )}

                      {/* Request CTA Button */}
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(pkg);
                        }}
                        sx={{
                          bgcolor: '#4f46e5',
                          '&:hover': { bgcolor: '#4338ca' },
                          py: 1.2,
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          textTransform: 'none',
                          borderRadius: 2.5,
                          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                          mt: 'auto'
                        }}
                      >
                        Order {currentTier?.display_name || 'Starter'} Package • ₹{currentTier ? Number(currentTier.price_min).toLocaleString('en-IN') : '—'}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      {/* Brief Modal */}
      {activePackage && (
        <OrderBriefModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          selectedPackage={activePackage}
          selectedTier={selectedTiers[activePackage.slug] || 'starter'}
        />
      )}
    </Box>
  );
};

export default ServicePackagesSection;
