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

const CATEGORIES = ['all', 'AI Engineering', 'Machine Learning', 'ML Ops', 'Data Science', 'Design', 'Writing', 'Web Development', 'Mobile Development'];

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
      <Container maxWidth="xl" sx={{ pt: 12, pb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}>
          Browse AI Tasks
        </Typography>
        <Typography sx={{ color: '#64748b', mb: 4 }}>Find the perfect AI project that matches your skills</Typography>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 5, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94a3b8' }} /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 240, ...fieldStyle }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select value={category} label="Category" onChange={e => setCategory(e.target.value)} sx={{ borderRadius: '10px' }}>
              {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c === 'all' ? 'All Categories' : c}</MenuItem>)}
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
                  borderRadius: '16px', border: '1px solid rgba(79,70,229,0.08)', height: '100%',
                  display: 'flex', flexDirection: 'column', transition: 'all 0.25s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(79,70,229,0.12)', borderColor: 'rgba(79,70,229,0.2)' }
                }}>
                  <CardMedia component="img" height="160" image={task.image} alt={task.title} sx={{ objectFit: 'cover' }} />
                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    <Chip label={task.category} size="small" sx={{ mb: 1.5, bgcolor: 'rgba(79,70,229,0.08)', color: '#4f46e5', fontWeight: 600, fontSize: '0.72rem' }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', mb: 1, lineHeight: 1.4 }}>
                      {task.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#64748b', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {task.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AttachMoneyIcon sx={{ color: '#10b981', fontSize: 18 }} />
                      <Typography sx={{ fontWeight: 800, color: '#10b981', fontSize: '1rem' }}>{task.budget}</Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ px: 2.5, pb: 2.5 }}>
                    <Button component={Link} to={`/task-details/${task.id}`} variant="outlined" fullWidth
                      sx={{ borderRadius: '10px', fontWeight: 700, borderColor: 'rgba(79,70,229,0.3)', color: '#4f46e5', '&:hover': { borderColor: '#4f46e5', bgcolor: 'rgba(79,70,229,0.04)' } }}>
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
