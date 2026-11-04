import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, TextField, Button,
  Alert, Divider, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

const SignUp = () => {
  const { register, logout, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If arriving on /signup, immediately clear any stale session
  React.useEffect(() => {
    if (user || localStorage.getItem('aitag_token')) {
      logout();
    }
  }, []);

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
      await register(form);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const isPasswordError = Boolean(error && error.toLowerCase().includes('password'));

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
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', mb: 1 }}>
              I want to join as:
            </Typography>
            <FormControl fullWidth sx={{ ...fieldStyle, mb: 2 }}>
              <InputLabel id="account-role-label">Account Type</InputLabel>
              <Select
                labelId="account-role-label"
                value={form.role}
                label="Account Type"
                onChange={e => setForm({ ...form, role: e.target.value })}
              >
                <MenuItem value="client">Business Owner</MenuItem>
                <MenuItem value="freelancer">AI Specialist</MenuItem>
              </Select>
            </FormControl>

            <GoogleAuthButton mode="signup" role={form.role} onError={err => setError(err)} />
          </Box>

          <Divider sx={{ mb: 2, color: '#94a3b8', fontSize: '0.8rem' }}>
            or register with email
          </Divider>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
            <TextField
              label="Full Name"
              required
              placeholder="e.g. Rahul Verma"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              sx={fieldStyle}
            />
            <TextField
              label="Email Address"
              type="email"
              required
              placeholder="e.g. rahul.verma@gmail.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
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
              helperText={
                !error
                  ? 'Min 6 characters with at least one uppercase letter (e.g. Pass123)'
                  : undefined
              }
              FormHelperTextProps={{
                sx: { color: error ? '#ef4444' : '#64748b', fontWeight: error ? 700 : 400 }
              }}
              sx={fieldStyle}
            />

            {error && (
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
    backgroundColor: '#ffffff',
    '&:hover fieldset': { borderColor: '#4f46e5' },
    '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
  },
  '& label.Mui-focused': { color: '#4f46e5' },
};

export default SignUp;
