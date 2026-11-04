import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Alert, Divider } from '@mui/material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

const SignIn = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(location.state?.error || '');
  const [loading, setLoading] = useState(false);

  // If already logged in, seamlessly forward to requested destination or dashboard
  React.useEffect(() => {
    if (user) {
      const searchParams = new URLSearchParams(location.search);
      const redirectTarget = searchParams.get('redirect') || location.state?.from;
      const fallback = (user.role === 'admin' || user.role === 'freelancer') ? '/dashboard' : '/';
      const destination = (redirectTarget && redirectTarget !== '/signin' && redirectTarget !== '/signup') ? redirectTarget : fallback;
      navigate(destination, { replace: true });
    }
  }, [user, location, navigate]);

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
      const loggedUser = await login(form.email, form.password);
      const role = loggedUser?.role;
      const searchParams = new URLSearchParams(location.search);
      const redirectTarget = searchParams.get('redirect') || location.state?.from;
      const fallback = (role === 'admin' || role === 'freelancer') ? '/dashboard' : '/';
      const destination = (redirectTarget && redirectTarget !== '/signin' && redirectTarget !== '/signup') ? redirectTarget : fallback;
      navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchParams = new URLSearchParams(location.search);
  const redirectQuery = searchParams.get('redirect');
  const signUpLink = redirectQuery ? `/signup?redirect=${encodeURIComponent(redirectQuery)}` : '/signup';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />
      <Container maxWidth="xs" sx={{ pt: { xs: 9, sm: 11 }, pb: 4 }}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: '14px', border: '1px solid rgba(79,70,229,0.1)', boxShadow: '0 4px 24px rgba(79,70,229,0.06)' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.4px' }}>
            Welcome back
          </Typography>
          <Typography sx={{ color: '#64748b', mb: 2.5, fontSize: '0.85rem' }}>
            Sign in to track your orders, tasks, and messages
          </Typography>

          {/* Google 1-Click Sign In */}
          <Box sx={{ mb: 2 }}>
            <GoogleAuthButton mode="signin" onError={err => setError(err)} />
          </Box>

          <Divider sx={{ mb: 2, color: '#94a3b8', fontSize: '0.8rem' }}>
            or continue with email
          </Divider>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
            <TextField
              label="Email"
              type="email"
              required
              placeholder="e.g. rahul.verma@gmail.com"
              value={form.email}
              onChange={e => {
                setForm({ ...form, email: e.target.value });
                if (error) setError('');
              }}
              sx={fieldStyle}
            />
            <TextField
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={e => {
                setForm({ ...form, password: e.target.value });
                if (error) setError('');
              }}
              error={Boolean(error)}
              sx={fieldStyle}
            />

            {error && (
              <Alert severity="error" sx={{ borderRadius: '10px', py: 0.5, fontSize: '0.875rem' }}>
                {error}
              </Alert>
            )}

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
            <Link to={signUpLink} style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>Create account</Link>
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
