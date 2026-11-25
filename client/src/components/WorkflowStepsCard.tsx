import React from 'react';
import { Box, Typography, Paper, Stack, Grid } from '@mui/material';

interface SimpleStep {
  num: string;
  title: string;
  description: string;
}

interface ValueBadge {
  title: string;
  subtitle: string;
  color: string;
  bgcolor: string;
  borderColor: string;
}

const SIMPLE_STEPS: SimpleStep[] = [
  {
    num: '1',
    title: 'Tell us what you need',
    description: 'Fill a short form or just send a WhatsApp message',
  },
  {
    num: '2',
    title: 'We match you with an AI expert',
    description: 'A verified expert picked for your type of work',
  },
  {
    num: '3',
    title: 'Get your finished work',
    description: 'Quality-checked by AITAG, ready to use',
  },
];

const VALUE_BADGES: ValueBadge[] = [
  {
    title: 'Lower cost',
    subtitle: 'than traditional agencies',
    color: '#059669',
    bgcolor: '#ecfdf5',
    borderColor: '#d1fae5',
  },
  {
    title: 'Faster',
    subtitle: 'delivery',
    color: '#2563eb',
    bgcolor: '#eff6ff',
    borderColor: '#dbeafe',
  },
  {
    title: 'Safe payment',
    subtitle: 'released after delivery',
    color: '#7c3aed',
    bgcolor: '#faf5ff',
    borderColor: '#f3e8ff',
  },
];

/**
 * Shared "How it works — 3 simple steps" summary card used across HowItWorks desktop/mobile hero and HeroSection mobile view.
 */
const WorkflowStepsCard: React.FC = () => {
  return (
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
      <Box sx={{ mb: 2.5, textAlign: 'left' }}>
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
        {SIMPLE_STEPS.map((step) => (
          <Box
            key={step.num}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.8,
              p: 1.5,
              borderRadius: '14px',
              bgcolor: '#f8fafc',
              border: '1px solid #f1f5f9',
              textAlign: 'left',
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
              {step.num}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
                {step.title}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mt: 0.2 }}>
                {step.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      {/* Bottom 3 Summary Boxes */}
      <Grid container spacing={1.2}>
        {VALUE_BADGES.map((badge) => (
          <Grid key={badge.title} size={{ xs: 4 }}>
            <Box
              sx={{
                p: 1.2,
                textAlign: 'center',
                borderRadius: '12px',
                bgcolor: badge.bgcolor,
                border: `1px solid ${badge.borderColor}`,
                height: '100%',
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: badge.color, mb: 0.2 }}>
                {badge.title}
              </Typography>
              <Typography sx={{ fontSize: '0.66rem', color: '#64748b', lineHeight: 1.2 }}>
                {badge.subtitle}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default WorkflowStepsCard;
