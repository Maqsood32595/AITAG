import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardMedia, CardContent,
  CardActions, Button, TextField, MenuItem, Select, InputLabel,
  FormControl, Chip, Skeleton, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Navbar from '../components/Navbar';
import { tasksApi } from '../api';

const CATEGORIES = ['all', 'Product Visuals', 'E-Commerce & Copy', 'Social & Marketing', 'Web & Funnels'];

const BrowseTasks = () => {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    tasksApi.getAll().then(res => setTasks(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = tasks.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || t.category === category;
    return matchSearch && matchCat;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ pt: 14, pb: 8 }}>
        <Chip
          label="PRACTICAL BUSINESS AI TASKS"
          size="small"
          sx={{
            bgcolor: 'rgba(79,70,229,0.08)',
            color: '#4f46e5',
            fontWeight: 800,
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
            borderRadius: '16px',
            mb: 1.5,
            px: 0.5
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mb: 1, fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}>
              Browse AI Tasks
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '1.05rem', maxWidth: 700 }}>
              Discover practical AI projects posted by everyday entrepreneurs and small businesses across our 4 core services.
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/add_task"
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
              fontWeight: 700,
              borderRadius: '10px',
              boxShadow: '0 4px 16px rgba(79,70,229,0.3)',
              px: 3,
              py: 1.2,
              whiteSpace: 'nowrap',
              cursor: 'pointer !important'
            }}
          >
            + Post a Task
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 5, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by service or keyword (e.g. Saree, Amazon, Instagram, WhatsApp, Website)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#4f46e5' }} /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 260, ...fieldStyle }}
          />
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Category</InputLabel>
            <Select value={category} label="Category" onChange={e => setCategory(e.target.value)} sx={{ borderRadius: '12px', fontWeight: 600 }}>
              {CATEGORIES.map(c => <MenuItem key={c} value={c} sx={{ fontWeight: 600 }}>{c === 'all' ? 'All Services (4 Categories)' : c}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        {/* Grid */}
        <Grid container spacing={3}>
          {loading
            ? Array(8).fill(0).map((_, i) => (
              <Grid xs={12} sm={6} md={4} lg={3} key={i}>
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: '16px' }} />
              </Grid>
            ))
            : filtered.map(task => (
              <Grid xs={12} sm={6} md={4} lg={3} key={task.id}>
                <Card elevation={0} sx={{
                  borderRadius: '20px', border: '1px solid rgba(79,70,229,0.1)', height: '100%',
                  display: 'flex', flexDirection: 'column', transition: 'all 0.25s',
                  bgcolor: '#ffffff',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 36px rgba(79,70,229,0.1)', borderColor: '#4f46e5' }
                }}>
                  <CardMedia component="img" height="170" image={task.image} alt={task.title} sx={{ objectFit: 'cover' }} />
                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    <Chip
                      label={task.category}
                      size="small"
                      sx={{
                        mb: 1.5,
                        bgcolor: 'rgba(79,70,229,0.08)',
                        color: '#4f46e5',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        borderRadius: '8px'
                      }}
                    />
                    <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a', mb: 1, lineHeight: 1.4 }}>
                      {task.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.84rem', color: '#64748b', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                      {task.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 'auto' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, mr: 0.5 }}>
                        Budget:
                      </Typography>
                      <Typography sx={{ fontWeight: 900, color: '#10b981', fontSize: '1.2rem' }}>
                        ₹{Number(task.budget).toLocaleString()}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                    <Button component={Link} to={`/task-details/${task.id}`} variant="outlined" fullWidth
                      sx={{ borderRadius: '10px', fontWeight: 700, borderColor: 'rgba(79,70,229,0.3)', color: '#4f46e5', textTransform: 'none', '&:hover': { borderColor: '#4f46e5', bgcolor: 'rgba(79,70,229,0.04)' } }}>
                      See Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>
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
