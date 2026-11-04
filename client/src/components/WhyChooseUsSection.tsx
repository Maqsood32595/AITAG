import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';

interface ValueCard {
  icon: string;
  title: string;
  description: string;
}

const VALUE_CARDS: ValueCard[] = [
  {
    icon: '✓',
    title: 'No need to learn AI',
    description: 'You focus on your business. Our experts handle the AI tools.',
  },
  {
    icon: '₹',
    title: 'Save money',
    description: 'AI helps experts work faster, so you pay less than a traditional agency.',
  },
  {
    icon: '★',
    title: 'Verified experts',
    description: 'Every expert is checked, and every delivery is quality-reviewed.',
  },
  {
    icon: 'Hi',
    title: 'Simple language',
    description: 'No jargon. Talk to us in English, Hindi or Kannada.',
  },
];

export const WhyChooseUsSection: React.FC = () => {
  return (
    <Box sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 6, md: 8 }, bgcolor: '#f8fafc' }}>
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
            Why business owners choose AITAG
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '0.88rem', md: '0.96rem' },
              color: '#64748b',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Professional results, without the professional price tag.
          </Typography>
        </Box>

        {/* 4 Dark Navy Cards */}
        <Grid container spacing={2.5}>
          {VALUE_CARDS.map((card, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.8, md: 3.2 },
                  borderRadius: '16px',
                  bgcolor: '#1e1b4b',
                  background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 36px rgba(15,23,42,0.22)',
                    borderColor: 'rgba(245,158,11,0.3)',
                  },
                }}
              >
                {/* Yellow Icon Badge */}
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: '#f59e0b',
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: card.icon === 'Hi' ? '0.85rem' : '1.1rem',
                    fontFamily: card.icon === 'Hi' ? 'Inter, sans-serif' : 'monospace',
                    mb: 2.2,
                  }}
                >
                  {card.icon}
                </Box>

                {/* Title */}
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: '#ffffff',
                    fontFamily: 'Inter, sans-serif',
                    mb: 1,
                  }}
                >
                  {card.title}
                </Typography>

                {/* Description */}
                <Typography
                  sx={{
                    fontSize: '0.84rem',
                    color: '#94a3b8',
                    lineHeight: 1.55,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {card.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default WhyChooseUsSection;

