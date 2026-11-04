import React from 'react';
import { Box, Container, Typography, Grid, Paper, Stack } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface CreateItem {
  id: string;
  badge: string;
  badgeBg: string;
  title: string;
  description: string;
  price: string;
  targetSlug: string;
}

const CREATE_ITEMS: CreateItem[] = [
  {
    id: 'logo-branding',
    badge: 'Aa',
    badgeBg: '#4f46e5',
    title: 'Logo & Branding',
    description: 'A professional logo, colours and look that makes your business stand out.',
    price: 'From ₹499',
    targetSlug: 'ai-logo-identity-kit',
  },
  {
    id: 'social-media-posts',
    badge: '#',
    badgeBg: '#4f46e5',
    title: 'Social Media Posts',
    description: 'Ready-to-post Instagram & WhatsApp designs, captions and reel ideas.',
    price: 'From ₹1,499',
    targetSlug: 'ai-marketing-video-reels',
  },
  {
    id: 'product-catalogue',
    badge: '▤',
    badgeBg: '#4f46e5',
    title: 'Product Catalogue',
    description: 'Better product photos and a neat catalogue to share with customers.',
    price: 'From ₹1,499',
    targetSlug: 'ai-product-photo-makeover',
  },
  {
    id: 'simple-website',
    badge: 'www',
    badgeBg: '#4f46e5',
    title: 'Simple Website',
    description: 'A one-page website with your services, contact and WhatsApp button.',
    price: 'From ₹1,999',
    targetSlug: 'ai-website-landing-page',
  },
];

interface WhatWeCreateSectionProps {
  onSelectPackage?: (slug: string) => void;
}

export const WhatWeCreateSection: React.FC<WhatWeCreateSectionProps> = ({ onSelectPackage }) => {
  const handleClick = (slug: string) => {
    if (onSelectPackage) {
      onSelectPackage(slug);
      return;
    }
    const el = document.getElementById(`package-${slug}`) || document.getElementById('packages');
    if (el) {
      const navOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Box sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 8 }, bgcolor: '#ffffff' }}>
      <Container maxWidth="lg">
        {/* Section Heading */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.45rem', sm: '1.7rem', md: '1.9rem' },
              color: '#0f172a',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '-0.6px',
              mb: 0.6,
            }}
          >
            What we can create for your business
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '0.88rem', md: '0.96rem' },
              color: '#64748b',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Pick a ready-made package or tell us something custom.
          </Typography>
        </Box>

        {/* 4 Cards Grid */}
        <Grid container spacing={2.5}>
          {CREATE_ITEMS.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                onClick={() => handleClick(item.targetSlug)}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  '&:hover': {
                    borderColor: '#4f46e5',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 28px rgba(79,70,229,0.1)',
                    '& .card-arrow': {
                      transform: 'translateX(4px)',
                      color: '#4f46e5',
                    },
                    '& .card-badge': {
                      transform: 'scale(1.05)',
                    },
                  },
                }}
              >
                <Box>
                  {/* Badge Icon */}
                  <Box
                    className="card-badge"
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: '10px',
                      bgcolor: item.badgeBg,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: item.badge === 'www' ? '0.75rem' : '1.05rem',
                      fontFamily: item.badge === 'www' ? 'Inter, sans-serif' : 'monospace',
                      mb: 2,
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    {item.badge}
                  </Box>

                  {/* Title */}
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      color: '#0f172a',
                      fontFamily: 'Inter, sans-serif',
                      mb: 1,
                    }}
                  >
                    {item.title}
                  </Typography>

                  {/* Description */}
                  <Typography
                    sx={{
                      fontSize: '0.84rem',
                      color: '#64748b',
                      lineHeight: 1.5,
                      fontFamily: 'Inter, sans-serif',
                      mb: 2.5,
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>

                {/* Price and Arrow */}
                <Box
                  sx={{
                    pt: 2,
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.98rem',
                      color: '#0f172a',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {item.price}
                  </Typography>
                  <ArrowForwardIcon
                    className="card-arrow"
                    sx={{
                      fontSize: 18,
                      color: '#94a3b8',
                      transition: 'all 0.2s ease',
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default WhatWeCreateSection;

