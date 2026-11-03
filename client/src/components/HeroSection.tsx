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
import { useAuth } from '../context/AuthContext';

const AUDIENCE_TAGS = [
  { label: 'Home Entrepreneurs' },
  { label: 'Local Businesses & Boutiques' },
  { label: 'Independent Professionals' },
  { label: 'Early-Stage Founders' },
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

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: { xs: 12, md: 14 }, pb: { xs: 6, md: 8 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 4, md: 4, lg: 5 },
            width: '100%',
          }}
        >
          {/* Left Column: Headline, Hook, Tags & CTAs */}
          <Box
            sx={{
              flex: { xs: '1 1 100%', md: '0 0 56%', lg: '0 0 57%' },
              maxWidth: { xs: '100%', md: '56%', lg: '57%' },
              width: { xs: '100%', md: '56%', lg: '57%' },
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            {/* Top Chip */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
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
                fontSize: { xs: '2.1rem', sm: '2.6rem', md: '2.9rem' },
                lineHeight: 1.15,
                letterSpacing: '-1.5px',
                color: '#0f172a',
                mb: 2,
              }}
            >
              You Don't Need to Learn AI.{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'block', sm: 'inline-block' },
                }}
              >
                Connect with Vetted AI Experts.
              </Box>
            </Typography>

            {/* Sub-headline */}
            <Typography
              sx={{
                fontSize: { xs: '1rem', md: '1.08rem' },
                color: '#475569',
                mb: 3,
                lineHeight: 1.65,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              A trusted AI services marketplace connecting everyday entrepreneurs and small businesses with vetted AI experts who deliver practical, reliable and affordable business outcomes — starting at just <strong style={{ color: '#0f172a', fontWeight: 800 }}>₹499</strong>.
            </Typography>

            {/* Who We Serve Tags */}
            <Box sx={{ mb: 3.5 }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  display: 'block',
                  mb: 1.2,
                  textTransform: 'uppercase',
                }}
              >
                Who We Serve:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                {AUDIENCE_TAGS.map((tag, i) => (
                  <Chip
                    key={tag.label}
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
                      py: 1.8,
                      px: 1.2,
                      transition: 'all 0.3s ease',
                      transform: i === animatedIndex ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: i === animatedIndex ? '0 4px 12px rgba(79,70,229,0.15)' : 'none',
                      '&:hover': {
                        bgcolor: 'rgba(79,70,229,0.15)',
                        borderColor: '#4f46e5',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* CTA Buttons */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'center', md: 'flex-start' },
                alignItems: 'center',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
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
                  px: 3.5,
                  py: 1.6,
                  fontSize: '0.98rem',
                  boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
                  '&:hover': {
                    boxShadow: '0 12px 32px rgba(79,70,229,0.45)',
                    transform: 'translateY(-2px)',
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
                  px: 3,
                  py: 1.6,
                  fontSize: '0.98rem',
                  bgcolor: 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    borderColor: '#4f46e5',
                    bgcolor: 'rgba(79,70,229,0.04)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                How It Works
              </Button>
            </Box>
          </Box>

          {/* Right Column: The 3 Brand Pillars (The AITAG Difference) */}
          <Box
            sx={{
              flex: { xs: '1 1 100%', md: '0 0 42%', lg: '0 0 41%' },
              maxWidth: { xs: '100%', md: '42%', lg: '41%' },
              width: '100%',
            }}
          >
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                p: { xs: 2.5, sm: 3 },
                border: '1px solid rgba(79,70,229,0.15)',
                boxShadow: '0 20px 50px rgba(79,70,229,0.08)',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 0.5 }}>
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
                    fontSize: '0.82rem',
                    color: '#64748b',
                    lineHeight: 1.5,
                  }}
                >
                  Built for everyday businesses — clear packages, vetted specialists, and real outcomes.
                </Typography>
              </Box>

              <Stack spacing={1.5} sx={{ mb: 2 }}>
                {BRAND_PILLARS.map((item) => (
                  <Box
                    key={item.title}
                    onClick={scrollToPackages}
                    sx={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      p: 1.8,
                      borderRadius: '14px',
                      bgcolor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: item.color,
                        boxShadow: '0 6px 16px rgba(0,0,0,0.04)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        bgcolor: `${item.color}15`,
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.2,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          color: '#0f172a',
                          fontFamily: 'Inter, sans-serif',
                          letterSpacing: '0.3px',
                          mb: 0.3,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.78rem',
                          color: '#64748b',
                          fontFamily: 'Inter, sans-serif',
                          lineHeight: 1.45,
                        }}
                      >
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>

              {/* Highlight Quote */}
              <Typography
                sx={{
                  fontSize: '0.82rem',
                  color: '#4338ca',
                  fontWeight: 700,
                  textAlign: 'center',
                  fontFamily: 'Inter, sans-serif',
                  bgcolor: '#eef2ff',
                  p: 1.2,
                  borderRadius: '10px',
                  border: '1px solid #e0e7ff',
                }}
              >
                “Tell us what your business needs. AITAG experts deliver it.”
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
