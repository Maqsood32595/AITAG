import React, { useState } from 'react';
import {
  Box, Container, Typography, Grid, Paper, Stack, Button,
  Chip, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import HandshakeIcon from '@mui/icons-material/Handshake';
import Navbar from '../components/Navbar';
import UniversalVideoPlayer from '../components/UniversalVideoPlayer';
import { useNavigate } from 'react-router-dom';

const WORKFLOW_STEPS = [
  {
    num: '01',
    title: 'Select a Service or Post a Brief',
    subtitle: 'Takes less than 2 minutes. No technical brief needed.',
    icon: <SmartToyIcon sx={{ fontSize: 28, color: '#3b82f6' }} />,
    color: '#3b82f6',
    bg: '#eff6ff',
    details: [
      'Choose from ready-made packages starting at just ₹499 (Logos, Social Media, Catalogues, Websites).',
      'Or tell us what you need in plain everyday language via our short form or directly on WhatsApp.',
      'Specify your brand colors, goals, and any reference files or inspirations you have.',
    ],
  },
  {
    num: '02',
    title: 'We Match You with a Verified AI Specialist',
    subtitle: 'Tagged to vetted experts with proven track records.',
    icon: <HandshakeIcon sx={{ fontSize: 28, color: '#6366f1' }} />,
    color: '#6366f1',
    bg: '#eef2ff',
    details: [
      'AITAG algorithms match your exact requirements with a vetted AI specialist.',
      'Your deposit is held 100% safely by AITAG — it is never transferred upfront to the expert.',
      'The expert begins work knowing your budget is locked and guaranteed.',
    ],
  },
  {
    num: '03',
    title: 'AI-Powered Production & Rapid Draft Review',
    subtitle: 'Faster turnaround, higher creative quality, lower cost.',
    icon: <SpeedIcon sx={{ fontSize: 28, color: '#f59e0b' }} />,
    color: '#f59e0b',
    bg: '#fffbeb',
    details: [
      'Experts utilize premier AI engines (Midjourney, Claude, GPT-4o, Cursor) to produce assets 5x faster.',
      'You receive initial concept drafts directly in your project dashboard for review.',
      'Request revisions or tweaks directly in the discussion feed with 1-click feedback.',
    ],
  },
  {
    num: '04',
    title: 'Quality Check, Handover & Payout Release',
    subtitle: 'Full commercial ownership. Zero risk.',
    icon: <ShieldIcon sx={{ fontSize: 28, color: '#10b981' }} />,
    color: '#10b981',
    bg: '#ecfdf5',
    details: [
      'AITAG performs an automated and manual quality review on deliverables.',
      'You inspect and download high-resolution source files, vector assets, or deployed links.',
      'Only once you approve the delivered work does AITAG disburse the funds to the expert.',
    ],
  },
];

const FAQS = [
  {
    q: 'How does AITAG guarantee my payment safety?',
    a: 'When you order a service, your payment is held securely in AITAG escrow. The expert cannot withdraw the funds until you have reviewed and approved the delivered work. If the work is not delivered to your satisfaction, your payment remains protected.',
  },
  {
    q: 'Do I need any technical knowledge or prompt engineering skills?',
    a: 'Not at all! That is the core mission of AITAG. You simply describe your business need in plain words (English, Hindi, or Kannada) or send reference pictures. Our verified AI specialists handle all prompts, tool workflows, and asset generation.',
  },
  {
    q: 'How fast will my project be delivered?',
    a: 'Most pilot packages (logos, social media posts, product photo makeovers) are delivered within 24 to 48 hours. Landing page websites typically take 48 to 72 hours.',
  },
  {
    q: 'Do I get full commercial rights to the deliverables?',
    a: 'Yes, 100%. All final outputs delivered through AITAG include full perpetual commercial usage rights for your business, social media, ads, packaging, and digital channels.',
  },
];

export const HowItWorks: React.FC = () => {
  const navigate = useNavigate();
  const [activeVideo, setActiveVideo] = useState<'kinetic' | 'walkthrough'>('kinetic');
  const videoUrl = activeVideo === 'kinetic' ? '/workflow-demo.mp4' : '/aitag-walkthrough.mp4';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 12, md: 15 },
          pb: { xs: 6, md: 8 },
          background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 840, mx: 'auto' }}>
            <Chip
              label="✦ STEP-BY-STEP WORKFLOW GUIDE"
              sx={{
                bgcolor: 'rgba(79,70,229,0.08)',
                color: '#4f46e5',
                fontWeight: 800,
                fontSize: '0.75rem',
                letterSpacing: '0.6px',
                border: '1px solid rgba(79,70,229,0.2)',
                borderRadius: '20px',
                mb: 2,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.4rem' },
                lineHeight: 1.15,
                color: '#0f172a',
                letterSpacing: '-1.2px',
                fontFamily: 'Inter, sans-serif',
                mb: 2,
              }}
            >
              How AITAG Turns Your Ideas{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Into Reality.
              </Box>
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1rem', md: '1.12rem' },
                color: '#475569',
                lineHeight: 1.6,
                fontFamily: 'Inter, sans-serif',
                maxWidth: 680,
                mx: 'auto',
                mb: 4,
              }}
            >
              You don’t need to learn prompts or master AI tools. Tell us what your business needs, and our verified AI specialists craft high-quality deliverables with 100% payment protection.
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{ gap: 1.5 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/?scroll=services')}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: '#2563eb',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  borderRadius: '24px',
                  px: 3.5,
                  py: 1.3,
                  textTransform: 'none',
                  boxShadow: '0 8px 20px rgba(37,99,235,0.25)',
                  '&:hover': {
                    bgcolor: '#1d4ed8',
                  },
                }}
              >
                Explore Services & Packages
              </Button>
              <Button
                variant="outlined"
                href="https://wa.me/919886031643?text=Hi%20AITAG%2C%20I%20want%20to%20learn%20how%20AITAG%20works"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  borderColor: '#cbd5e1',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: '24px',
                  px: 3.5,
                  py: 1.3,
                  textTransform: 'none',
                  bgcolor: '#ffffff',
                  '&:hover': {
                    bgcolor: '#f1f5f9',
                    borderColor: '#94a3b8',
                  },
                }}
              >
                Chat on WhatsApp
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Video Walkthrough Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: '24px',
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 12px 35px rgba(0,0,0,0.04)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: '#2563eb', mb: 1 }}>
              <PlayCircleIcon sx={{ fontSize: 22 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                Platform Walkthrough
              </Typography>
            </Box>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.6rem', sm: '1.9rem', md: '2.2rem' },
                color: '#0f172a',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.6px',
                mb: 1,
              }}
            >
              Watch How It Works (2-Minute Demo)
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: '#64748b', maxWidth: 620, mx: 'auto', mb: 3 }}>
              See how everyday entrepreneurs submit briefs, get tagged to vetted specialists, review samples, and approve final deliverables.
            </Typography>

            {/* Video Mode Switcher */}
            <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mb: 3.5 }}>
              <Chip
                label="⚡ 20-Sec Kinetic Overview"
                clickable
                onClick={() => setActiveVideo('kinetic')}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  py: 2.2,
                  px: 1,
                  borderRadius: '20px',
                  bgcolor: activeVideo === 'kinetic' ? '#2563eb' : '#f1f5f9',
                  color: activeVideo === 'kinetic' ? '#ffffff' : '#334155',
                  border: activeVideo === 'kinetic' ? '1px solid #1d4ed8' : '1px solid #cbd5e1',
                  boxShadow: activeVideo === 'kinetic' ? '0 4px 14px rgba(37,99,235,0.3)' : 'none',
                  '&:hover': {
                    bgcolor: activeVideo === 'kinetic' ? '#1d4ed8' : '#e2e8f0',
                  },
                }}
              />
              <Chip
                label="🖥️ Step-by-Step UI Walkthrough (5 Steps)"
                clickable
                onClick={() => setActiveVideo('walkthrough')}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  py: 2.2,
                  px: 1,
                  borderRadius: '20px',
                  bgcolor: activeVideo === 'walkthrough' ? '#2563eb' : '#f1f5f9',
                  color: activeVideo === 'walkthrough' ? '#ffffff' : '#334155',
                  border: activeVideo === 'walkthrough' ? '1px solid #1d4ed8' : '1px solid #cbd5e1',
                  boxShadow: activeVideo === 'walkthrough' ? '0 4px 14px rgba(37,99,235,0.3)' : 'none',
                  '&:hover': {
                    bgcolor: activeVideo === 'walkthrough' ? '#1d4ed8' : '#e2e8f0',
                  },
                }}
              />
            </Stack>
          </Box>

          <Box
            sx={{
              maxWidth: 880,
              mx: 'auto',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(15,23,42,0.12)',
              border: '1px solid #cbd5e1',
            }}
          >
            <UniversalVideoPlayer url={videoUrl} title="AITAG Workflow Walkthrough" />
          </Box>
        </Paper>
      </Container>

      {/* 4 Detailed Workflow Stages */}
      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.75rem', sm: '2.1rem', md: '2.4rem' },
              color: '#0f172a',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '-0.8px',
              mb: 1,
            }}
          >
            The 4 Simple Stages of Every Project
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: '#64748b', maxWidth: 650, mx: 'auto' }}>
            Transparent milestone tracking with 100% payment escrow protection at every turn.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {WORKFLOW_STEPS.map((step) => (
            <Grid key={step.num} size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: '20px',
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
                    borderColor: step.color,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '14px',
                      bgcolor: step.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: '1.6rem',
                      color: step.color,
                      fontFamily: 'monospace',
                    }}
                  >
                    {step.num}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.18rem',
                    color: '#0f172a',
                    fontFamily: 'Inter, sans-serif',
                    mb: 0.8,
                  }}
                >
                  {step.title}
                </Typography>

                <Typography sx={{ fontSize: '0.88rem', color: '#64748b', mb: 2.5 }}>
                  {step.subtitle}
                </Typography>

                <Stack spacing={1.2} sx={{ mt: 'auto' }}>
                  {step.details.map((detail, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: step.color, mt: 0.3, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.45 }}>
                        {detail}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Frequently Asked Questions */}
      <Box sx={{ bgcolor: '#ffffff', py: { xs: 8, md: 10 }, borderTop: '1px solid #e2e8f0' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                color: '#0f172a',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.6px',
                mb: 1,
              }}
            >
              Frequently Asked Questions
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: '#64748b' }}>
              Everything you need to know about working with AITAG.
            </Typography>
          </Box>

          <Stack spacing={1.8}>
            {FAQS.map((faq, i) => (
              <Accordion
                key={i}
                elevation={0}
                sx={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px !important',
                  '&:before': { display: 'none' },
                  overflow: 'hidden',
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#2563eb' }} />}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 2.5 }}>
                  <Typography sx={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Bottom CTA Banner */}
      <Box sx={{ bgcolor: '#f8fafc', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 5 },
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
              color: '#ffffff',
              textAlign: 'center',
              boxShadow: '0 16px 40px rgba(15,23,42,0.18)',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                letterSpacing: '-0.8px',
                fontFamily: 'Inter, sans-serif',
                mb: 1.5,
              }}
            >
              Ready to create something amazing for your business?
            </Typography>
            <Typography
              sx={{
                fontSize: '1.02rem',
                color: 'rgba(255,255,255,0.85)',
                maxWidth: 620,
                mx: 'auto',
                mb: 3.5,
              }}
            >
              Start for as low as ₹499 with 100% payment safety. No apps to learn.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{ gap: 1.5 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/?scroll=services')}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  borderRadius: '24px',
                  px: 4,
                  py: 1.3,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#1d4ed8',
                  },
                }}
              >
                Browse Our Services
              </Button>
              <Button
                variant="contained"
                href="https://wa.me/919886031643?text=Hi%20AITAG%2C%20I%20want%20to%20get%20started%20with%20an%20AI%20service"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  bgcolor: '#22c55e',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: '24px',
                  px: 3.5,
                  py: 1.3,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#16a34a',
                  },
                }}
              >
                Chat on WhatsApp
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default HowItWorks;
