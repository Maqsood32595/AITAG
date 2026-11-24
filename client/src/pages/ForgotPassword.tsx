import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, TextField, Button,
  Alert, Divider
} from '@mui/material';
import Navbar from '../components/Navbar';

const API_BASE = import.meta.env.VITE_API_URL || '';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request password reset');
      }
      setSubmitted(true);
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />
      <Container maxWidth="xs" sx={{ pt: { xs: 9, sm: 11 }, pb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: '14px',
            border: '1px solid rgba(79,70,229,0.1)',
            boxShadow: '0 4px 24px rgba(79,70,229,0.06)',
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.4px' }}
          >
            Forgot Password
          </Typography>
          <Typography sx={{ color: '#64748b', mb: 2.5, fontSize: '0.85rem' }}>
            Enter your email and we'll send you a secure link to reset your password.
          </Typography>

          {submitted ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="success" sx={{ borderRadius: '10px', fontSize: '0.875rem' }}>
                If an account exists for <strong>{email}</strong>, a password reset link has been dispatched. Please check your inbox (valid for 15 minutes).
              </Alert>

              {devResetUrl && (
                <Box sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Local Dev Shortcut:
                  </Typography>
                  <Link to={devResetUrl.replace(/http:\/\/localhost:\d+/, '')} style={{ color: '#4f46e5', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                    Open Reset Password Form →
                  </Link>
                </Box>
              )}

              <Button
                component={Link}
                to="/signin"
                variant="outlined"
                sx={{
                  mt: 1,
                  borderRadius: '12px',
                  fontWeight: 600,
                  color: '#4f46e5',
                  borderColor: '#4f46e5',
                  py: 1.2,
                }}
              >
                Back to Sign In
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Registered Email"
                type="email"
                required
                placeholder="e.g. rahul@gmail.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (error) setError('');
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
                disabled={loading || !email.trim()}
                sx={{
                  mt: 0.5,
                  background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                  fontWeight: 700,
                  borderRadius: '12px',
                  py: 1.5,
                  boxShadow: '0 6px 20px rgba(79,70,229,0.3)',
                  '&:hover': { boxShadow: '0 8px 28px rgba(79,70,229,0.4)' },
                }}
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </Button>
            </Box>
          )}

          <Divider sx={{ my: 2.5 }} />
          <Typography sx={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
            Remember your password?{' '}
            <Link to="/signin" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
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

export default ForgotPassword;
