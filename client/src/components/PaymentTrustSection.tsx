import React from 'react';
import { Box, Container, Typography, Paper, Grid } from '@mui/material';

interface Step {
  step: number;
  title: string;
  description: string;
  isGreen?: boolean;
}

const STEPS: Step[] = [
  {
    step: 1,
    title: 'You pay AITAG',
    description: 'Your payment is held safely by AITAG — not given to the expert.',
  },
  {
    step: 2,
    title: 'Expert does the work',
    description: 'The expert starts work knowing the payment is secured.',
  },
  {
    step: 3,
    title: 'Work delivered to you',
    description: 'The expert delivers the finished work you asked for.',
  },
  {
    step: 4,
    title: 'Expert gets paid',
    description: 'Only after delivery, AITAG releases the money to the expert.',
    isGreen: true,
  },
];

export const PaymentTrustSection: React.FC = () => {
  return (
    <Box sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 6, md: 8 }, bgcolor: '#ffffff' }}>
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 4.5 },
            borderRadius: '20px',
            bgcolor: '#ffffff',
            border: '1.5px solid #bbf7d0',
            boxShadow: '0 8px 30px rgba(16, 185, 129, 0.06)',
          }}
        >
          {/* Top Pill */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                bgcolor: '#ecfdf5',
                border: '1px solid #bbf7d0',
                borderRadius: '100px',
                px: 1.5,
                py: 0.5,
              }}
            >
              <Typography sx={{ color: '#16a34a', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.6px' }}>
                ✓ YOUR MONEY IS SAFE WITH AITAG
              </Typography>
            </Box>
          </Box>

          {/* Heading & Subtitle */}
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.45rem', sm: '1.75rem', md: '2rem' },
              color: '#0f172a',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '-0.6px',
              mb: 1,
            }}
          >
            Pay with confidence. Your work is delivered first, then the expert gets paid.
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: '0.9rem', md: '0.98rem' },
              color: '#64748b',
              fontFamily: 'Inter, sans-serif',
              mb: 4,
              maxWidth: 780,
            }}
          >
            We hold your payment safely until the expert delivers the work you asked for. No risk of paying for work you never receive.
          </Typography>

          {/* 4 Steps Row */}
          <Grid container spacing={2} alignItems="stretch">
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.step}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: '14px',
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: '#f1f5f9',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      },
                    }}
                  >
                    {/* Circle badge */}
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: s.isGreen ? '#10b981' : '#3b82f6',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        mb: 1.5,
                      }}
                    >
                      {s.step}
                    </Box>

                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.94rem',
                        color: '#0f172a',
                        fontFamily: 'Inter, sans-serif',
                        mb: 0.6,
                      }}
                    >
                      {s.title}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        lineHeight: 1.45,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {s.description}
                    </Typography>
                  </Paper>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentTrustSection;

