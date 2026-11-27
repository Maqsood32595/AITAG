import React from 'react';
import { Box, Container, Typography, Grid, Link, Divider, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <Box sx={{ bgcolor: '#0f172a', color: '#f8fafc', pt: 8, pb: 4, mt: 'auto' }}>
      <Container maxWidth={false} sx={{ maxWidth: 1280, mx: 'auto', width: '100%', px: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr auto 1fr' },
            gap: { xs: 4, md: 4 },
            mb: 4,
            alignItems: 'start',
          }}
        >
          {/* Brand Info */}
          <Box sx={{ justifySelf: 'start', maxWidth: 380 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#ffffff',
                px: 2.5,
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                mb: 2.5,
              }}
            >
              <img
                src="/images/aitag-logo.png?v=footer-aligned-v2"
                alt="AITAG — Find AI Skills, Get It Done"
                loading="lazy"
                decoding="async"
                style={{
                  height: 44,
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </Box>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 380, mb: 2 }}>
              Affordable AI-powered business services for everyday entrepreneurs. A trusted marketplace connecting small businesses with verified experts who deliver practical business outcomes.
            </Typography>
          </Box>

          {/* Pilot Packages - Positioned Center, Left Aligned Content */}
          <Box sx={{ justifySelf: { xs: 'start', md: 'center' } }}>
            <Typography sx={{ fontWeight: 800, mb: 2.5, color: '#f8fafc', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
              Launch Packages
            </Typography>
            <Stack spacing={1.5}>
              <Link href="/#packages" underline="none" sx={{ color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer !important', '&:hover': { color: '#818cf8' } }}>
                AI Product Photo Makeover
              </Link>
              <Link href="/#packages" underline="none" sx={{ color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer !important', '&:hover': { color: '#818cf8' } }}>
                Marketing Video & Promo Reels
              </Link>
              <Link href="/#packages" underline="none" sx={{ color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer !important', '&:hover': { color: '#818cf8' } }}>
                Fast Business Website & Landing Page
              </Link>
              <Link href="/#packages" underline="none" sx={{ color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer !important', '&:hover': { color: '#818cf8' } }}>
                Logo Design & Business Branding Kit
              </Link>
            </Stack>
          </Box>

          {/* Who We Serve & Brand Pillars - Positioned Far Right, Left Aligned Content */}
          <Box sx={{ justifySelf: { xs: 'start', md: 'end' }, maxWidth: 380 }}>
            <Typography sx={{ fontWeight: 800, mb: 2.5, color: '#f8fafc', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
              Our Promise
            </Typography>
            <Stack spacing={1.5}>
              <Typography sx={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                <strong style={{ color: '#38bdf8' }}>SIMPLE:</strong> Clear packages and everyday language.
              </Typography>
              <Typography sx={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                <strong style={{ color: '#818cf8' }}>TRUSTED:</strong> Verified specialists and quality review.
              </Typography>
              <Typography sx={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                <strong style={{ color: '#34d399' }}>PRACTICAL:</strong> Ready-to-use business results.
              </Typography>
              <Box sx={{ pt: 1 }}>
                <Link
                  component={RouterLink}
                  to="/contact"
                  underline="none"
                  sx={{
                    color: '#818cf8',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer !important',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    '&:hover': { color: '#a5b4fc', textDecoration: 'underline' }
                  }}
                >
                  Have questions? Contact Support →
                </Link>
              </Box>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} AITAG — Affordable AI Business Services. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link component={RouterLink} to="/how-to-become-an-expert" underline="none" sx={{ color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer !important', '&:hover': { color: '#818cf8' } }}>How to Become an Expert</Link>
            <Link component={RouterLink} to="/contact" underline="none" sx={{ color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer !important', '&:hover': { color: '#818cf8' } }}>Contact Us</Link>
            <Link component={RouterLink} to="/privacy" underline="none" sx={{ color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer !important', '&:hover': { color: '#818cf8' } }}>Privacy Policy</Link>
            <Link component={RouterLink} to="/terms" underline="none" sx={{ color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer !important', '&:hover': { color: '#818cf8' } }}>Terms of Service</Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
