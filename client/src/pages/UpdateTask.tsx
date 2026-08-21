import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Alert, MenuItem, Select, InputLabel, FormControl, CircularProgress } from '@mui/material';
import Navbar from '../components/Navbar';
import { tasksApi } from '../api';

const CATEGORIES = ['AI Engineering', 'Machine Learning', 'ML Ops', 'Data Science', 'Design', 'Writing', 'Web Development', 'Mobile Development', 'Data Entry'];

const UpdateTask = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    tasksApi.getById(id!).then(res => {
      const t = res.data;
      setForm({ title: t.title, category: t.category, description: t.description, deadline: t.deadline?.split('T')[0] || t.deadline, budget: t.budget, image: t.image || '' });
    }).catch(console.error);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await tasksApi.update(id!, form);
      navigate('/my_tasks');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress sx={{ color: '#4f46e5' }} /></Box>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ pt: 14, pb: 6 }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: '20px', border: '1px solid rgba(79,70,229,0.1)', boxShadow: '0 8px 40px rgba(79,70,229,0.08)' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}>Update Task</Typography>
          <Typography sx={{ color: '#64748b', mb: 4, fontSize: '0.95rem' }}>Edit your task details below</Typography>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Task Title *" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} sx={fieldStyle} />
            <FormControl sx={fieldStyle}>
              <InputLabel>Category</InputLabel>
              <Select value={form.category} label="Category" onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Description *" required multiline rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} sx={fieldStyle} />
            <TextField
              label="Deadline *"
              type="date"
              required
              value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              sx={{
                ...fieldStyle,
                '& .MuiInputLabel-root': {
                  transform: 'translate(14px, -9px) scale(0.75) !important',
                  bgcolor: '#ffffff',
                  px: 0.8,
                  borderRadius: '4px',
                  fontWeight: 600,
                  zIndex: 2,
                }
              }}
            />
            <TextField label="Budget ($) *" type="number" required value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} sx={fieldStyle} />
            <TextField label="Image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} sx={fieldStyle} />
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button type="button" variant="outlined" fullWidth onClick={() => navigate('/my_tasks')}
                sx={{ borderRadius: '12px', color: '#64748b', borderColor: '#e2e8f0', fontWeight: 600 }}>Cancel</Button>
              <Button type="submit" variant="contained" fullWidth disabled={loading}
                sx={{ background: 'linear-gradient(135deg, #4f46e5, #0891b2)', fontWeight: 700, borderRadius: '12px', boxShadow: '0 6px 20px rgba(79,70,229,0.3)' }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

const fieldStyle = { '& .MuiOutlinedInput-root': { borderRadius: '10px', '&:hover fieldset': { borderColor: '#4f46e5' }, '&.Mui-focused fieldset': { borderColor: '#4f46e5' } }, '& label.Mui-focused': { color: '#4f46e5' } };

export default UpdateTask;
