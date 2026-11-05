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
  AccordionDetails
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
import { Link as RouterLink } from 'react-router-dom';
import Navbar from '../components/Navbar';

const SERVICE_OPTIONS = [
  '✦ General Inquiry & Guidance',
  'AI Product Photo Makeover (from ₹999)',
  'Marketing Video & Promo Reels (from ₹1,499)',
  '5-Page Static Business Website (from ₹2,499)',
  'Logo Design & Business Branding Kit (from ₹499)',
  'Custom Enterprise AI Deliverable',
];

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceInterest: '✦ General Inquiry & Guidance',
    subject: '',
    message: '',
    website_trap: '', // Anti-spam bot honeypot
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [inquiryRefId, setInquiryRefId] = useState<string | null>(null);

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
      serviceInterest: '✦ General Inquiry & Guidance',
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
              label="✦ DEDICATED SUPPORT & CLIENT INQUIRIES"
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
                      mb: 3,
                    }}
                  >
                    Thank you, <strong>{formData.name}</strong>. Your message has been safely logged in our system. A dedicated AITAG representative will review your requirement and reach out directly to <strong>{formData.email}</strong> within 24 business hours.
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

          {/* Right Column: Trust Pillars, Hours & FAQ */}
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
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
                        100% Escrow Protection
                      </Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        Funds are held safely in escrow until your deliverables meet standard specifications.
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
                    <span>Monday – Saturday: 9:00 AM – 7:00 PM IST</span>
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
                      None whatsoever. All starter packages starting from ₹499 are flat-rate with zero hidden platform surprise fees.
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
