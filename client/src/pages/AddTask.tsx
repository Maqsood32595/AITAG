import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import Navbar from '../components/Navbar';
import { tasksApi } from '../api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['AI Engineering', 'Machine Learning', 'ML Ops', 'Data Science', 'Design', 'Writing', 'Web Development', 'Mobile Development', 'Data Entry'];

const AddTask = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', category: 'AI Engineering', description: '', deadline: '', budget: '', image: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await tasksApi.create(form);
      navigate('/my_tasks');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ pt: 14, pb: 6 }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: '20px', border: '1px solid rgba(79,70,229,0.1)', boxShadow: '0 8px 40px rgba(79,70,229,0.08)' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}>Post a Task</Typography>
          <Typography sx={{ color: '#64748b', mb: 4, fontSize: '0.95rem' }}>Describe what you need — AI talent will bid on it</Typography>
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
            <TextField label="Image URL (optional)" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} sx={fieldStyle} />
            <Box sx={{ p: 2, bgcolor: 'rgba(79,70,229,0.04)', borderRadius: '10px', border: '1px solid rgba(79,70,229,0.08)' }}>
              <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>Posting as: <strong style={{ color: '#0f172a' }}>{user?.name}</strong> ({user?.email})</Typography>
            </Box>
            <Button type="submit" variant="contained" size="large" disabled={loading}
              sx={{ mt: 1, background: 'linear-gradient(135deg, #4f46e5, #0891b2)', fontWeight: 700, borderRadius: '12px', py: 1.5, boxShadow: '0 6px 20px rgba(79,70,229,0.3)' }}>
              {loading ? 'Posting...' : 'Post Task'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

const fieldStyle = { '& .MuiOutlinedInput-root': { borderRadius: '10px', '&:hover fieldset': { borderColor: '#4f46e5' }, '&.Mui-focused fieldset': { borderColor: '#4f46e5' } }, '& label.Mui-focused': { color: '#4f46e5' } };

export default AddTask;
