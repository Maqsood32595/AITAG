import React from 'react';
import { Box, Container, Typography, Grid, Link, Divider, Stack } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box sx={{ bgcolor: '#0f172a', color: '#f8fafc', pt: 8, pb: 4, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Brand Info */}
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <img src="/logo.png" alt="AITAG Logo" style={{ height: 160, objectFit: 'contain' }} />
            </Box>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 380, mb: 2 }}>
              Affordable AI-powered business services for everyday entrepreneurs. A trusted marketplace connecting small businesses with vetted experts who deliver practical business outcomes.
            </Typography>
            <Typography sx={{ color: '#818cf8', fontSize: '0.85rem', fontWeight: 600 }}>
              “You do not need to learn AI. Tell us what your business needs, and AITAG will connect you with experts who can deliver it.”
            </Typography>
          </Grid>

          {/* Pilot Packages */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography sx={{ fontWeight: 800, mb: 2.5, color: '#f8fafc', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
              Launch Packages
            </Typography>
            <Stack spacing={1.5}>
              <Link href="/#packages" underline="none" sx={{ color: '#94a3b8', fontSize: '0.9rem', '&:hover': { color: '#818cf8' } }}>
                AI Product Photo Makeover
              </Link>
              <Link href="/#packages" underline="none" sx={{ color: '#94a3b8', fontSize: '0.9rem', '&:hover': { color: '#818cf8' } }}>
                AI Social Media Content Pack
              </Link>
              <Link href="/#packages" underline="none" sx={{ color: '#94a3b8', fontSize: '0.9rem', '&:hover': { color: '#818cf8' } }}>
                AI Website Landing Page
              </Link>
              <Link href="/#packages" underline="none" sx={{ color: '#94a3b8', fontSize: '0.9rem', '&:hover': { color: '#818cf8' } }}>
                WhatsApp FAQ Automation
              </Link>
            </Stack>
          </Grid>

          {/* Who We Serve & Brand Pillars */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography sx={{ fontWeight: 800, mb: 2.5, color: '#f8fafc', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
              Core Pillars
            </Typography>
            <Stack spacing={1.5}>
              <Typography sx={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                <strong style={{ color: '#38bdf8' }}>SIMPLE:</strong> Clear packages and everyday language.
              </Typography>
              <Typography sx={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                <strong style={{ color: '#818cf8' }}>TRUSTED:</strong> Vetted providers and quality review.
              </Typography>
              <Typography sx={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                <strong style={{ color: '#34d399' }}>PRACTICAL:</strong> Ready-to-use business deliverables.
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} AITAG — Affordable AI Business Services. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" underline="none" sx={{ color: '#64748b', fontSize: '0.85rem', '&:hover': { color: '#fff' } }}>Privacy</Link>
            <Link href="#" underline="none" sx={{ color: '#64748b', fontSize: '0.85rem', '&:hover': { color: '#fff' } }}>Terms</Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
