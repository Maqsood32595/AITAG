import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, TextField, Button,
  Alert, Divider, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

const SignUp = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, forward to requested destination or dashboard
  React.useEffect(() => {
    if (user) {
      const searchParams = new URLSearchParams(location.search);
      const redirectTarget = searchParams.get('redirect') || location.state?.from;
      const fallback = (user.role === 'admin' || user.role === 'freelancer') ? '/dashboard' : '/';
      const destination = (redirectTarget && redirectTarget !== '/signin' && redirectTarget !== '/signup') ? redirectTarget : fallback;
      navigate(destination, { replace: true });
    }
  }, [user, location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    if (!/[A-Z]/.test(form.password)) {
      return setError('Password must contain at least one uppercase letter (e.g. A-Z)');
    }
    setLoading(true);
    try {
      const loggedUser = await register(form);
      const userRole = loggedUser?.role || form.role;
      const searchParams = new URLSearchParams(location.search);
      const redirectTarget = searchParams.get('redirect') || location.state?.from;
      const fallback = (userRole === 'admin' || userRole === 'freelancer') ? '/dashboard' : '/';
      const destination = (redirectTarget && redirectTarget !== '/signin' && redirectTarget !== '/signup') ? redirectTarget : fallback;
      navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const isPasswordError = Boolean(error && error.toLowerCase().includes('password'));
  const searchParams = new URLSearchParams(location.search);
  const redirectQuery = searchParams.get('redirect');
  const signInLink = redirectQuery ? `/signin?redirect=${encodeURIComponent(redirectQuery)}` : '/signin';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />
      <Container maxWidth="xs" sx={{ pt: { xs: 9, sm: 11 }, pb: 4 }}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: '14px', border: '1px solid rgba(79,70,229,0.1)', boxShadow: '0 4px 24px rgba(79,70,229,0.06)' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.4px' }}>
            Create Account
          </Typography>
          <Typography sx={{ color: '#64748b', mb: 2.5, fontSize: '0.85rem' }}>
            Get affordable AI services for your products, website, logo, and marketing
          </Typography>

          {/* Role Selection for Google & Email Registration */}
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="role-label" sx={{ fontSize: '0.875rem' }}>I want to</InputLabel>
              <Select
                labelId="role-label"
                value={form.role}
                label="I want to"
                onChange={e => setForm({ ...form, role: e.target.value })}
                sx={{ borderRadius: '10px', fontSize: '0.875rem', bgcolor: '#ffffff' }}
              >
                <MenuItem value="client">Order AI Services (Customer / Small Business)</MenuItem>
                <MenuItem value="freelancer">Offer AI Services (Verified AI Specialist)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Google 1-Click Registration */}
          <Box sx={{ mb: 2 }}>
            <GoogleAuthButton mode="signup" role={form.role} onError={err => setError(err)} />
          </Box>

          <Divider sx={{ mb: 2, color: '#94a3b8', fontSize: '0.8rem' }}>
            or register with email
          </Divider>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
            <TextField
              label="Full Name or Business Name"
              required
              placeholder="e.g. Sumanth Patel / Patel Bakery"
              value={form.name}
              onChange={e => {
                setForm({ ...form, name: e.target.value });
                if (error) setError('');
              }}
              sx={fieldStyle}
            />
            <TextField
              label="Email"
              type="email"
              required
              placeholder="e.g. sumanth@gmail.com"
              value={form.email}
              onChange={e => {
                setForm({ ...form, email: e.target.value });
                if (error) setError('');
              }}
              sx={fieldStyle}
            />
            <TextField
              label="Password (min 6 chars, 1 uppercase)"
              type="password"
              required
              value={form.password}
              onChange={e => {
                setForm({ ...form, password: e.target.value });
                if (error) setError('');
              }}
              error={isPasswordError}
              helperText={isPasswordError ? 'Password must be >= 6 characters and have at least 1 uppercase letter' : ''}
              sx={fieldStyle}
            />

            {error && !isPasswordError && (
              <Alert severity="error" sx={{ borderRadius: '10px', py: 0.5, fontSize: '0.875rem' }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 1,
                background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                fontWeight: 700,
                borderRadius: '12px',
                py: 1.5,
                boxShadow: '0 6px 20px rgba(79,70,229,0.3)',
                '&:hover': { boxShadow: '0 8px 28px rgba(79,70,229,0.4)' }
              }}
            >
              {loading ? 'Creating account...' : 'Create AITAG Account'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />
          <Typography sx={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to={signInLink} style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    '&:hover fieldset': { borderColor: '#4f46e5' },
    '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
  },
  '& label.Mui-focused': { color: '#4f46e5' },
};

export default SignUp;
