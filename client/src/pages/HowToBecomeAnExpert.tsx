import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Divider,
  Breadcrumbs,
  Link,
  Chip,
  Grid,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SpeedIcon from '@mui/icons-material/Speed';
import SendIcon from '@mui/icons-material/Send';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

const DOMAIN_OPTIONS = [
  'AI Product Photo Makeover (E-commerce / Catalogues)',
  'Marketing Video & Promo Reels (Social Media Ads)',
  'Fast Business Website & Landing Page (Development / Deployment)',
  'Logo Design & Business Branding Kit (Vectors / Guidelines)',
  'Custom Enterprise AI Workflows & Automation',
];

export const HowToBecomeAnExpert: React.FC = () => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    domain: 'AI Product Photo Makeover (E-commerce / Catalogues)',
    tools: 'Flux.1, Midjourney v6, Kling AI, Runway Gen-3, ElevenLabs, Claude 3.5 Sonnet, Recraft V3, Cursor',
    portfolio_url: '',
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState<{ id: string } | null>(null);

  // Sync logged-in user details if available
  React.useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Please enter your full name');
    if (!form.email.trim() || !form.email.includes('@')) return setError('Please enter a valid email address');
    if (!form.phone.trim()) return setError('Please provide a WhatsApp phone number for orientation scheduling');
    if (!form.portfolio_url.trim()) return setError('Please share a link to your past work or portfolio (Google Drive, Behance, GitHub, etc.)');

    setLoading(true);
    try {
      const response = await fetch('/api/expert-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application. Please try again.');
      }

      setSuccessResult({
        id: data.applicationId || `APP-${Date.now().toString().slice(-6)}`
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      {/* Hero Header */}
      <Box
        sx={{
          pt: { xs: 12, md: 15 },
          pb: { xs: 6, md: 8 },
          background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Container maxWidth="lg">
          <Breadcrumbs sx={{ mb: 3, '& .MuiBreadcrumbs-separator': { color: '#94a3b8' } }}>
            <Link component={RouterLink} to="/" underline="hover" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
              Home
            </Link>
            <Typography sx={{ color: '#4f46e5', fontSize: '0.875rem', fontWeight: 600 }}>
              How to Become an Expert
            </Typography>
          </Breadcrumbs>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            <Chip
              icon={<SchoolIcon sx={{ fontSize: '18px !important', color: '#4f46e5' }} />}
              label="✦ SPECIALIST ONBOARDING & TRAINING"
              size="small"
              sx={{
                bgcolor: 'rgba(79, 70, 229, 0.08)',
                color: '#4f46e5',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                fontWeight: 800,
                fontSize: '0.75rem',
                letterSpacing: '0.6px',
                borderRadius: '20px',
              }}
            />
            <Chip
              label="1-Week Structured Program"
              size="small"
              sx={{
                bgcolor: 'rgba(16, 185, 129, 0.08)',
                color: '#059669',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontWeight: 700,
                fontSize: '0.75rem',
                borderRadius: '20px',
              }}
            />
          </Stack>

          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.4rem' },
              lineHeight: 1.15,
              color: '#0f172a',
              letterSpacing: '-1.2px',
              fontFamily: 'Inter, sans-serif',
              mb: 2,
            }}
          >
            How to Become an AITAG{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Verified Specialist.
            </Box>
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '1rem', md: '1.12rem' },
              color: '#475569',
              lineHeight: 1.6,
              fontFamily: 'Inter, sans-serif',
              maxWidth: 780,
              mb: 3,
            }}
          >
            AITAG connects talented AI creators with small businesses across India. Join our curated network of AI specialists to receive ready customer orders with upfront escrow payment protection.
          </Typography>

          {/* Specialist Economics & Transparency Banner */}
          <Grid container spacing={2} sx={{ mb: 4, maxWidth: 900 }}>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 2.2, bgcolor: '#ffffff', borderRadius: '14px', border: '1.5px solid #bbf7d0', textAlign: 'center', boxShadow: '0 4px 14px rgba(16,185,129,0.08)' }}>
                <Typography sx={{ color: '#059669', fontWeight: 900, fontSize: '1.5rem', lineHeight: 1 }}>80%</Typography>
                <Typography sx={{ color: '#0f172a', fontSize: '0.825rem', fontWeight: 700, mt: 0.5 }}>Net Take-Home Pay</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.72rem', mt: 0.2 }}>20% total fee & tax</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 2.2, bgcolor: '#ffffff', borderRadius: '14px', border: '1.5px solid #bfdbfe', textAlign: 'center', boxShadow: '0 4px 14px rgba(37,99,235,0.08)' }}>
                <Typography sx={{ color: '#2563eb', fontWeight: 900, fontSize: '1.5rem', lineHeight: 1 }}>100% Free</Typography>
                <Typography sx={{ color: '#0f172a', fontSize: '0.825rem', fontWeight: 700, mt: 0.5 }}>Zero Joining Fees</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.72rem', mt: 0.2 }}>No bidding credits</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 2.2, bgcolor: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
                <Typography sx={{ color: '#4f46e5', fontWeight: 900, fontSize: '1.5rem', lineHeight: 1 }}>24h Payout</Typography>
                <Typography sx={{ color: '#0f172a', fontSize: '0.825rem', fontWeight: 700, mt: 0.5 }}>Fast Direct Disbursal</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.72rem', mt: 0.2 }}>Direct to UPI / Bank</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 2.2, bgcolor: '#ffffff', borderRadius: '14px', border: '1.5px solid #fed7aa', textAlign: 'center', boxShadow: '0 4px 14px rgba(234,88,12,0.08)' }}>
                <Typography sx={{ color: '#ea580c', fontWeight: 900, fontSize: '1.5rem', lineHeight: 1 }}>Capped</Typography>
                <Typography sx={{ color: '#0f172a', fontSize: '0.825rem', fontWeight: 700, mt: 0.5 }}>1–2 Revisions Max</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.72rem', mt: 0.2 }}>No endless free work</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            size="large"
            onClick={() => {
              document.getElementById('application-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            sx={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
              fontWeight: 700,
              borderRadius: '12px',
              px: 3.5,
              py: 1.4,
              boxShadow: '0 4px 16px rgba(79, 70, 229, 0.25)',
              '&:hover': { boxShadow: '0 6px 20px rgba(79, 70, 229, 0.35)' }
            }}
          >
            Apply as Specialist ↓
          </Button>
        </Container>
      </Box>

      {/* Main Content Body */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Grid container spacing={4}>
          {/* Left Column: The 1-Week Training Breakdown & Standards */}
          <Grid item xs={12} md={7}>
            {/* Section 1: Why 1-Week Training? */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: '20px',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                mb: 4
              }}
            >
              <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, mb: 1.5, fontFamily: 'Inter, sans-serif' }}>
                Why a 1-Week Orientation is Mandatory
              </Typography>
              <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75, mb: 2 }}>
                Our customers are small business owners, retail merchants, local service providers, and startup founders. They do not know prompt syntax, seed numbers, or model architectures. They need clean, ready-to-use business deliverables:
              </Typography>
              <Box component="ul" sx={{ pl: 3, color: '#334155', fontSize: '0.95rem', lineHeight: 1.85, mb: 2, '& li': { mb: 1 } }}>
                <li><strong>Clear Formats:</strong> Transparent PNG cutouts, 4K video reels with commercial audio licenses, responsive landing pages, and vector SVG logos.</li>
                <li><strong>Turnaround Punctuality:</strong> Most pilot packages have a guaranteed 24 to 48-hour delivery window.</li>
                <li><strong>Commercial Cleanliness:</strong> Zero third-party trademark infringement or unvetted stock media.</li>
              </Box>
              <Typography sx={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.7 }}>
                The 1-week orientation is not academic theory. It is a practical, hands-on walkthrough of the exact workflows, quality inspection checklists, and escrow milestones used on AITAG daily.
              </Typography>
            </Paper>

            {/* Section 2: 7-Day Curriculum Breakdown */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: '20px',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                mb: 4
              }}
            >
              <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, mb: 2.5, fontFamily: 'Inter, sans-serif' }}>
                The 1-Week Training Roadmap
              </Typography>

              <Stack spacing={3}>
                <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <Typography sx={{ color: '#4f46e5', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', mb: 0.5 }}>
                    Days 1 & 2: Service Scoping & Brief Translation
                  </Typography>
                  <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem', mb: 1 }}>
                    Deconstructing Everyday Business Briefs
                  </Typography>
                  <Typography sx={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.65 }}>
                    Learn how AITAG’s four launch service tiers are structured. Practice reading raw, unstructured client messages (e.g., WhatsApp audio notes, mobile photos) and converting them into clear technical execution plans.
                  </Typography>
                </Box>

                <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <Typography sx={{ color: '#4f46e5', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', mb: 0.5 }}>
                    Days 3 & 4: Production Standards & Quality Assurance
                  </Typography>
                  <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem', mb: 1 }}>
                    Deliverable Specifications & Licensing
                  </Typography>
                  <Typography sx={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.65 }}>
                    Execute hands-on exercises covering exact file deliverables: 300 DPI print-ready exports, web-optimized WebP imagery, mobile aspect ratios (9:16), clean CSS/HTML code, and commercial IP safety.
                  </Typography>
                </Box>

                <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <Typography sx={{ color: '#4f46e5', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', mb: 0.5 }}>
                    Days 5 & 6: Case Simulations & Escrow Governance
                  </Typography>
                  <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem', mb: 1 }}>
                    Mock Client Orders & Revision Handling
                  </Typography>
                  <Typography sx={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.65 }}>
                    Simulate real order lifecycles in the AITAG sandbox: communicating milestone progress, handling client revision requests calmly, meeting delivery deadlines, and understanding escrow release rules.
                  </Typography>
                </Box>

                <Box sx={{ p: 2.5, bgcolor: '#f0fdf4', borderRadius: '14px', border: '1px solid #bbf7d0' }}>
                  <Typography sx={{ color: '#059669', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase', mb: 0.5 }}>
                    Day 7: Final Review & Specialist Verification
                  </Typography>
                  <Typography sx={{ color: '#065f46', fontWeight: 700, fontSize: '1rem', mb: 1 }}>
                    Portfolio Sign-off & Account Activation
                  </Typography>
                  <Typography sx={{ color: '#047857', fontSize: '0.9rem', lineHeight: 1.65 }}>
                    Admin review of your submitted simulation outputs. Upon approval, your account receives the official "Verified AI Specialist" badge, unlocks direct project matching, and is listed in the AI Talent Directory.
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Section 3: Prerequisites */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: '20px',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                mb: 4
              }}
            >
              <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, mb: 1.5, fontFamily: 'Inter, sans-serif' }}>
                What We Look for in Specialists
              </Typography>
              <Stack spacing={1.5}>
                <Typography sx={{ color: '#334155', fontSize: '0.925rem' }}>
                  ✓ <strong>Hands-on AI Tool Skills:</strong> Practical experience with tools like Flux.1, Midjourney v6, Kling, Runway Gen-3, Claude 3.5, or Recraft V3.
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.925rem' }}>
                  ✓ <strong>Fast Delivery:</strong> Ready to deliver standard tasks in 24 to 48 hours.
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.925rem' }}>
                  ✓ <strong>Simple Communication:</strong> Friendly, clear updates without confusing clients with technical prompt jargon.
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.925rem' }}>
                  ✓ <strong>Commercial Quality:</strong> Clean file exports (transparent PNGs, print-ready SVGs, 1080p MP4s).
                </Typography>
              </Stack>
            </Paper>

            {/* Section 4: Specialist Protections & FAQs */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: '20px',
                bgcolor: '#ffffff',
                border: '1.5px solid #e0e7ff',
                boxShadow: '0 10px 30px rgba(79, 70, 229, 0.04)',
              }}
            >
              <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, mb: 2, fontFamily: 'Inter, sans-serif' }}>
                Specialist Rights & Fair Play Policy
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>
                    Can a customer reject my work without paying?
                  </Typography>
                  <Typography sx={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    No. Clients deposit 100% of the funds in advance. Revision requests are strictly limited to the package cap (1 or 2 rounds). Clients cannot cancel or withhold payment if your delivery matches the brief. AITAG moderates any scope disagreement within 72 hours.
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: '#f1f5f9' }} />
                <Box>
                  <Typography sx={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>
                    When and how do I receive payment?
                  </Typography>
                  <Typography sx={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    Payouts are disbursed automatically to your registered UPI ID or Indian bank account within 24 hours of client sign-off (or automatically after 7 days if the client does not review).
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: '#f1f5f9' }} />
                <Box>
                  <Typography sx={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>
                    Can I showcase my work in my personal portfolio?
                  </Typography>
                  <Typography sx={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    Yes! You retain full rights to display completed work in your personal portfolio, Behance, or AITAG profile (unless a client requests an active NDA in writing).
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: '#f1f5f9' }} />
                <Box>
                  <Typography sx={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>
                    Is there any minimum time commitment?
                  </Typography>
                  <Typography sx={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    None. You can work as a freelance side-income creator or take daily orders full-time. You accept orders only when you have bandwidth.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Right Column: Application Form & Google 1-Click */}
          <Grid item xs={12} md={5} id="application-section">
            <Box sx={{ position: { md: 'sticky' }, top: { md: 100 } }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: '20px',
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.05)',
                }}
              >
                <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, mb: 0.5, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.3px' }}>
                  Specialist Application
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mb: 3 }}>
                  Apply for specialist evaluation & 1-week training. Reviewed by our admin team within 48 hours.
                </Typography>

                {successResult ? (
                  <Box sx={{ p: 3, bgcolor: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 48, color: '#10b981', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ color: '#065f46', fontWeight: 800, mb: 1 }}>
                      Application Received!
                    </Typography>
                    <Typography sx={{ color: '#047857', fontSize: '0.875rem', mb: 2, lineHeight: 1.6 }}>
                      Your application has been logged under Reference ID:
                      <br />
                      <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{successResult.id}</strong>
                    </Typography>
                    <Divider sx={{ borderColor: '#bbf7d0', my: 2 }} />
                    <Typography sx={{ color: '#334155', fontSize: '0.825rem', textAlign: 'left', lineHeight: 1.6 }}>
                      • <strong>Review Time:</strong> Within 48 business hours.
                      <br />
                      • <strong>Next Step:</strong> If shortlisted, our onboarding coordinator will reach out via WhatsApp/Email with the schedule and orientation link.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {/* Google Auth Pre-fill Option if not logged in */}
                    {!user ? (
                      <Box sx={{ mb: 3 }}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mb: 1, fontWeight: 600 }}>
                          Fast-track with Google (pre-fills verified name & email):
                        </Typography>
                        <GoogleAuthButton
                          mode="signup"
                          role="client"
                          onError={err => setError(err)}
                        />
                        <Divider sx={{ my: 2.5, color: '#94a3b8', fontSize: '0.78rem' }}>
                          or enter details manually
                        </Divider>
                      </Box>
                    ) : (
                      <Alert severity="info" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.85rem' }}>
                        Applying as: <strong>{user.name}</strong> ({user.email})
                      </Alert>
                    )}

                    {error && (
                      <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.85rem' }}>
                        {error}
                      </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        label="Full Name *"
                        required
                        size="small"
                        placeholder="e.g. Rahul Sharma"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        sx={fieldStyle}
                      />

                      <TextField
                        label="Email Address *"
                        type="email"
                        required
                        size="small"
                        placeholder="e.g. rahul@example.com"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        sx={fieldStyle}
                      />

                      <TextField
                        label="WhatsApp Phone Number *"
                        required
                        size="small"
                        placeholder="e.g. +91 98765 43210"
                        helperText="Used exclusively for training schedule coordination"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        sx={fieldStyle}
                      />

                      <TextField
                        select
                        label="Primary AI Specialization *"
                        size="small"
                        value={form.domain}
                        onChange={e => setForm({ ...form, domain: e.target.value })}
                        sx={fieldStyle}
                      >
                        {DOMAIN_OPTIONS.map(opt => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: '0.875rem' }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        label="Primary Tools You Use Daily *"
                        size="small"
                        placeholder="e.g. Midjourney, Flux, Claude 3.5, Cursor, Photoshop"
                        value={form.tools}
                        onChange={e => setForm({ ...form, tools: e.target.value })}
                        sx={fieldStyle}
                      />

                      <TextField
                        label="Portfolio or Work Samples URL *"
                        required
                        size="small"
                        placeholder="e.g. Google Drive link, Behance, GitHub, or Website"
                        helperText="Provide public access to 2–3 recent outputs"
                        value={form.portfolio_url}
                        onChange={e => setForm({ ...form, portfolio_url: e.target.value })}
                        sx={fieldStyle}
                      />

                      <TextField
                        label="Brief Background (Optional)"
                        size="small"
                        multiline
                        rows={2}
                        placeholder="Share a short note on your experience with AI client work"
                        value={form.bio}
                        onChange={e => setForm({ ...form, bio: e.target.value })}
                        sx={fieldStyle}
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                        sx={{
                          mt: 1,
                          background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
                          fontWeight: 700,
                          borderRadius: '12px',
                          py: 1.4,
                          boxShadow: '0 4px 16px rgba(79, 70, 229, 0.25)',
                          '&:hover': { boxShadow: '0 6px 20px rgba(79, 70, 229, 0.35)' }
                        }}
                      >
                        {loading ? 'Submitting Application...' : 'Submit Application'}
                      </Button>

                      <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', mt: 0.5 }}>
                        🔒 Your portfolio and details are kept strictly private and used solely for specialist review.
                      </Typography>
                    </Box>
                  </>
                )}
              </Paper>
            </Box>
          </Grid>
        </Grid>
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

export default HowToBecomeAnExpert;

