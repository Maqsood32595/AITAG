import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Container, Chip,
  Paper, Stack, Grid, Divider
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BoltIcon from '@mui/icons-material/Bolt';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useAuth } from '../context/AuthContext';

const AUDIENCE_TAGS = [
  { icon: <HomeWorkIcon sx={{ fontSize: 16 }} />, label: 'Home Entrepreneurs' },
  { icon: <StorefrontIcon sx={{ fontSize: 16 }} />, label: 'Local Businesses & Boutiques' },
  { icon: <BusinessCenterIcon sx={{ fontSize: 16 }} />, label: 'Independent Professionals' },
  { icon: <RocketLaunchIcon sx={{ fontSize: 16 }} />, label: 'Early-Stage Founders' },
];

const BRAND_PILLARS = [
  {
    icon: <CheckCircleIcon />,
    title: 'SIMPLE',
    desc: 'Clear packages and everyday language. You do not need to learn AI or prompt engineering.',
    color: '#0891b2'
  },
  {
    icon: <VerifiedIcon />,
    title: 'TRUSTED',
    desc: 'Pre-vetted specialists, human quality check before handover, and safe milestone payment protection.',
    color: '#4f46e5'
  },
  {
    icon: <BoltIcon />,
    title: 'PRACTICAL',
    desc: 'Ready-to-use business outcomes: studio product photos, social content packs, and landing pages.',
    color: '#10b981'
  },
];

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [animatedIndex, setAnimatedIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedIndex(prev => (prev + 1) % AUDIENCE_TAGS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const scrollToPackages = () => {
    const el = document.getElementById('packages');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#packages');
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 40%, #f0f9ff 70%, #ecfdf5 100%)',
      }}
    >
      {/* Background ambient orbs */}
      <Box sx={{
        position: 'absolute', top: '10%', right: '5%',
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)',
        animation: 'pulse 4s ease-in-out infinite',
        '@keyframes pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
          '50%': { transform: 'scale(1.1)', opacity: 1 },
        }
      }} />
      <Box sx={{
        position: 'absolute', bottom: '15%', left: '2%',
        width: 360, height: 360, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(8,145,178,0.1) 0%, transparent 70%)',
        animation: 'pulse2 5s ease-in-out infinite',
        '@keyframes pulse2': {
          '0%, 100%': { transform: 'scale(1.1)', opacity: 0.6 },
          '50%': { transform: 'scale(1)', opacity: 1 },
        }
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: { xs: 14, md: 16 }, pb: 5, textAlign: 'center' }}>
        {/* Top Chip */}
        <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'center' }}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: '15px !important', color: '#4f46e5 !important' }} />}
            label="AFFORDABLE AI-POWERED BUSINESS SERVICES"
            sx={{
              bgcolor: 'rgba(79,70,229,0.08)',
              color: '#4f46e5',
              fontWeight: 800,
              fontSize: '0.78rem',
              letterSpacing: '0.5px',
              border: '1px solid rgba(79,70,229,0.2)',
              borderRadius: '20px',
              px: 1.5,
              height: 32,
            }}
          />
        </Box>

        {/* Headline */}
        <Typography
          variant="h1"
          sx={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 900,
            fontSize: { xs: '2.2rem', sm: '3rem', md: '3.6rem' },
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            color: '#0f172a',
            mb: 2,
            maxWidth: 920,
            mx: 'auto'
          }}
        >
          You Don't Need to Learn AI.{' '}
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: { xs: 'block', sm: 'inline-block' }
            }}
          >
            We Deliver the Outcomes.
          </Box>
        </Typography>

        {/* Sub-headline */}
        <Typography
          sx={{
            fontSize: { xs: '1.05rem', md: '1.18rem' },
            color: '#475569',
            mb: 3.5,
            lineHeight: 1.7,
            maxWidth: 780,
            mx: 'auto',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          A trusted AI services marketplace connecting everyday entrepreneurs and small businesses with vetted AI experts who deliver practical, reliable and affordable business outcomes — starting at just <strong style={{ color: '#0f172a', fontWeight: 800 }}>₹499</strong>.
        </Typography>

        {/* Who We Serve Tags */}
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', display: 'block', mb: 1.5, textTransform: 'uppercase' }}>
            Who We Serve:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', maxWidth: 840 }}>
            {AUDIENCE_TAGS.map((tag, i) => (
              <Chip
                key={tag.label}
                icon={tag.icon}
                label={tag.label}
                size="small"
                onClick={scrollToPackages}
                sx={{
                  cursor: 'pointer',
                  bgcolor: i === animatedIndex ? 'rgba(79,70,229,0.12)' : 'rgba(255,255,255,0.85)',
                  border: `1px solid ${i === animatedIndex ? 'rgba(79,70,229,0.4)' : 'rgba(0,0,0,0.08)'}`,
                  color: i === animatedIndex ? '#4f46e5' : '#475569',
                  fontWeight: i === animatedIndex ? 700 : 500,
                  fontSize: '0.8rem',
                  py: 2,
                  px: 0.5,
                  transition: 'all 0.3s ease',
                  transform: i === animatedIndex ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: i === animatedIndex ? '0 4px 12px rgba(79,70,229,0.15)' : 'none',
                  '&:hover': {
                    bgcolor: 'rgba(79,70,229,0.15)',
                    borderColor: '#4f46e5',
                    transform: 'translateY(-2px)'
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* CTA Buttons — Strictly Centered */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            width: '100%',
            mx: 'auto',
            mb: 7
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={scrollToPackages}
            sx={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
              fontWeight: 800,
              borderRadius: '12px',
              px: 4,
              py: 1.75,
              fontSize: '1rem',
              boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
              '&:hover': {
                boxShadow: '0 12px 32px rgba(79,70,229,0.45)',
                transform: 'translateY(-2px)'
              },
            }}
          >
            ✨ Explore AI Packages (From ₹499) →
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={scrollToPackages}
            sx={{
              borderColor: 'rgba(79,70,229,0.35)',
              color: '#4f46e5',
              fontWeight: 700,
              borderRadius: '12px',
              px: 3.5,
              py: 1.75,
              fontSize: '1rem',
              bgcolor: 'rgba(255,255,255,0.7)',
              '&:hover': {
                borderColor: '#4f46e5',
                bgcolor: 'rgba(79,70,229,0.04)',
                transform: 'translateY(-2px)'
              },
            }}
          >
            How It Works
          </Button>
        </Box>

        {/* The 3 Brand Pillars (The AITAG Difference) — Smaller Horizontally & Centered */}
        <Box
          sx={{
            maxWidth: 520,
            mx: 'auto',
            bgcolor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            p: { xs: 2.5, sm: 3 },
            border: '1px solid rgba(79,70,229,0.12)',
            boxShadow: '0 20px 60px rgba(79,70,229,0.08)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 0.75 }}>
              <AutoAwesomeIcon sx={{ color: '#4f46e5', fontSize: 18 }} />
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  color: '#0f172a',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                The AITAG Difference
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontSize: '0.85rem',
                color: '#64748b',
                maxWidth: 480,
                mx: 'auto',
                lineHeight: 1.5
              }}
            >
              Built specifically for everyday entrepreneurs — clear packages, vetted specialists, and real business deliverables.
            </Typography>
          </Box>

          <Stack spacing={2} sx={{ mb: 2.5 }}>
            {BRAND_PILLARS.map((item) => (
              <Box
                key={item.title}
                onClick={scrollToPackages}
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2.2,
                  borderRadius: '16px',
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: item.color,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '12px',
                    bgcolor: `${item.color}15`,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: '#0f172a',
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '0.5px',
                    mb: 0.5,
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.82rem',
                    color: '#64748b',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.5,
                    maxWidth: 460
                  }}
                >
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Highlight Quote */}
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: '#4338ca',
              fontWeight: 700,
              textAlign: 'center',
              fontFamily: 'Inter, sans-serif',
              bgcolor: '#eef2ff',
              p: 1.4,
              borderRadius: '10px',
              border: '1px solid #e0e7ff',
              maxWidth: 520,
              mx: 'auto'
            }}
          >
            “Tell us what your business needs. AITAG experts deliver it.”
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
