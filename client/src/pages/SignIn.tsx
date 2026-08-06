import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Alert, Divider } from '@mui/material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const SignIn = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(location.state?.error || '');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
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
            Welcome back
          </Typography>
          <Typography sx={{ color: '#64748b', mb: 4, fontSize: '0.95rem' }}>
            Sign in to your AITAG account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Email" type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} sx={fieldStyle} />
            <TextField label="Password" type="password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} sx={fieldStyle} />

            <Button type="submit" variant="contained" size="large" disabled={loading}
              sx={{
                mt: 1, background: 'linear-gradient(135deg, #4f46e5, #0891b2)', fontWeight: 700,
                borderRadius: '12px', py: 1.5, boxShadow: '0 6px 20px rgba(79,70,229,0.3)',
                '&:hover': { boxShadow: '0 8px 28px rgba(79,70,229,0.4)' }
              }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography sx={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
            New to AITAG?{' '}
            <Link to="/signup" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>Create account</Link>
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

export default SignIn;
