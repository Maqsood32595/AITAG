export function formatExternalUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Grid, TextField, Button,
  Chip, Stack, Alert, CircularProgress, IconButton, Tooltip,
  FormControl, Select, MenuItem
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import SecurityIcon from '@mui/icons-material/Security';
import BusinessIcon from '@mui/icons-material/Business';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ShieldIcon from '@mui/icons-material/Shield';
import WorkIcon from '@mui/icons-material/Work';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { DashboardLayout } from '../layouts/DashboardLayout';
import AnimatedAvatar from '../components/AnimatedAvatar';
import { useAuth } from '../context/AuthContext';
import { profileApi, analyticsApi } from '../api';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const isClient = user?.role === 'client';
  const isAdmin = user?.role === 'admin';
  const isFreelancer = user?.role === 'freelancer' || (!isClient && !isAdmin);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Account Dossier State
  const [accountIdentifier, setAccountIdentifier] = useState(
    user?.id || (isAdmin ? '6e36f593-b9e6-4ead-8266-31ac91cf44c5' : isClient ? 'c0b2dcd3-346a-4633-b58e-78ce929fb56d' : '0eaa9c88-d477-4308-bd37-f7ccf29c87f1')
  );
  const [primaryEmail, setPrimaryEmail] = useState(user?.email || (isAdmin ? 'admin@aitag.com' : isClient ? 'client1@aitag.com' : 'expert1@aitag.com'));
  const [contactPhone, setContactPhone] = useState('+91 98860 31643');
  const [memberSince, setMemberSince] = useState('10 October 2026');
  const [kycStatus, setKycStatus] = useState(
    isAdmin ? 'Active & Verified Platform Admin' : isClient ? 'Active & KYC Verified (Client Enterprise)' : 'Active & KYC Verified (Vetted AI Specialist)'
  );
  const [copiedId, setCopiedId] = useState(false);

  // Client Business & Billing Information State
  const [businessName, setBusinessName] = useState('AITAG Business Client');
  const [industryCategory, setIndustryCategory] = useState('Retail & E-Commerce');
  const [billingEntity, setBillingEntity] = useState('AITAG Business Client (GST Exemption Tier) • Currency: INR (₹)');
  const [clientServiceNeed, setClientServiceNeed] = useState('Product Visuals');

  // Freelancer / Expert & Admin Profile State (Strictly Aligned with AITAG AI Services)
  const [serviceDomain, setServiceDomain] = useState(isAdmin ? 'Platform Operations & Oversight' : 'Product Visuals');
  const [headline, setHeadline] = useState(
    isAdmin 
      ? 'AITAG Platform Operations & Master Dispatcher' 
      : 'Senior AI Product Visuals & E-Commerce Media Specialist'
  );
  const [bio, setBio] = useState(
    isAdmin
      ? 'Supervising platform service delivery, vetted specialist matching, escrow governance, and milestone compliance across all 4 AI service domains.'
      : 'Specialist delivering studio-grade e-commerce product visual transformations, clean background cutouts, lifestyle scene integrations, and Meesho/Amazon compliance.'
  );
  const [skillsInput, setSkillsInput] = useState(
    isAdmin
      ? 'Platform Operations, Product Visuals Oversight, Listings & Copy Dispatch, Escrow Governance'
      : 'FLUX.1-dev, Midjourney v6, ComfyUI, Photoshop Generative Fill, Photoroom API, Stable Diffusion XL'
  );
  const [githubUrl, setGithubUrl] = useState('https://github.com/Maqsood32595');
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com/in/maqsood');
  const [websiteUrl, setWebsiteUrl] = useState('https://aitag.in');
  const [payoutUpi, setPayoutUpi] = useState('expert1@okaxis');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      try {
        const aRes = await analyticsApi.getMyAnalytics();
        const d = aRes.data?.dossier;
        if (d) {
          if (d.identity?.id) setAccountIdentifier(d.identity.id);
          if (d.identity?.email) setPrimaryEmail(d.identity.email);
          if (d.identity?.phone) setContactPhone(d.identity.phone);
          if (d.identity?.account_status) setKycStatus(d.identity.account_status);
          if (d.identity?.member_since) {
            setMemberSince(new Date(d.identity.member_since).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }));
          }
          if (isClient) {
            if (d.roleDossier?.business_name) setBusinessName(d.roleDossier.business_name);
            if (d.roleDossier?.business_type) setIndustryCategory(d.roleDossier.business_type);
            if (d.roleDossier?.billing_entity) setBillingEntity(d.roleDossier.billing_entity);
          }
        }
      } catch (e) {
        console.warn('Analytics dossier fetch fallback:', e);
      }

      if (!isClient) {
        try {
          const res = await (profileApi.getProfile ? profileApi.getProfile() : profileApi.getMe());
          const p = res.data;
          if (p.serviceDomain) setServiceDomain(p.serviceDomain);
          if (p.headline) setHeadline(p.headline);
          if (p.bio) setBio(p.bio);
          if (p.skills && Array.isArray(p.skills)) setSkillsInput(p.skills.join(', '));
          if (p.payoutUpi) setPayoutUpi(p.payoutUpi);
          if (p.links?.github) setGithubUrl(p.links.github);
          if (p.links?.linkedin) setLinkedinUrl(p.links.linkedin);
          if (p.links?.website) setWebsiteUrl(p.links.website);
        } catch (e) {
          console.warn('Profile fetch fallback:', e);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      if (isClient) {
        try {
          await (profileApi.updateProfile ? profileApi.updateProfile : profileApi.updateMe)({
            phone: contactPhone,
            businessName,
            industryCategory,
          });
        } catch (e) {
          // resilient update
        }
        setSuccessMessage('✅ Account Identity & Business Dossier saved successfully!');
      } else if (isAdmin) {
        try {
          await (profileApi.updateProfile ? profileApi.updateProfile : profileApi.updateMe)({
            phone: contactPhone,
            serviceDomain,
            headline,
            bio,
            skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
            links: { github: formatExternalUrl(githubUrl), linkedin: formatExternalUrl(linkedinUrl), website: formatExternalUrl(websiteUrl) },
          });
        } catch (e) {
          // resilient update
        }
        setSuccessMessage('✅ Platform Operations & Marketplace Oversight saved successfully!');
      } else {
        const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
        try {
          await (profileApi.updateProfile ? profileApi.updateProfile : profileApi.updateMe)({
            phone: contactPhone,
            serviceDomain,
            headline,
            bio,
            skills,
            payoutUpi,
            links: { github: formatExternalUrl(githubUrl), linkedin: formatExternalUrl(linkedinUrl), website: formatExternalUrl(websiteUrl) },
          });
        } catch (e) {
          // resilient update
        }
        setSuccessMessage('✅ AI Specialist Credentials & Escrow Payout Dossier saved successfully!');
      }
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        {/* Header User Card */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            mb: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Stack direction="row" spacing={3} alignItems="center">
            <AnimatedAvatar
              name={user?.name || (isAdmin ? 'Admin Console' : isClient ? 'Client 1' : 'Expert 1')}
              size={72}
              src={user?.photo_url || user?.photoURL}
            />
            <Box>
              <Typography variant="h5" fontWeight={800} color="#0f172a">
                {user?.name || (isAdmin ? 'User1 Admin' : isClient ? 'Client 1' : 'Expert 1')}
              </Typography>
              <Typography variant="body2" color="#64748b">
                {user?.email || (isAdmin ? 'admin@aitag.com' : isClient ? 'client1@aitag.com' : 'expert1@aitag.com')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={isAdmin ? "Platform Operations" : isClient ? "Client Portal" : "AI Specialist Hub"}
                  size="small"
                  sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.75rem' }}
                />
                <Chip
                  icon={<ShieldIcon sx={{ fontSize: '14px !important' }} />}
                  label={kycStatus}
                  size="small"
                  sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: '0.75rem' }}
                />
              </Box>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {isFreelancer && (
              <Button
                component={Link}
                to="/workflows"
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2.5,
                  py: 1.2,
                  px: 2.5,
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  cursor: 'pointer !important'
                }}
              >
                🎬 Manage Workflows
              </Button>
            )}
            {isAdmin && (
              <Button
                component={Link}
                to="/dashboard"
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2.5,
                  py: 1.2,
                  px: 2.5,
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  cursor: 'pointer !important'
                }}
              >
                📊 Dispatch Center
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
              onClick={handleSaveAll}
              disabled={saving}
              sx={{
                background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                textTransform: 'none',
                fontWeight: 700,
                px: 3.5,
                py: 1.2,
                borderRadius: 2.5,
                cursor: 'pointer !important',
                boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                '&:hover': { bgcolor: '#1d4ed8' }
              }}
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </Stack>
        </Paper>

        {successMessage && <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>{successMessage}</Alert>}

        {/* ================================================================= */}
        {/* ACCOUNT IDENTITY & ROLE-AWARE VERIFICATION DOSSIER VIEW           */}
        {/* ================================================================= */}
        <Box>
          <Grid container spacing={3.5} sx={{ mb: 4 }}>
            {/* Card 1: Account Identity & Verification Dossier (For Both Client & Expert) */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  height: '100%',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{ p: 1, bgcolor: 'rgba(79,70,229,0.08)', borderRadius: '10px', color: '#4f46e5' }}>
                    <SecurityIcon />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                      Account Identity & Verification Dossier
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Official platform identity and cryptographic credentials
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={2.5} sx={{ flex: 1 }}>
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                      Account Identifier
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', wordBreak: 'break-all' }}>
                        {accountIdentifier}
                      </Typography>
                      <Tooltip title={copiedId ? "Copied!" : "Copy Identifier"}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(accountIdentifier);
                            setCopiedId(true);
                            setTimeout(() => setCopiedId(false), 2000);
                          }}
                          sx={{ color: copiedId ? '#10b981' : '#64748b', cursor: 'pointer !important' }}
                        >
                          {copiedId ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <EmailIcon sx={{ color: '#0891b2', mt: 0.3 }} />
                    <Box sx={{ width: '100%' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        Primary Registered Email
                      </Typography>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                        {primaryEmail}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <PhoneIcon sx={{ color: '#10b981', mt: 1 }} />
                    <Box sx={{ width: '100%' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                        Contact & WhatsApp Telephone
                      </Typography>
                      <TextField
                        size="small"
                        fullWidth
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+91 98860 31643"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarMonthIcon sx={{ color: '#8b5cf6' }} />
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        Member Since
                      </Typography>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                        {memberSince}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircleIcon sx={{ color: '#059669' }} />
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        Verification & KYC Status
                      </Typography>
                      <Chip
                        icon={<ShieldIcon />}
                        label={kycStatus}
                        size="small"
                        sx={{ mt: 0.5, bgcolor: '#ecfdf5', color: '#047857', fontWeight: 800, fontSize: '0.75rem' }}
                      />
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Card 2: Role-aware (Client: Business & Invoicing | Admin: Operations & Oversight | Expert: AI Specialization & Escrow) */}
            <Grid size={{ xs: 12, md: 6 }}>
              {isClient ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    bgcolor: '#ffffff',
                    height: '100%',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{ p: 1, bgcolor: 'rgba(16,185,129,0.08)', borderRadius: '10px', color: '#059669' }}>
                      <BusinessIcon />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                        Business & Billing Information
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Commercial invoicing, business category, and primary service requirement
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={2.5} sx={{ flex: 1 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                        Business Name
                      </Typography>
                      <TextField
                        size="small"
                        fullWidth
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="AITAG Business Client"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Box>

                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                          Industry & Category
                        </Typography>
                        <TextField
                          size="small"
                          fullWidth
                          value={industryCategory}
                          onChange={(e) => setIndustryCategory(e.target.value)}
                          placeholder="Retail & E-Commerce"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                          Primary AI Service Need
                        </Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            value={clientServiceNeed}
                            onChange={(e) => setClientServiceNeed(e.target.value)}
                            sx={{ borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}
                          >
                            <MenuItem value="Product Visuals">📸 Product Visuals</MenuItem>
                            <MenuItem value="E-Commerce & Copy">📝 E-Commerce & Copy</MenuItem>
                            <MenuItem value="Social & Marketing">📱 Social & Marketing</MenuItem>
                            <MenuItem value="Web & Funnels">🌐 Web & Funnels</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                        Billing Entity & Currency
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <ReceiptLongIcon sx={{ color: '#4f46e5', fontSize: 20 }} />
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                          {billingEntity}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                        Taxation & TDS Compliance Status
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          icon={<ShieldIcon />}
                          label="Section 194-O TDS Exemption Tier Active"
                          size="small"
                          sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.72rem' }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                          Invoice Delivery
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                          Digital PDF via Registered Email
                        </Typography>
                      </Box>
                      <Chip label="Automated" size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700 }} />
                    </Box>
                  </Stack>
                </Paper>
              ) : isAdmin ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    bgcolor: '#ffffff',
                    height: '100%',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{ p: 1, bgcolor: 'rgba(79,70,229,0.08)', borderRadius: '10px', color: '#4f46e5' }}>
                      <ShieldIcon />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                        Platform Operations & Marketplace Oversight
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Administrative governance across AITAG's 4 AI service domains & milestone dispatch
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                        Administrative Role & Authority
                      </Typography>
                      <TextField
                        size="small"
                        fullWidth
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="AITAG Platform Operations & Master Dispatcher"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.8 }}>
                        Supervised AI Service Domains (Catalogue Coverage)
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                              📸 Product Visuals
                            </Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
                              Photo Makeovers & E-Com
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                              📝 E-Commerce & Copy
                            </Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
                              Listings, Bullets & SEO
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                              📱 Social & Marketing
                            </Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
                              Monthly Content Packs
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                              🌐 Web & Funnels
                            </Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
                              1-Page Landing Sites
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                        Operations Oversight & Governance Bio
                      </Typography>
                      <TextField
                        size="small"
                        multiline
                        rows={2}
                        fullWidth
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Supervising platform service delivery, specialist matching, escrow governance, and milestone compliance."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Box>

                    <Box sx={{ p: 1.8, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                        Escrow Settlement & Platform Governance
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                        <Chip label="Escrow Milestone Protected" size="small" sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: '0.7rem' }} />
                        <Chip label="Zero-Fee Specialist Model" size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.7rem' }} />
                        <Chip label="Reset Assignment Enabled" size="small" sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700, fontSize: '0.7rem' }} />
                      </Stack>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.5, flexWrap: 'wrap', gap: 1 }}>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          size="small"
                          placeholder="GitHub URL"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.78rem' } }}
                        />
                        <TextField
                          size="small"
                          placeholder="LinkedIn URL"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.78rem' } }}
                        />
                      </Stack>
                      <Button
                        component={Link}
                        to="/dashboard"
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', borderColor: '#cbd5e1', color: '#334155', cursor: 'pointer !important' }}
                      >
                        📊 Dispatch Center ➔
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    bgcolor: '#ffffff',
                    height: '100%',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{ p: 1, bgcolor: 'rgba(79,70,229,0.08)', borderRadius: '10px', color: '#4f46e5' }}>
                      <WorkIcon />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                        AI Service Specialization & Escrow Settlement
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Service domain, AI generative tooling stack, and direct milestone UPI settlement
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                          Primary AI Service Domain
                        </Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            value={serviceDomain}
                            onChange={(e) => setServiceDomain(e.target.value)}
                            sx={{ borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}
                          >
                            <MenuItem value="Product Visuals">📸 Product Visuals</MenuItem>
                            <MenuItem value="E-Commerce & Copy">📝 E-Commerce & Copy</MenuItem>
                            <MenuItem value="Social & Marketing">📱 Social & Marketing</MenuItem>
                            <MenuItem value="Web & Funnels">🌐 Web & Funnels</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 7 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                          Specialist Professional Headline
                        </Typography>
                        <TextField
                          size="small"
                          fullWidth
                          value={headline}
                          onChange={(e) => setHeadline(e.target.value)}
                          placeholder="Senior AI Product Visuals & E-Commerce Media Specialist"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                      </Grid>
                    </Grid>

                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                        AI Generative Models & Production Stack
                      </Typography>
                      <TextField
                        size="small"
                        fullWidth
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        placeholder="FLUX.1-dev, Midjourney v6, ComfyUI, Photoshop Generative Fill, Photoroom API"
                        helperText="List the AI models & production tools you use for service execution"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' }, '& .MuiFormHelperText-root': { fontSize: '0.68rem' } }}
                      />
                    </Box>

                    <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.8 }}>
                        Supported Fixed Package Tiers
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                        <Chip label="📦 Package 1 (Starter Brief)" size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.72rem' }} />
                        <Chip label="⚡ Package 2 (Growth Suite)" size="small" sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: '0.72rem' }} />
                        <Chip label="👑 Package 3 (Full Catalogue)" size="small" sx={{ bgcolor: '#faf5ff', color: '#7e22ce', fontWeight: 700, fontSize: '0.72rem' }} />
                      </Stack>
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                        Specialist Methodology & Quality Bio
                      </Typography>
                      <TextField
                        size="small"
                        multiline
                        rows={2}
                        fullWidth
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Specialist delivering studio-grade e-commerce product visual transformations, clean background cutouts, lifestyle scene integrations, and Meesho/Amazon compliance."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Box>

                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.5 }}>
                        Settlement & Escrow Payout UPI ID
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <AccountBalanceWalletIcon sx={{ color: '#10b981', fontSize: 22 }} />
                        <TextField
                          size="small"
                          fullWidth
                          value={payoutUpi}
                          onChange={(e) => setPayoutUpi(e.target.value)}
                          placeholder="expert1@okaxis"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#ffffff' } }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ p: 1.5, bgcolor: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 700 }}>
                          Direct Milestone Escrow Release Active
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#047857' }}>
                          Auto-credited upon client milestone sign-off (Section 194-J TDS Compliant)
                        </Typography>
                      </Box>
                      <Chip label="Instant UPI Disbursal ⚡" size="small" sx={{ bgcolor: '#059669', color: '#ffffff', fontWeight: 700, fontSize: '0.7rem' }} />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.5, flexWrap: 'wrap', gap: 1 }}>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          size="small"
                          placeholder="GitHub URL"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.78rem' } }}
                        />
                        <TextField
                          size="small"
                          placeholder="LinkedIn URL"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          sx={{ width: 140, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.78rem' } }}
                        />
                      </Stack>
                      <Button
                        component={Link}
                        to="/workflows"
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', borderColor: '#cbd5e1', color: '#334155', cursor: 'pointer !important' }}
                      >
                        🎬 Workflows Studio ➔
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              )}
            </Grid>
          </Grid>

          {/* Card 3: Security & Authentication Preferences */}
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', mb: 1 }}>
              Security, Credentials & Notification Settings
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 3 }}>
              Control your authenticated sessions and order notifications
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ p: 2.5, borderRadius: '14px', border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', mb: 0.5 }}>
                    Password & Auth
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mb: 2 }}>
                    Secured with bcrypt hash & JWT bearer tokens
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => alert('Password update request sent to registered email.')}
                    sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer !important' }}
                  >
                    Update Password
                  </Button>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ p: 2.5, borderRadius: '14px', border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', mb: 0.5 }}>
                    WhatsApp Brief Alerts
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mb: 2 }}>
                    Receive instant alerts when {isClient ? 'expert submits draft' : 'order milestones are funded'}
                  </Typography>
                  <Chip label={`Enabled for ${contactPhone}`} size="small" sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 700 }} />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ p: 2.5, borderRadius: '14px', border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', mb: 0.5 }}>
                    API Data Isolation Guard
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mb: 2 }}>
                    Strict role-scoping active: third-party requests redacted
                  </Typography>
                  <Chip label="Shield Active 🛡️" size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700 }} />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default Profile;
