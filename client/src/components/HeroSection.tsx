import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Container, Chip, InputBase,
  Paper, Stack, Grid, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HandshakeIcon from '@mui/icons-material/Handshake';
import { useAuth } from '../context/AuthContext';

const AI_TAGS = [
  '🤖 AI Engineering',
  '🧠 Prompt Design',
  '⚡ ML Ops',
  '📊 Data Science',
  '🔍 RAG Pipelines',
  '🎨 AI Design',
];

const WHY_ITEMS = [
  {
    icon: <RocketLaunchIcon />,
    title: 'Faster Delivery',
    desc: 'AI-matched talent starts in hours, not weeks.',
  },
  {
    icon: <AttachMoneyIcon />,
    title: 'Lower Cost',
    desc: 'AI eliminates middlemen — savings pass directly to you.',
  },
  {
    icon: <HandshakeIcon />,
    title: 'Verified AI Talent',
    desc: 'Every freelancer is tagged and ranked by AI specialty.',
  },
];

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [animatedTag, setAnimatedTag] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedTag(prev => (prev + 1) % AI_TAGS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    if (search.trim()) navigate(`/all_tasks?search=${encodeURIComponent(search)}`);
    else navigate('/all_tasks');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
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
      <Box sx={{
        position: 'absolute', top: '40%', left: '40%',
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        animation: 'pulse 6s ease-in-out infinite',
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: 12, pb: 8 }}>
        <Grid container spacing={6} sx={{ alignItems: 'center' }}>

          {/* LEFT — headline, search, tags, CTAs */}
          <Grid xs={12} md={7}>
            {/* Badge */}
            <Box sx={{ mb: 3 }}>
              <Chip
                icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important', color: '#4f46e5 !important' }} />}
                label="AI-Powered Talent Marketplace"
                sx={{
                  bgcolor: 'rgba(79,70,229,0.08)',
                  color: '#4f46e5',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  border: '1px solid rgba(79,70,229,0.2)',
                  borderRadius: '20px',
                  px: 1,
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
                lineHeight: 1.1,
                letterSpacing: '-2px',
                color: '#0f172a',
                mb: 1,
              }}
            >
              Leveraging AI to{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Reduce Cost
              </Box>
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 900,
                fontSize: { xs: '2.2rem', sm: '3rem', md: '3.6rem' },
                lineHeight: 1.1,
                letterSpacing: '-2px',
                color: '#0f172a',
                mb: 3,
              }}
            >
              to the End Customer
            </Typography>

            {/* Sub-headline */}
            <Typography
              sx={{
                fontSize: { xs: '1rem', md: '1.2rem' },
                color: '#475569',
                mb: 4,
                lineHeight: 1.7,
                maxWidth: 540,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Tagging the{' '}
              <strong style={{ color: '#4f46e5' }}>Best AI Talent</strong>{' '}
              to the end customer — faster matching, smarter bidding,
              measurably lower project costs.
            </Typography>

            {/* Search Bar */}
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '16px',
                border: '2px solid rgba(79,70,229,0.15)',
                bgcolor: '#fff',
                boxShadow: '0 8px 32px rgba(79,70,229,0.1)',
                overflow: 'hidden',
                maxWidth: 520,
                mb: 3,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'rgba(79,70,229,0.35)',
                  boxShadow: '0 12px 40px rgba(79,70,229,0.15)',
                },
              }}
            >
              <InputBase
                sx={{ flex: 1, px: 2.5, py: 1.5, fontSize: '0.95rem', fontFamily: 'Inter, sans-serif' }}
                placeholder="Search AI talent, tasks, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                variant="contained"
                sx={{
                  m: 0.75,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                  px: 3,
                  py: 1.5,
                  fontWeight: 700,
                  boxShadow: 'none',
                  minWidth: 100,
                  '&:hover': { boxShadow: '0 4px 16px rgba(79,70,229,0.4)', transform: 'none' },
                }}
              >
                <SearchIcon sx={{ mr: 0.5, fontSize: 18 }} /> Search
              </Button>
            </Paper>

            {/* Rotating AI tag chips */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 5 }}>
              {AI_TAGS.map((tag, i) => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => navigate('/all_tasks')}
                  size="small"
                  sx={{
                    bgcolor: i === animatedTag ? 'rgba(79,70,229,0.12)' : 'rgba(255,255,255,0.8)',
                    border: `1px solid ${i === animatedTag ? 'rgba(79,70,229,0.4)' : 'rgba(0,0,0,0.08)'}`,
                    color: i === animatedTag ? '#4f46e5' : '#64748b',
                    fontWeight: i === animatedTag ? 700 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.4s ease',
                    transform: i === animatedTag ? 'translateY(-2px)' : 'translateY(0)',
                    '&:hover': { borderColor: '#4f46e5', color: '#4f46e5' },
                  }}
                />
              ))}
            </Box>

            {/* CTA Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/talent')}
                sx={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
                  fontWeight: 700,
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
                  '&:hover': { boxShadow: '0 12px 32px rgba(79,70,229,0.45)', transform: 'translateY(-2px)' },
                }}
              >
                Find AI Talent →
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  if (!user) {
                    navigate('/signin', { state: { error: 'You must be signed in to post a task.' }, replace: true });
                  } else {
                    navigate('/add_task');
                  }
                }}
                sx={{
                  borderColor: 'rgba(79,70,229,0.35)',
                  color: '#4f46e5',
                  fontWeight: 700,
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  '&:hover': { borderColor: '#4f46e5', bgcolor: 'rgba(79,70,229,0.04)', transform: 'translateY(-2px)' },
                }}
              >
                Post a Task
              </Button>
            </Stack>
          </Grid>

          {/* RIGHT — Why AITAG panel */}
          <Grid xs={12} md={5}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                p: 4,
                border: '1px solid rgba(79,70,229,0.1)',
                boxShadow: '0 20px 60px rgba(79,70,229,0.08)',
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: '#0f172a',
                  mb: 3,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Why AITAG?
              </Typography>

              <Stack spacing={2.5}>
                {WHY_ITEMS.map((item) => (
                  <Box
                    key={item.title}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                      p: 2,
                      borderRadius: '14px',
                      bgcolor: 'rgba(79,70,229,0.04)',
                      border: '1px solid rgba(79,70,229,0.08)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(79,70,229,0.07)',
                        borderColor: 'rgba(79,70,229,0.18)',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: '#0f172a',
                          fontFamily: 'Inter, sans-serif',
                          mb: 0.3,
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
                        }}
                      >
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                <Divider sx={{ borderColor: 'rgba(79,70,229,0.08)', my: 1 }} />

                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    textAlign: 'center',
                    fontFamily: 'Inter, sans-serif',
                    fontStyle: 'italic',
                  }}
                >
                  Post a task. Get matched. Save more.
                </Typography>
              </Stack>
            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
