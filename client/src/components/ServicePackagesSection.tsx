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
import ShareIcon from '@mui/icons-material/Share';
import LanguageIcon from '@mui/icons-material/Language';
import EditNoteIcon from '@mui/icons-material/EditNote';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { servicePackagesApi } from '../api';
import OrderBriefModal from './OrderBriefModal';

const FALLBACK_PACKAGES = [
  {
    slug: 'ai-product-photo-makeover',
    title: 'AI Product Photo Makeover',
    tagline: 'Transform phone photos into studio-grade e-commerce product listings',
    description: "Send us simple photos of your products taken on your phone. We'll use AI to remove messy backgrounds, fix the lighting and colours, and place your products in clean, professional settings. Your photos will be ready for Amazon, Flipkart, Meesho, Instagram or your WhatsApp catalogue. You don't need a studio or a photographer.",
    category: 'Product Visuals',
    badge: 'Best Seller',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
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
    description: "Tell us about your product. We'll write clear, attractive titles, descriptions and key features that help customers find it and decide to buy. We can write in English, Hindi or your regional language, for Amazon, Flipkart, Meesho, your website or WhatsApp.",
    category: 'E-Commerce & Copy',
    badge: 'Starts at ₹999',
    image_url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800',
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
    description: "We'll create a month of ready-to-post content for your Instagram, Facebook or WhatsApp Status. That includes eye-catching designs, catchy captions and the right hashtags, all matched to your business and festival dates. You just post, or we can give you a calendar telling you what to post and when.",
    category: 'Social & Marketing',
    badge: 'Popular',
    image_url: '/images/packages/nt-text-logo.png',
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
    description: "Need a simple website for your business? We'll build a one-page website that tells customers who you are, what you sell, your prices or offers, and how to contact you. It works well on mobile phones and has a WhatsApp or call button, so customers can reach you in one tap. AI helps us write the text and design it quickly, so you get it faster and at a lower cost.",
    category: 'Web & Funnels',
    badge: 'High ROI',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
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
  }
];

export const ServicePackagesSection: React.FC = () => {
  const [packages, setPackages] = useState<any[]>(FALLBACK_PACKAGES);
  const [loading, setLoading] = useState(false);
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({
    'ai-product-photo-makeover': 'package_1',
    'ai-product-listing-description': 'package_1',
    'ai-social-media-content-pack': 'package_1',
    'ai-website-landing-page': 'package_1'
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [activePackage, setActivePackage] = useState<any>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const res = await servicePackagesApi.getAll();
        if (res.data?.success && res.data?.packages?.length > 0) {
          // Normalize tiers so package_1, package_2, package_3 are consistent
          const normalized = res.data.packages.map((pkg: any) => ({
            ...pkg,
            tiers: (pkg.tiers || []).map((t: any) => {
              let tier_name = t.tier_name.toLowerCase();
              if (tier_name === 'beginner') tier_name = 'package_1';
              if (tier_name === 'medium') tier_name = 'package_2';
              if (tier_name === 'expert') tier_name = 'package_3';
              return { ...t, tier_name };
            })
          }));
          setPackages(normalized);
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
    if (category.includes('Copy') || category.includes('Commerce')) return <EditNoteIcon sx={{ color: '#d97706' }} />;
    if (category.includes('Social')) return <ShareIcon sx={{ color: '#4f46e5' }} />;
    if (category.includes('Video') || category.includes('Reels')) return <VideoCameraBackIcon sx={{ color: '#e11d48' }} />;
    return <LanguageIcon sx={{ color: '#10b981' }} />;
  };

  return (
    <Box id="packages" sx={{ pt: 5, pb: 10, bgcolor: '#f8fafc', position: 'relative' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: 16, color: '#4f46e5 !important' }} />}
            label="POPULAR BUSINESS PACKAGES"
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
            “You do not need to learn AI. Tell us what your business needs, and AITAG will connect you with vetted AI experts who deliver practical, reliable and affordable business outcomes — starting at just ₹999.”
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#4f46e5' }} />
          </Box>
        ) : (
          <Grid container spacing={4} alignItems="stretch">
            {packages.map((pkg) => {
              const currentTierKey = selectedTiers[pkg.slug] || 'package_1';
              const currentTier = (pkg.tiers || []).find(
                (t: any) => t.tier_name.toLowerCase() === currentTierKey.toLowerCase()
              ) || pkg.tiers?.[0];

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

                    {/* Card Content — Matching BrowseTasks Typography */}
                    <Box sx={{ p: { xs: 2.5, sm: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontWeight: 750, fontSize: '0.95rem', color: '#0f172a', mb: 0.5, lineHeight: 1.35, fontFamily: 'Inter, sans-serif' }}>
                        {pkg.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mb: 1.5, lineHeight: 1.45, fontFamily: 'Inter, sans-serif' }}>
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

                      {/* Tier Switcher Tabs (Package 1, Package 2, Package 3) */}
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
                              fontSize: '0.78rem',
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
                          <Tab label="Package 1" value="package_1" />
                          <Tab label="Package 2" value="package_2" />
                          <Tab label="Package 3" value="package_3" />
                        </Tabs>
                      </Box>

                      {/* Pricing & Accurate Delivery Time Box — Matching BrowseTasks Budget Size */}
                      <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                          Package Pricing
                        </Typography>
                        <Stack direction="row" alignItems="baseline" spacing={1}>
                          <Typography sx={{ fontWeight: 850, color: '#10b981', fontSize: '1.1rem', lineHeight: 1.1 }}>
                            ₹{currentTier ? Number(currentTier.price_min).toLocaleString('en-IN') : '—'}
                          </Typography>
                          {currentTier && currentTier.price_max > currentTier.price_min && (
                            <Typography sx={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                              – ₹{Number(currentTier.price_max).toLocaleString('en-IN')}
                            </Typography>
                          )}
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            icon={<BoltIcon sx={{ fontSize: 13, color: '#0891b2 !important' }} />}
                            label={`${currentTier?.delivery_days_min}–${currentTier?.delivery_days_max} Days Delivery`}
                            size="small"
                            sx={{ bgcolor: '#ecfeff', color: '#0e7490', fontWeight: 700, fontSize: '0.68rem' }}
                          />
                          <Chip
                            icon={<ReplayIcon sx={{ fontSize: 13, color: '#10b981 !important' }} />}
                            label={`${currentTier?.revisions_included} Revision Included`}
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
                          cursor: 'pointer',
                          mt: 'auto',
                          bgcolor: '#4f46e5',
                          '&:hover': { bgcolor: '#4338ca', transform: 'translateY(-1px)' },
                          py: 1,
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          borderRadius: 2.5,
                          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
                        }}
                      >
                        Request This Package
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      {/* Guided Order Brief Modal */}
      <OrderBriefModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedPackage={activePackage}
        selectedTier={activePackage ? selectedTiers[activePackage.slug] || 'package_1' : 'package_1'}
      />
    </Box>
  );
};

export default ServicePackagesSection;
