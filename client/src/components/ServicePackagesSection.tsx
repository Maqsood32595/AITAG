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
import { servicePackagesApi } from '../api';
import OrderBriefModal from './OrderBriefModal';

const FALLBACK_PACKAGES = [
  {
    slug: 'ai-product-photo-makeover',
    title: 'AI Product Photo Makeover',
    tagline: 'Transform phone photos into studio-grade e-commerce product listings',
    category: 'Product Visuals',
    badge: 'Best Seller',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
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
    category: 'Social & Marketing',
    badge: 'Popular',
    image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
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
    category: 'Web & Funnels',
    badge: 'High ROI',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
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
        exclusions: ['Domain and hosting charges (customer-owned)', 'Payment gateway integration']
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

export const ServicePackagesSection: React.FC = () => {
  const [packages, setPackages] = useState<any[]>(FALLBACK_PACKAGES);
  const [loading, setLoading] = useState(false);
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({
    'ai-product-photo-makeover': 'beginner',
    'ai-social-media-content-pack': 'beginner',
    'ai-website-landing-page': 'beginner'
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
    if (category.includes('Social')) return <ShareIcon sx={{ color: '#4f46e5' }} />;
    return <LanguageIcon sx={{ color: '#10b981' }} />;
  };

  return (
    <Box id="packages" sx={{ py: 10, bgcolor: '#f8fafc', position: 'relative' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: 16, color: '#4f46e5 !important' }} />}
            label="PILOT CATALOGUE — FIXED OUTCOMES & TRANSPARENT PRICING"
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
              fontSize: { xs: '2rem', md: '2.75rem' },
              mb: 2
            }}
          >
            Affordable AI Services for Everyday Entrepreneurs
          </Typography>
          <Typography
            variant="h6"
            fontWeight={500}
            color="#64748b"
            sx={{
              maxWidth: 720,
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.6
            }}
          >
            “You do not need to learn AI. Tell us what your business needs, and AITAG will connect you with vetted experts who deliver it.”
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#4f46e5' }} />
          </Box>
        ) : (
          <Grid container spacing={4} alignItems="stretch">
            {packages.map((pkg) => {
              const currentTierKey = selectedTiers[pkg.slug] || 'beginner';
              const currentTier = (pkg.tiers || []).find(
                (t: any) => t.tier_name.toLowerCase() === currentTierKey.toLowerCase()
              ) || pkg.tiers?.[0];

              return (
                <Grid item xs={12} md={4} key={pkg.slug} sx={{ display: 'flex' }}>
                  <Paper
                    elevation={0}
                    sx={{
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
                        boxShadow: '0 20px 30px -10px rgba(79, 70, 229, 0.12)',
                        borderColor: '#c7d2fe'
                      }
                    }}
                  >
                    {/* Image Cover */}
                    <Box sx={{ position: 'relative', height: 180, width: '100%', bgcolor: '#f1f5f9' }}>
                      <img
                        src={pkg.image_url}
                        alt={pkg.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                        <Typography variant="caption" fontWeight={700} color="#ffffff">
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
                            fontSize: '0.7rem'
                          }}
                        />
                      )}
                    </Box>

                    {/* Card Content */}
                    <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" fontWeight={800} color="#0f172a" gutterBottom>
                        {pkg.title}
                      </Typography>
                      <Typography variant="body2" color="#64748b" sx={{ minHeight: 40, mb: 2 }}>
                        {pkg.tagline}
                      </Typography>

                      {/* Tier Switcher Tabs */}
                      <Box sx={{ borderBottom: '1px solid #e2e8f0', mb: 2.5 }}>
                        <Tabs
                          value={currentTierKey}
                          onChange={(_, val) => handleTierChange(pkg.slug, val)}
                          variant="fullWidth"
                          sx={{
                            minHeight: 36,
                            '& .MuiTab-root': {
                              minHeight: 36,
                              py: 0.5,
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              color: '#64748b',
                              '&.Mui-selected': { color: '#4f46e5' }
                            },
                            '& .MuiTabs-indicator': {
                              bgcolor: '#4f46e5',
                              height: 3,
                              borderRadius: 1.5
                            }
                          }}
                        >
                          <Tab label="Beginner" value="beginner" />
                          <Tab label="Medium" value="medium" />
                          <Tab label="Expert" value="expert" />
                        </Tabs>
                      </Box>

                      {/* Pricing & Guarantee Box */}
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" alignItems="baseline" spacing={1}>
                          <Typography variant="h4" fontWeight={800} color="#0f172a">
                            ₹{currentTier ? Number(currentTier.price_min).toLocaleString('en-IN') : '—'}
                          </Typography>
                          {currentTier && currentTier.price_max > currentTier.price_min && (
                            <Typography variant="body2" color="#64748b">
                              – ₹{Number(currentTier.price_max).toLocaleString('en-IN')}
                            </Typography>
                          )}
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            icon={<BoltIcon sx={{ fontSize: 14, color: '#0891b2 !important' }} />}
                            label={`${currentTier?.delivery_days_min}–${currentTier?.delivery_days_max} Days Delivery`}
                            size="small"
                            sx={{ bgcolor: '#ecfeff', color: '#0e7490', fontWeight: 600, fontSize: '0.7rem' }}
                          />
                          <Chip
                            icon={<ReplayIcon sx={{ fontSize: 14, color: '#10b981 !important' }} />}
                            label={`${currentTier?.revisions_included} Revision Included`}
                            size="small"
                            sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 600, fontSize: '0.7rem' }}
                          />
                        </Stack>
                      </Box>

                      <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

                      {/* Deliverable Summary */}
                      <Typography variant="subtitle2" fontWeight={700} color="#1e293b" gutterBottom>
                        {currentTier?.deliverable_summary}
                      </Typography>

                      {/* Inclusions List */}
                      <List dense sx={{ py: 0, mb: 2, flexGrow: 1 }}>
                        {(currentTier?.inclusions || []).map((inc: string, idx: number) => (
                          <ListItem key={idx} disableGutters sx={{ py: 0.25, alignItems: 'flex-start' }}>
                            <ListItemIcon sx={{ minWidth: 24, mt: 0.5 }}>
                              <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={inc}
                              primaryTypographyProps={{ variant: 'body2', color: '#334155', fontSize: '0.825rem' }}
                            />
                          </ListItem>
                        ))}
                      </List>

                      {/* Out-of-Scope (Exclusions) Note */}
                      {(currentTier?.exclusions || []).length > 0 && (
                        <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 2, mb: 2.5, border: '1px dashed #cbd5e1' }}>
                          <Typography variant="caption" fontWeight={700} color="#64748b" display="block" gutterBottom>
                            Exclusions (Transparent Scope):
                          </Typography>
                          {currentTier.exclusions.map((exc: string, idx: number) => (
                            <Stack direction="row" spacing={0.5} alignItems="center" key={idx} sx={{ mb: 0.25 }}>
                              <CloseIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                              <Typography variant="caption" color="#64748b">
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
                        onClick={() => handleOpenModal(pkg)}
                        sx={{
                          mt: 'auto',
                          bgcolor: '#4f46e5',
                          '&:hover': { bgcolor: '#4338ca' },
                          py: 1.25,
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          borderRadius: 2
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
        selectedTier={activePackage ? selectedTiers[activePackage.slug] || 'beginner' : 'beginner'}
      />
    </Box>
  );
};

export default ServicePackagesSection;
