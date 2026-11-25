import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Link
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmailIcon from '@mui/icons-material/Email';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Link as RouterLink } from 'react-router-dom';
import Navbar from '../components/Navbar';

const WhatsAppIcon: React.FC<{ sx?: React.CSSProperties }> = ({ sx }) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="currentColor"
    style={{ ...sx }}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z" />
  </svg>
);

const SERVICE_OPTIONS = [
  'âœ¦ General Inquiry & Guidance',
  'AI Product Photo Makeover (from â‚¹999)',
  'Marketing Video & Promo Reels (from â‚¹1,499)',
  'Fast Business Website & Landing Page (from â‚¹1,999)',
  'Logo Design & Business Branding Kit (from â‚¹499)',
  'Custom Enterprise AI Deliverable',
];

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceInterest: 'âœ¦ General Inquiry & Guidance',
    subject: '',
    message: '',
    website_trap: '', // Anti-spam bot honeypot
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [inquiryRefId, setInquiryRefId] = useState<string | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('contact@aitag.in');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic frontend validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setErrorMessage('Please provide a valid email address so we can reply to you.');
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setErrorMessage('Please share a brief description of your inquiry (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit inquiry. Please try again.');
      }

      setSubmittedSuccess(true);
      setInquiryRefId(data.inquiryId || null);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      serviceInterest: 'âœ¦ General Inquiry & Guidance',
      subject: '',
      message: '',
      website_trap: '',
    });
    setSubmittedSuccess(false);
    setInquiryRefId(null);
    setErrorMessage(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />

      {/* Header Banner */}
      <Box
        sx={{
          pt: { xs: 13, md: 16 },
          pb: { xs: 6, md: 8 },
          background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
          borderBottom: '1px solid #e2e8f0',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Chip
              icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important', color: '#2563eb !important' }} />}
              label="âœ¦ DEDICATED SUPPORT & CLIENT INQUIRIES"
              sx={{
                bgcolor: 'rgba(37,99,235,0.07)',
                color: '#2563eb',
                fontWeight: 800,
                fontSize: '0.75rem',
                letterSpacing: '0.5px',
                border: '1px solid rgba(37,99,235,0.2)',
                borderRadius: '20px',
                px: 1,
                height: 30,
              }}
            />
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 900,
              fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.2rem' },
              color: '#0f172a',
              letterSpacing: '-1px',
              mb: 2,
            }}
          >
            Get in Touch with AITAG
          </Typography>

          <Typography
            sx={{
              fontFamily: 'Inter, sans-serif',
              fontSize: { xs: '1rem', md: '1.15rem' },
              color: '#475569',
              lineHeight: 1.6,
              maxWidth: 680,
              mx: 'auto',
            }}
          >
            Have questions about our curated AI packages, custom business deliverables, or need expert guidance? Send us a message and our team will get back to you within 24 hours.
          </Typography>
        </Container>
      </Box>

      {/* Main Body */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={4}>
          {/* Left Column: Inquiry Form */}
          <Grid item xs={12} md={7}>
            <Card
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
              }}
            >
              {submittedSuccess ? (
                /* Success Confirmation State */
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      bgcolor: '#ecfdf5',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2.5,
                      boxShadow: '0 0 0 8px rgba(16, 185, 129, 0.12)',
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 36 }} />
                  </Box>

                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 800,
                      color: '#0f172a',
                      mb: 1.5,
                    }}
                  >
                    Message Received Successfully!
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#475569',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      maxWidth: 480,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    Thank you, <strong>{formData.name}</strong>. Your message has been safely logged in our system. A dedicated AITAG representative will review your requirement and reach out directly to <strong>{formData.email}</strong> within 24 business hours.
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      color: '#64748b',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                      maxWidth: 480,
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    Need urgent assistance? You can also email us directly at{' '}
                    <Link href="mailto:contact@aitag.in" sx={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      contact@aitag.in
                    </Link>{' '}
                    or message us on{' '}
                    <Link href="https://wa.me/918431634113?text=Hi%20AITAG" target="_blank" rel="noopener noreferrer" sx={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      WhatsApp
                    </Link>.
                  </Typography>

                  {inquiryRefId && (
                    <Box
                      sx={{
                        display: 'inline-block',
                        bgcolor: '#f1f5f9',
                        px: 2,
                        py: 0.8,
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.8rem',
                        color: '#64748b',
                        fontFamily: 'monospace',
                        mb: 4,
                      }}
                    >
                      Reference ID: <strong>{inquiryRefId}</strong>
                    </Box>
                  )}

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    <Button
                      variant="outlined"
                      onClick={handleResetForm}
                      sx={{
                        textTransform: 'none',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 700,
                        borderColor: '#cbd5e1',
                        color: '#334155',
                        '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                        py: 1.2,
                        px: 3,
                        borderRadius: '10px',
                      }}
                    >
                      Send Another Message
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/services"
                      variant="contained"
                      sx={{
                        textTransform: 'none',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 700,
                        bgcolor: '#2563eb',
                        '&:hover': { bgcolor: '#1d4ed8' },
                        py: 1.2,
                        px: 3,
                        borderRadius: '10px',
                      }}
                    >
                      Explore Service Packages
                    </Button>
                  </Stack>
                </Box>
              ) : (
                /* Interactive Form State */
                <Box component="form" onSubmit={handleSubmit}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 800,
                        color: '#0f172a',
                        fontSize: { xs: '1.4rem', sm: '1.6rem' },
                        mb: 0.5,
                      }}
                    >
                      Send Us a Message
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}>
                      Fill in the details below and we will get back to you promptly.
                    </Typography>
                  </Box>

                  {errorMessage && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: '8px', fontSize: '0.85rem' }}>
                      {errorMessage}
                    </Alert>
                  )}

                  {/* Honeypot field (hidden from real users to deflect automated bots) */}
                  <input
                    type="text"
                    name="website_trap"
                    value={formData.website_trap}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#334155', mb: 0.8 }}>
                        Your Full Name <span style={{ color: '#ef4444' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Ramesh Kumar"
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            bgcolor: '#f8fafc',
                            '&:hover fieldset': { borderColor: '#93c5fd' },
                            '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#334155', mb: 0.8 }}>
                        Email Address <span style={{ color: '#ef4444' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            bgcolor: '#f8fafc',
                            '&:hover fieldset': { borderColor: '#93c5fd' },
                            '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#334155', mb: 0.8 }}>
                        Phone / WhatsApp (Optional)
                      </Typography>
                      <TextField
                        fullWidth
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            bgcolor: '#f8fafc',
                            '&:hover fieldset': { borderColor: '#93c5fd' },
                            '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#334155', mb: 0.8 }}>
                        Service of Interest
                      </Typography>
                      <TextField
                        fullWidth
                        select
                        name="serviceInterest"
                        value={formData.serviceInterest}
                        onChange={handleChange}
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            bgcolor: '#f8fafc',
                            '&:hover fieldset': { borderColor: '#93c5fd' },
                            '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                          },
                        }}
                      >
                        {SERVICE_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: '0.85rem' }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#334155', mb: 0.8 }}>
                        Subject (Optional)
                      </Typography>
                      <TextField
                        fullWidth
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="e.g. Quick question on delivery timelines"
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            bgcolor: '#f8fafc',
                            '&:hover fieldset': { borderColor: '#93c5fd' },
                            '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#334155', mb: 0.8 }}>
                        Your Message / Project Details <span style={{ color: '#ef4444' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        required
                        multiline
                        rows={5}
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Describe what your business needs, any reference links, or questions you have..."
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            bgcolor: '#f8fafc',
                            '&:hover fieldset': { borderColor: '#93c5fd' },
                            '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        fullWidth
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                        sx={{
                          py: 1.4,
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          fontFamily: 'Inter, sans-serif',
                          textTransform: 'none',
                          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)',
                          },
                          '&.Mui-disabled': {
                            bgcolor: '#cbd5e1',
                            color: '#94a3b8',
                          },
                        }}
                      >
                        {isSubmitting ? 'Sending Your Message...' : 'Send Message'}
                      </Button>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.8,
                          mt: 2,
                          color: '#64748b',
                          fontSize: '0.78rem',
                        }}
                      >
                        <LockOutlinedIcon sx={{ fontSize: 14, color: '#10b981' }} />
                        <span>Your contact information is strictly confidential and protected.</span>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Card>
          </Grid>

          {/* Right Column: Direct Channels, Trust Pillars, Hours & FAQ */}
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              {/* Direct Support Channels Card */}
              <Card
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #2563eb, #10b981)',
                  }}
                />

                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 800,
                    color: '#0f172a',
                    fontSize: '1.05rem',
                    mb: 0.5,
                  }}
                >
                  Direct Support Channels
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mb: 2.5 }}>
                  Prefer direct messaging over forms? Reach our team directly:
                </Typography>

                <Stack spacing={2}>
                  {/* Email Channel */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#93c5fd',
                        bgcolor: '#f0f7ff',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          bgcolor: 'rgba(37,99,235,0.1)',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <EmailIcon sx={{ fontSize: 18 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                        Official Email
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                      <Link
                        href="mailto:contact@aitag.in"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: '#2563eb',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        contact@aitag.in
                      </Link>
                      <Tooltip title={emailCopied ? 'Copied to clipboard!' : 'Copy email address'} arrow>
                        <IconButton
                          size="small"
                          onClick={handleCopyEmail}
                          sx={{
                            color: emailCopied ? '#10b981' : '#64748b',
                            bgcolor: emailCopied ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            p: 0.6,
                            '&:hover': { bgcolor: '#e2e8f0' },
                          }}
                        >
                          {emailCopied ? (
                            <CheckCircleIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <ContentCopyIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography sx={{ color: '#64748b', fontSize: '0.75rem', mt: 0.5 }}>
                      Direct routing to our core support & operations team.
                    </Typography>
                  </Box>

                  {/* WhatsApp Channel */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#86efac',
                        bgcolor: '#f0fdf4',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            bgcolor: 'rgba(16,185,129,0.1)',
                            color: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <WhatsAppIcon sx={{ fill: '#10b981' }} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                          WhatsApp Business Chat
                        </Typography>
                      </Box>
                      <Chip
                        label="Instant Chat"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          bgcolor: '#f0fdf4',
                          color: '#16a34a',
                          border: '1px solid #bbf7d0',
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                      <Typography
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: '#0f172a',
                        }}
                      >
                        +91 98860 31643
                      </Typography>
                      <Button
                        component="a"
                        href="https://wa.me/918431634113?text=Hi%20AITAG%2C%20I%20have%20an%20inquiry%20regarding%20your%20services"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        size="small"
                        startIcon={<WhatsAppIcon sx={{ fill: '#ffffff' }} />}
                        sx={{
                          bgcolor: '#16a34a',
                          color: '#ffffff',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          borderRadius: '8px',
                          px: 1.5,
                          py: 0.5,
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: '#15803d',
                            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
                          },
                        }}
                      >
                        Chat Now
                      </Button>
                    </Box>
                    <Typography sx={{ color: '#64748b', fontSize: '0.75rem', mt: 0.5 }}>
                      Fast inquiries, status checks, and project scoping.
                    </Typography>
                  </Box>
                </Stack>
              </Card>

              {/* Trust Badges Card */}
              <Card
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 800,
                    color: '#0f172a',
                    fontSize: '1.05rem',
                    mb: 2.5,
                  }}
                >
                  The AITAG Client Guarantee
                </Typography>

                <Stack spacing={2.5}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        bgcolor: 'rgba(37,99,235,0.08)',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <SpeedIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', mb: 0.2 }}>
                        Guaranteed 24-Hour Response
                      </Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        Every inquiry is personally reviewed by our operations team within 24 business hours.
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        bgcolor: 'rgba(16,185,129,0.08)',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <ShieldIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', mb: 0.2 }}>
                        100% Payment Protection
                      </Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        Payments are held safely by AITAG until your work is delivered to your satisfaction.
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        bgcolor: 'rgba(99,102,241,0.08)',
                        color: '#6366f1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <SupportAgentIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', mb: 0.2 }}>
                        Verified Human Specialists
                      </Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        You work with vetted developers and creators who utilize cutting-edge AI pipelines.
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Card>

              {/* Operating Hours Card */}
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    color: '#0f172a',
                    mb: 1.5,
                  }}
                >
                  Operating Hours & Location
                </Typography>

                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#475569', fontSize: '0.82rem' }}>
                    <AccessTimeIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                    <span>Monday â€“ Saturday: 9:00 AM â€“ 7:00 PM IST</span>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#475569', fontSize: '0.82rem' }}>
                    <LocationOnIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                    <span>Bengaluru & Hyderabad, India</span>
                  </Box>
                </Stack>
              </Card>

              {/* Quick FAQs */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ p: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      color: '#0f172a',
                    }}
                  >
                    Frequently Asked Questions
                  </Typography>
                </Box>

                <Accordion elevation={0} disableGutters sx={{ '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b' }}>
                      Can I post a requirement immediately?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                      Yes! You do not need to wait for an inquiry response. Click{' '}
                      <RouterLink to="/add_task" style={{ color: '#2563eb', fontWeight: 600 }}>
                        + Post a Requirement
                      </RouterLink>{' '}
                      to submit your brief directly into our marketplace.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Divider sx={{ borderColor: '#f1f5f9' }} />

                <Accordion elevation={0} disableGutters sx={{ '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b' }}>
                      How do revisions work?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                      Every pilot package includes revision rounds. You can request changes or prompt adjustments directly inside your order management screen.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Divider sx={{ borderColor: '#f1f5f9' }} />

                <Accordion elevation={0} disableGutters sx={{ '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b' }}>
                      Are there any hidden fees?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                      None whatsoever. All starter packages starting from â‚¹499 are flat-rate with zero hidden platform surprise fees.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact;

