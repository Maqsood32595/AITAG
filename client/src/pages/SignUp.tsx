import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, TextField, Button,
  Alert, Divider, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const SignUp = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', photoURL: '', role: 'freelancer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (!/[A-Z]/.test(form.password)) return setError('Password must contain at least one uppercase letter');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ pt: 14, pb: 6 }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: '20px', border: '1px solid rgba(79,70,229,0.1)', boxShadow: '0 8px 40px rgba(79,70,229,0.08)' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontFamily: 'Inter, sans-serif', letterSpacing: '-1px' }}>
            Create account
          </Typography>
          <Typography sx={{ color: '#64748b', mb: 4, fontSize: '0.95rem' }}>
            Join AITAG — find or post AI tasks today
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Full Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              sx={fieldStyle} />
            <TextField label="Email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              sx={fieldStyle} />
            <TextField label="Password" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              helperText="Min 6 chars, at least one uppercase" sx={fieldStyle} />
            <TextField label="Photo URL (optional)" value={form.photoURL} onChange={e => setForm({ ...form, photoURL: e.target.value })}
              sx={fieldStyle} />
            <FormControl sx={fieldStyle}>
              <InputLabel>I am a...</InputLabel>
              <Select value={form.role} label="I am a..." onChange={e => setForm({ ...form, role: e.target.value })}>
                <MenuItem value="freelancer">Freelancer (AI Talent)</MenuItem>
                <MenuItem value="client">Client (Post Tasks)</MenuItem>
              </Select>
            </FormControl>

            <Button type="submit" variant="contained" size="large" disabled={loading}
              sx={{
                mt: 1, background: 'linear-gradient(135deg, #4f46e5, #0891b2)', fontWeight: 700,
                borderRadius: '12px', py: 1.5, boxShadow: '0 6px 20px rgba(79,70,229,0.3)',
                '&:hover': { boxShadow: '0 8px 28px rgba(79,70,229,0.4)' }
              }}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography sx={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/signin" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    '&:hover fieldset': { borderColor: '#4f46e5' },
    '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
  },
  '& label.Mui-focused': { color: '#4f46e5' },
};

export default SignUp;
