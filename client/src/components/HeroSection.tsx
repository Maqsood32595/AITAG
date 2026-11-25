import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Container, Chip
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HeroMediaSlot from '../features/hero-media/HeroMediaSlot';
import WorkflowStepsCard from './WorkflowStepsCard';

const WhatsAppIcon: React.FC<{ sx?: React.CSSProperties }> = ({ sx }) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="currentColor"
    style={{ ...sx }}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z" />
  </svg>
);

const AUDIENCE_TAGS = [
  'Home Entrepreneurs',
  'Local Shops & Boutiques',
  'Bakeries & Cafés',
  'Independent Professionals',
  'Early-Stage Founders',
  'Small and Medium Businesses',
];

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const scrollToPackages = () => {
    const el = document.getElementById('packages');
    if (el) {
      const navOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
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
        bgcolor: '#f8fafc',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 45%, #f0fdf4 100%)',
        pt: { xs: 10, md: 12.5 },
        pb: { xs: 6, md: 7 },
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1260,
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' },
            justifyContent: 'space-between',
            gap: { xs: 4, md: 3.5, lg: 4.5 },
            width: '100%',
          }}
        >
          {/* Left Column: Eyebrow, Main Headline, Subtitle, CTAs & Audience Pills */}
          <Box
            sx={{
              flex: { xs: '1 1 100%', md: '0 0 48.5%', lg: '0 0 48.5%' },
              maxWidth: { xs: '100%', md: '48.5%', lg: '48.5%' },
              width: '100%',
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            {/* Pill Tag */}
            <Box sx={{ mb: 1.8, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Chip
                icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important', color: '#4f46e5 !important' }} />}
                label="✦ THE AI SERVICES MARKETPLACE FOR EVERYDAY ENTREPRENEURS"
                sx={{
                  bgcolor: 'rgba(79,70,229,0.07)',
                  color: '#4f46e5',
                  fontWeight: 800,
                  fontSize: { xs: '0.68rem', sm: '0.74rem' },
                  letterSpacing: '0.4px',
                  border: '1px solid rgba(79,70,229,0.2)',
                  borderRadius: '20px',
                  px: 1,
                  py: 0.4,
                  height: 'auto',
                  minHeight: 30,
                  maxWidth: '100%',
                  '& .MuiChip-label': {
                    whiteSpace: 'normal',
                    textAlign: 'center',
                    lineHeight: 1.3,
                  },
                }}
              />
            </Box>

            {/* Headline */}
            <Typography
              variant="h1"
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 900,
                fontSize: { xs: '2rem', sm: '2.4rem', md: '2.6rem', lg: '2.85rem' },
                lineHeight: 1.14,
                letterSpacing: '-1px',
                color: '#0f172a',
                mb: 1.8,
              }}
            >
              You Don't Need to
              <br />
              Learn AI.
              <br />
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                We'll Do It For You.
              </Box>
            </Typography>

            {/* Sub-headline */}
            <Typography
              sx={{
                fontSize: { xs: '0.92rem', md: '0.96rem' },
                color: '#475569',
                mb: 2.2,
                lineHeight: 1.6,
                fontFamily: 'Inter, sans-serif',
                maxWidth: 550,
                mx: { xs: 'auto', md: 0 },
              }}
            >
              AITAG is an AI services marketplace. Tell us what you need — a logo, social media posts, a catalogue or a website. We tag you to a verified AI expert who delivers it using advanced AI tools: better quality, faster and at a lower cost. Starting at just <strong style={{ color: '#0f172a', fontWeight: 800 }}>₹499</strong>.
            </Typography>

            {/* Single WhatsApp Action Button */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'center', md: 'flex-start' },
                alignItems: 'center',
                mb: 1.8,
              }}
            >
              <Button
                variant="contained"
                size="large"
                href="https://wa.me/918431634113?text=Hi%20AITAG%2C%20I%20want%20to%20discuss%20an%20AI%20service%20for%20my%20business"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<WhatsAppIcon />}
                sx={{
                  bgcolor: '#22c55e',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: '24px',
                  px: 3.2,
                  py: 1.25,
                  fontSize: '0.92rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 20px rgba(34,197,94,0.25)',
                  '&:hover': {
                    bgcolor: '#16a34a',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 26px rgba(34,197,94,0.35)',
                  },
                }}
              >
                Chat on WhatsApp
              </Button>
            </Box>

            {/* 100% Payment Protection Pill Banner */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '100px',
                px: { xs: 1.8, md: 1.6 },
                py: 0.65,
                mb: { xs: 2.5, md: 0 },
                maxWidth: '100%',
              }}
            >
              <Box
                sx={{
                  width: 19,
                  height: 19,
                  borderRadius: '50%',
                  bgcolor: '#16a34a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10.5px',
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                ✔
              </Box>
              <Typography
                sx={{
                  color: '#166534',
                  fontSize: { xs: '0.76rem', md: '0.73rem', lg: '0.745rem' },
                  fontWeight: 600,
                  textAlign: 'left',
                  lineHeight: 1.35,
                }}
              >
                <strong>100% Payment Protection:</strong> Your money stays safe with AITAG. The expert is paid only after your work is delivered to you.
              </Typography>
            </Box>
          </Box>

          {/* Right Column: Fixed inline Hero video showcase on Desktop; Floating modal + 3-step card preserved on Mobile */}
          <Box
            id="hero-workflow-card"
            sx={{
              position: 'relative',
              flex: { xs: '1 1 100%', md: '0 0 48%', lg: '0 0 48%' },
              maxWidth: { xs: '100%', md: '48%', lg: '48%' },
              width: '100%',
            }}
          >
            <HeroMediaSlot
              fallback={
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <WorkflowStepsCard />
                </Box>
              }
            />
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <WorkflowStepsCard />
            </Box>
          </Box>
        </Box>

        {/* Audience Tags: MADE FOR (Full-width single line on desktop) */}
        <Box
          sx={{
            mt: { xs: 3.5, md: 4 },
            pt: { xs: 2, md: 2.5 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'center' },
            gap: { xs: 1.2, md: 1.5 },
            width: '100%',
            justifyContent: { xs: 'center', md: 'flex-start' },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              fontWeight: 800,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              fontSize: '0.72rem',
              flexShrink: 0,
            }}
          >
            MADE FOR:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              gap: { xs: 0.85, md: 1 },
              alignItems: 'center',
              justifyContent: { xs: 'center', md: 'flex-start' },
              width: '100%',
              overflowX: { xs: 'visible', md: 'auto' },
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {AUDIENCE_TAGS.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                onClick={scrollToPackages}
                sx={{
                  cursor: 'pointer',
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', md: '0.73rem', lg: '0.745rem' },
                  height: 'auto',
                  py: 0.55,
                  px: 0.4,
                  borderRadius: '16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  '& .MuiChip-label': {
                    px: 1.15,
                    lineHeight: 1.3,
                  },
                  '&:hover': {
                    bgcolor: 'rgba(79,70,229,0.08)',
                    borderColor: '#4f46e5',
                    color: '#4f46e5',
                    transform: 'translateY(-2px)',
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;

