import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, TextField, Button,
  Alert, Divider, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import Navbar from '../components/Navbar';

const API_BASE = import.meta.env.VITE_API_URL || '';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      return setError('Reset token is missing or invalid. Please request a new link.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }
    if (!/[A-Z]/.test(password)) {
      return setError('Password must contain at least one uppercase letter (e.g. A-Z).');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match. Please re-check.');
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      setSuccess(true);
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
          {success ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <CheckCircleIcon sx={{ color: '#10b981', fontSize: 36 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                Password Reset!
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.88rem', mb: 3 }}>
                Your password has been securely updated. You can now sign in with your new credentials.
              </Typography>
              <Button
                component={Link}
                to="/signin"
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                  fontWeight: 700,
                  borderRadius: '12px',
                  py: 1.4,
                  boxShadow: '0 6px 20px rgba(79,70,229,0.3)',
                }}
              >
                Go to Sign In
              </Button>
            </Box>
          ) : !token ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Alert severity="warning" sx={{ borderRadius: '10px', mb: 2.5, textAlign: 'left' }}>
                Reset token is missing or has expired. Please request a new password reset link.
              </Alert>
              <Button
                component={Link}
                to="/forgot-password"
                variant="contained"
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                  fontWeight: 700,
                  borderRadius: '12px',
                  py: 1.3,
                }}
              >
                Request New Reset Link
              </Button>
            </Box>
          ) : (
            <>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.4px' }}
              >
                Set New Password
              </Typography>
              <Typography sx={{ color: '#64748b', mb: 2.5, fontSize: '0.85rem' }}>
                Choose a strong new password for your AITAG account.
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="New Password (min 6 chars, 1 uppercase)"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          onMouseDown={e => e.preventDefault()}
                          edge="end"
                          size="small"
                          sx={{ color: '#64748b', '&:hover': { color: '#4f46e5' } }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />

                <TextField
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          onMouseDown={e => e.preventDefault()}
                          edge="end"
                          size="small"
                          sx={{ color: '#64748b', '&:hover': { color: '#4f46e5' } }}
                        >
                          {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
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
                  disabled={loading || !password || !confirmPassword}
                  sx={{
                    mt: 1,
                    background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                    fontWeight: 700,
                    borderRadius: '12px',
                    py: 1.5,
                    boxShadow: '0 6px 20px rgba(79,70,229,0.3)',
                    '&:hover': { boxShadow: '0 8px 28px rgba(79,70,229,0.4)' },
                  }}
                >
                  {loading ? 'Updating password...' : 'Update Password'}
                </Button>
              </Box>

              <Divider sx={{ my: 2.5 }} />
              <Typography sx={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
                Remember your password?{' '}
                <Link to="/signin" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
                  Sign In
                </Link>
              </Typography>
            </>
          )}
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

export default ResetPassword;
