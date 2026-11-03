import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent,
  Button, TextField, MenuItem, Select, InputLabel,
  FormControl, Chip, Skeleton, InputAdornment, Divider, Stack,
  Paper, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PaletteIcon from '@mui/icons-material/Palette';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ShareIcon from '@mui/icons-material/Share';
import LanguageIcon from '@mui/icons-material/Language';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { tasksApi } from '../api';

const CATEGORIES = ['all', 'Branding & Print', 'Social & Marketing', 'Web & Digital Presence', 'Product Visuals'];

const CATEGORY_MAP: Record<string, string> = {
  'Web & Funnels': 'Web & Digital Presence',
  'E-Commerce & Copy': 'Branding & Print',
};

const getCategoryIcon = (category: string) => {
  const norm = CATEGORY_MAP[category] || category;
  if (norm?.includes('Visual')) return <CameraAltIcon sx={{ fontSize: 13, color: '#38bdf8' }} />;
  if (norm?.includes('Branding') || norm?.includes('Print') || norm?.includes('Copy')) return <PaletteIcon sx={{ fontSize: 13, color: '#fbbf24' }} />;
  if (norm?.includes('Social') || norm?.includes('Marketing')) return <ShareIcon sx={{ fontSize: 13, color: '#a5b4fc' }} />;
  return <LanguageIcon sx={{ fontSize: 13, color: '#34d399' }} />;
};

const BrowseTasks = () => {
  const { user, loading: authLoading } = useAuth();
  const isExpertOrAdmin = user?.role === 'freelancer' || user?.role === 'admin';
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    if (isExpertOrAdmin) {
      tasksApi.getAll()
        .then(res => setTasks(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isExpertOrAdmin]);

  const filtered = tasks.filter(t => {
    const taskCat = CATEGORY_MAP[t.category] || t.category;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || taskCat === category || t.category === category;
    return matchSearch && matchCat;
  });

  if (authLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress sx={{ color: '#4f46e5' }} />
        </Box>
      </Box>
    );
  }

  // Access restriction: Browse Tasks is reserved exclusively for experts and admins
  if (!isExpertOrAdmin) {
    const isClient = user?.role === 'client';
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <Navbar />
        <Container maxWidth="md" sx={{ pt: 16, pb: 10 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3.5, sm: 5 },
              textAlign: 'center',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2.5,
                borderRadius: '16px',
                bgcolor: 'rgba(79,70,229,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5'
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 32 }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5, fontFamily: 'Inter, sans-serif' }}>
              Specialist & Administrator Task Pool
            </Typography>

            <Typography sx={{ color: '#64748b', fontSize: '0.95rem', maxWidth: 540, mx: 'auto', mb: 3.5, lineHeight: 1.6 }}>
              {isClient
                ? 'The open task board is reserved exclusively for vetted AITAG AI specialists and platform administrators to review client briefs and submit bids. As a valued business client, you can manage your own orders and custom tasks in your client portal.'
                : 'The open task board is reserved exclusively for vetted AITAG AI specialists and platform administrators. Please sign in with an authorized specialist or administrator account to review and bid on tasks.'}
            </Typography>

            <Divider sx={{ mb: 3.5 }} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
              {isClient ? (
                <>
                  <Button
                    component={Link}
                    to="/#packages"
                    variant="contained"
                    sx={{
                      bgcolor: '#4f46e5',
                      borderRadius: '10px',
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 3,
                      py: 1.1,
                      boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                      '&:hover': { bgcolor: '#4338ca' }
                    }}
                  >
                    Explore AI Packages →
                  </Button>
                  <Button
                    component={Link}
                    to="/my_tasks"
                    variant="outlined"
                    sx={{
                      borderColor: '#cbd5e1',
                      color: '#334155',
                      borderRadius: '10px',
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 3,
                      py: 1.1,
                      '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' }
                    }}
                  >
                    My Orders & Tasks
                  </Button>
                  <Button
                    component={Link}
                    to="/add_task"
                    variant="outlined"
                    sx={{
                      borderColor: '#cbd5e1',
                      color: '#334155',
                      borderRadius: '10px',
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 3,
                      py: 1.1,
                      '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' }
                    }}
                  >
                    Post a Custom Task
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/signin"
                    variant="contained"
                    sx={{
                      bgcolor: '#4f46e5',
                      borderRadius: '10px',
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 3.5,
                      py: 1.1,
                      boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                      '&:hover': { bgcolor: '#4338ca' }
                    }}
                  >
                    Sign In as Specialist / Admin →
                  </Button>
                  <Button
                    component={Link}
                    to="/#packages"
                    variant="outlined"
                    sx={{
                      borderColor: '#cbd5e1',
                      color: '#334155',
                      borderRadius: '10px',
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 3,
                      py: 1.1,
                      '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' }
                    }}
                  >
                    Explore AI Packages
                  </Button>
                </>
              )}
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 14, pb: 8 }}>
        {/* Section Header - Central Pattern */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="h3"
            fontWeight={800}
            color="#0f172a"
            sx={{
              letterSpacing: '-1px',
              fontSize: { xs: '2rem', md: '2.5rem' },
              mb: 1.5,
              fontFamily: 'Inter, sans-serif'
            }}
          >
            Browse AI Tasks & Projects
          </Typography>
          <Typography
            variant="body1"
            fontWeight={500}
            color="#64748b"
            sx={{
              maxWidth: 720,
              mx: 'auto',
              fontSize: '1.05rem',
              lineHeight: 1.6,
              mb: 3
            }}
          >
            “Discover practical AI projects posted by everyday entrepreneurs and small businesses across our 4 core services — starting at just ₹499.”
          </Typography>
          <Button
            component={Link}
            to="/add_task"
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
              fontWeight: 700,
              borderRadius: '10px',
              boxShadow: '0 4px 16px rgba(79,70,229,0.3)',
              px: 3.5,
              py: 1.2,
              fontSize: '0.92rem',
              textTransform: 'none',
              cursor: 'pointer !important'
            }}
          >
            + Post a Task
          </Button>
        </Box>

        {/* Centered Search & Category Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4.5, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 840, mx: 'auto', width: '100%' }}>
          <TextField
            placeholder="Search by service or keyword (e.g. Saree, Amazon, Instagram, WhatsApp, Website)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#4f46e5' }} /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 280, ...fieldStyle }}
          />
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Category</InputLabel>
            <Select value={category} label="Category" onChange={e => setCategory(e.target.value)} sx={{ borderRadius: '10px', fontWeight: 600 }}>
              {CATEGORIES.map(c => <MenuItem key={c} value={c} sx={{ fontWeight: 600 }}>{c === 'all' ? 'All Services (4 Categories)' : c}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        {/* Tasks List */}
        <Stack spacing={3} sx={{ width: '100%' }}>
          {loading
            ? Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={310} sx={{ borderRadius: '16px', width: '100%' }} />
              ))
            : filtered.map(task => (
                <Card
                  key={task.id}
                  elevation={0}
                  sx={{
                    width: '100%',
                    boxSizing: 'border-box',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    height: '310px',
                    minHeight: '310px',
                    maxHeight: '310px',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#ffffff',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 28px rgba(79,70,229,0.08)',
                      borderColor: '#4f46e5'
                    }
                  }}
                >
                  {/* Image Cover matching #packages style */}
                  <Box sx={{ position: 'relative', height: 160, width: '100%', bgcolor: '#f1f5f9', overflow: 'hidden' }}>
                    <img
                      src={task.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                      alt={task.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* Category Pill Top-Left */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(8px)',
                        color: '#ffffff',
                        borderRadius: '8px',
                        px: 1.2,
                        py: 0.4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: 0.3
                      }}
                    >
                      {getCategoryIcon(task.category)}
                      {CATEGORY_MAP[task.category] || task.category}
                    </Box>
                    {/* Status Pill Top-Right */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: 'rgba(79, 70, 229, 0.9)',
                        backdropFilter: 'blur(8px)',
                        color: '#ffffff',
                        borderRadius: '8px',
                        px: 1.2,
                        py: 0.4,
                        fontSize: '0.68rem',
                        fontWeight: 700
                      }}
                    >
                      Open Task
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2, pb: '16px !important', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 750, fontSize: '0.95rem', color: '#0f172a', mb: 0.5, lineHeight: 1.35, minHeight: '2.5rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {task.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.45, minHeight: '2.35rem' }}>
                        {task.description}
                      </Typography>
                    </Box>

                    <Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                        <Box>
                          <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                            Budget
                          </Typography>
                          <Typography sx={{ fontWeight: 850, color: '#10b981', fontSize: '1.1rem', lineHeight: 1.1 }}>
                            ₹{Number(task.budget).toLocaleString()}
                          </Typography>
                        </Box>
                        <Button
                          component={Link}
                          to={`/task-details/${task.id}`}
                          variant="outlined"
                          size="small"
                          sx={{
                            borderRadius: '8px',
                            fontWeight: 700,
                            borderColor: 'rgba(79,70,229,0.3)',
                            color: '#4f46e5',
                            textTransform: 'none',
                            fontSize: '0.78rem',
                            py: 0.4,
                            px: 1.8,
                            '&:hover': { borderColor: '#4f46e5', bgcolor: 'rgba(79,70,229,0.04)' }
                          }}
                        >
                          See Details
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
        </Stack>
        {!loading && filtered.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ color: '#94a3b8', fontSize: '1.1rem' }}>No tasks found. Try a different search or category.</Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

const fieldStyle = { '& .MuiOutlinedInput-root': { borderRadius: '10px', '&:hover fieldset': { borderColor: '#4f46e5' }, '&.Mui-focused fieldset': { borderColor: '#4f46e5' } }, '& label.Mui-focused': { color: '#4f46e5' } };

export default BrowseTasks;
