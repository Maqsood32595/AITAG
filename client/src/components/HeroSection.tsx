import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Container, Chip,
  Paper, Stack, Grid
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

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
        pt: { xs: 12, md: 14 },
        pb: { xs: 6, md: 8 },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 4, md: 5, lg: 6 },
            width: '100%',
          }}
        >
          {/* Left Column: Eyebrow, Main Headline, Subtitle, CTAs & Audience Pills */}
          <Box
            sx={{
              flex: { xs: '1 1 100%', md: '0 0 55%', lg: '0 0 56%' },
              maxWidth: { xs: '100%', md: '55%', lg: '56%' },
              width: '100%',
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            {/* Pill Tag */}
            <Box sx={{ mb: 2.2, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Chip
                icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important', color: '#4f46e5 !important' }} />}
                label="✦ THE AI SERVICES MARKETPLACE FOR EVERYDAY ENTREPRENEURS"
                sx={{
                  bgcolor: 'rgba(79,70,229,0.07)',
                  color: '#4f46e5',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  letterSpacing: '0.5px',
                  border: '1px solid rgba(79,70,229,0.2)',
                  borderRadius: '20px',
                  px: 1,
                  height: 30,
                }}
              />
            </Box>

            {/* Headline */}
            <Typography
              variant="h1"
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 900,
                fontSize: { xs: '2rem', sm: '2.4rem', md: '2.75rem', lg: '2.9rem' },
                lineHeight: 1.14,
                letterSpacing: '-1px',
                color: '#0f172a',
                mb: 2,
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
                fontSize: { xs: '0.92rem', md: '0.98rem' },
                color: '#475569',
                mb: 2.5,
                lineHeight: 1.6,
                fontFamily: 'Inter, sans-serif',
                maxWidth: 540,
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
                mb: 2,
              }}
            >
              <Button
                variant="contained"
                size="large"
                href="https://wa.me/919886031643?text=Hi%20AITAG%2C%20I%20want%20to%20discuss%20an%20AI%20service%20for%20my%20business"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<WhatsAppIcon />}
                sx={{
                  bgcolor: '#22c55e',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: '24px',
                  px: 3.2,
                  py: 1.3,
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
                gap: 1.2,
                bgcolor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '100px',
                px: 2,
                py: 0.8,
                mb: 3.5,
                maxWidth: '100%',
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: '#16a34a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                ✓
              </Box>
              <Typography sx={{ color: '#166534', fontSize: '0.78rem', fontWeight: 600, textAlign: 'left', lineHeight: 1.35 }}>
                <strong>100% Payment Protection:</strong> Your money stays safe with AITAG. The expert is paid only after your work is delivered to you.
              </Typography>
            </Box>

            {/* Audience Tags: MADE FOR */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontWeight: 800,
                  letterSpacing: '0.8px',
                  display: 'block',
                  mb: 1.2,
                  textTransform: 'uppercase',
                  fontSize: '0.72rem',
                }}
              >
                MADE FOR:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
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
                      fontSize: '0.78rem',
                      py: 1.5,
                      px: 1,
                      borderRadius: '16px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s ease',
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
          </Box>

          {/* Right Column: "How it works — 3 simple steps" Card */}
          <Box
            id="how-it-works"
            sx={{
              flex: { xs: '1 1 100%', md: '0 0 42%', lg: '0 0 41%' },
              maxWidth: { xs: '100%', md: '42%', lg: '41%' },
              width: '100%',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                bgcolor: '#ffffff',
                borderRadius: '24px',
                p: { xs: 3, sm: 3.5 },
                border: '1px solid rgba(79,70,229,0.14)',
                boxShadow: '0 20px 45px rgba(79,70,229,0.07)',
                position: 'relative',
              }}
            >
              {/* Card Header */}
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    color: '#0f172a',
                    fontFamily: 'Inter, sans-serif',
                    mb: 0.5,
                  }}
                >
                  How it works — 3 simple steps
                </Typography>
                <Typography sx={{ fontSize: '0.84rem', color: '#64748b' }}>
                  No apps to learn. No tech skills needed.
                </Typography>
              </Box>

              {/* 3 Step Items */}
              <Stack spacing={1.8} sx={{ mb: 3 }}>
                {/* Step 1 */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.8,
                    p: 1.5,
                    borderRadius: '14px',
                    bgcolor: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      bgcolor: '#3b82f6',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      flexShrink: 0,
                      mt: 0.2,
                    }}
                  >
                    1
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
                      Tell us what you need
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mt: 0.2 }}>
                      Fill a short form or just send a WhatsApp message
                    </Typography>
                  </Box>
                </Box>

                {/* Step 2 */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.8,
                    p: 1.5,
                    borderRadius: '14px',
                    bgcolor: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      bgcolor: '#3b82f6',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      flexShrink: 0,
                      mt: 0.2,
                    }}
                  >
                    2
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
                      We match you with an AI expert
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mt: 0.2 }}>
                      A verified expert picked for your type of work
                    </Typography>
                  </Box>
                </Box>

                {/* Step 3 */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.8,
                    p: 1.5,
                    borderRadius: '14px',
                    bgcolor: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      bgcolor: '#3b82f6',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      flexShrink: 0,
                      mt: 0.2,
                    }}
                  >
                    3
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
                      Get your finished work
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mt: 0.2 }}>
                      Quality-checked by AITAG, ready to use
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              {/* Bottom 3 Summary Boxes */}
              <Grid container spacing={1.2}>
                <Grid size={{ xs: 4 }}>
                  <Box
                    sx={{
                      p: 1.2,
                      textAlign: 'center',
                      borderRadius: '12px',
                      bgcolor: '#ecfdf5',
                      border: '1px solid #d1fae5',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: '#059669', mb: 0.2 }}>
                      Lower cost
                    </Typography>
                    <Typography sx={{ fontSize: '0.66rem', color: '#64748b', lineHeight: 1.2 }}>
                      than traditional agencies
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Box
                    sx={{
                      p: 1.2,
                      textAlign: 'center',
                      borderRadius: '12px',
                      bgcolor: '#eff6ff',
                      border: '1px solid #dbeafe',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: '#2563eb', mb: 0.2 }}>
                      Faster
                    </Typography>
                    <Typography sx={{ fontSize: '0.66rem', color: '#64748b', lineHeight: 1.2 }}>
                      delivery
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Box
                    sx={{
                      p: 1.2,
                      textAlign: 'center',
                      borderRadius: '12px',
                      bgcolor: '#faf5ff',
                      border: '1px solid #f3e8ff',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: '#7c3aed', mb: 0.2 }}>
                      Safe payment
                    </Typography>
                    <Typography sx={{ fontSize: '0.66rem', color: '#64748b', lineHeight: 1.2 }}>
                      released after delivery
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
