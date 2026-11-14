import React from 'react';
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
  Grid
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PolicyIcon from '@mui/icons-material/Policy';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Navbar from '../components/Navbar';

export const PrivacyPolicy: React.FC = () => {
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
              Privacy Policy
            </Typography>
          </Breadcrumbs>

          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Chip
              icon={<SecurityIcon sx={{ fontSize: '18px !important', color: '#4f46e5' }} />}
              label="✦ TRUST & DATA PRIVACY"
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
              label="DPDP Act 2023 & IT Act Compliant"
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
            AITAG{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Privacy Policy.
            </Box>
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '1rem', md: '1.12rem' },
              color: '#475569',
              lineHeight: 1.6,
              fontFamily: 'Inter, sans-serif',
              maxWidth: 780,
              mb: 2,
            }}
          >
            Your privacy and intellectual property are our highest priorities. This policy outlines how AITAG collects, protects, processes, and respects your data in accordance with the Indian Information Technology Act 2000, Digital Personal Data Protection Act 2023, and global standards.
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
            Last updated: November 14, 2026 • Effective Date: November 14, 2026
          </Typography>
        </Container>
      </Box>

      {/* Main Content Body */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid container spacing={4}>
          {/* Quick Summary Sidebar */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 100 } }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: '20px',
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                }}
              >
                <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 800, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'Inter, sans-serif' }}>
                  <VerifiedUserIcon sx={{ color: '#4f46e5' }} /> Privacy Commitments
                </Typography>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography sx={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.92rem', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} /> 100% Commercial IP Ownership
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>
                      All deliverables created for your business belong entirely to you once payment is completed.
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#f1f5f9' }} />
                  <Box>
                    <Typography sx={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.92rem', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} /> Zero Public Model Training
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>
                      Your proprietary assets, private briefs, and customer data are never used to train public foundation models.
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#f1f5f9' }} />
                  <Box>
                    <Typography sx={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.92rem', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} /> Bank-Grade Encryption
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>
                      Data is encrypted in transit (TLS 1.3) and at rest (AES-256) hosted on secure Indian cloud infrastructure.
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#f1f5f9' }} />
                  <Box>
                    <Typography sx={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.92rem', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} /> DPO & Quick Redressal
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>
                      Dedicated Grievance Officer with guaranteed response within 48 business hours.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          </Grid>

          {/* Legal Text Sections */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                borderRadius: '20px',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                '& section': { mb: 5 }
              }}
            >
              {/* Section 1 */}
              <section>
                <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.45rem' }, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.4px', mb: 2 }}>
                  1. Information We Collect
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75, mb: 2 }}>
                  We collect information necessary to facilitate seamless connections between business clients and verified AI specialists:
                </Typography>
                <Box component="ul" sx={{ pl: 3, color: '#334155', fontSize: '0.975rem', lineHeight: 1.85, '& li': { mb: 1.2 } }}>
                  <li><strong>Account Information:</strong> Name, business name, email address, phone number, and authentication credentials provided during registration.</li>
                  <li><strong>Project Briefs & Creative Assets:</strong> Brand guidelines, logos, product photos, audio/video reference files, and project descriptions uploaded to deliver requested services.</li>
                  <li><strong>Transaction & Payment Records:</strong> Billing address, transaction reference IDs, and payment statuses via verified payment gateways (Razorpay, UPI). We do not store raw credit/debit card numbers or UPI MPINs on our servers.</li>
                  <li><strong>Technical & Usage Data:</strong> IP address, device type, browser information, and interaction logs collected automatically for system diagnostics, fraud prevention, and performance optimization.</li>
                </Box>
              </section>

              <Divider sx={{ borderColor: '#f1f5f9', mb: 4 }} />

              {/* Section 2 */}
              <section>
                <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.45rem' }, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.4px', mb: 2 }}>
                  2. How We Use Your Information
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75, mb: 2 }}>
                  Your data is used exclusively to operate, maintain, and deliver the AITAG marketplace services:
                </Typography>
                <Box component="ul" sx={{ pl: 3, color: '#334155', fontSize: '0.975rem', lineHeight: 1.85, '& li': { mb: 1.2 } }}>
                  <li>Matching your project brief with certified AI specialists equipped with the relevant tool stack.</li>
                  <li>Safeguarding payments via milestone escrow holding until service delivery approval.</li>
                  <li>Communicating project milestones, revision requests, deliverables, and security notices.</li>
                  <li>Preventing fraudulent activities, malicious submissions, and maintaining platform integrity.</li>
                  <li>Complying with statutory tax reporting requirements (including Section 194-O of the Indian Income Tax Act where applicable).</li>
                </Box>
              </section>

              <Divider sx={{ borderColor: '#f1f5f9', mb: 4 }} />

              {/* Section 3 */}
              <section>
                <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.45rem' }, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.4px', mb: 2 }}>
                  3. AI Workflows, Privacy Shield & Intellectual Property
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75, mb: 2 }}>
                  As an AI enablement platform, AITAG enforces strict data handling safeguards:
                </Typography>
                <Box component="ul" sx={{ pl: 3, color: '#334155', fontSize: '0.975rem', lineHeight: 1.85, '& li': { mb: 1.2 } }}>
                  <li><strong>Zero Public Model Training:</strong> Any proprietary media, business trade secrets, or client uploads provided as part of an order brief are strictly confidential and are never fed into public training pipelines.</li>
                  <li><strong>Commercial IP Transfer:</strong> Upon final milestone completion and client sign-off, all intellectual property rights for the delivered files (logos, code, imagery, video reels) transfer unconditionally to the client.</li>
                  <li><strong>Specialist Confidentiality:</strong> All verified AI freelancers on AITAG agree to rigorous non-disclosure agreements (NDAs) prohibiting the unauthorized retention or repurposing of client assets.</li>
                </Box>
              </section>

              <Divider sx={{ borderColor: '#f1f5f9', mb: 4 }} />

              {/* Section 4 */}
              <section>
                <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.45rem' }, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.4px', mb: 2 }}>
                  4. Data Storage & Infrastructure Security
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75, mb: 2 }}>
                  AITAG hosts its backend services and databases in high-security Google Cloud (GCP) and Supabase data centers adhering to SOC 2 Type II and ISO 27001 certifications.
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75 }}>
                  All network traffic is encrypted via TLS 1.3 with automated HSTS. Database records and sensitive tokens are encrypted at rest with AES-256 standards. Routine security scans, rate limiting, and automated bot defenses protect against unauthorized access.
                </Typography>
              </section>

              <Divider sx={{ borderColor: '#f1f5f9', mb: 4 }} />

              {/* Section 5 */}
              <section>
                <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.45rem' }, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.4px', mb: 2 }}>
                  5. Third-Party Service Providers
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75, mb: 2 }}>
                  We share minimal, strictly scoped data with vetted third-party infrastructure providers necessary to power our service:
                </Typography>
                <Box component="ul" sx={{ pl: 3, color: '#334155', fontSize: '0.975rem', lineHeight: 1.85, '& li': { mb: 1.2 } }}>
                  <li><strong>Payment Gateways:</strong> Razorpay Software Private Limited (PCI-DSS Level 1 compliant) for secure UPI, net banking, and card processing.</li>
                  <li><strong>Cloud Infrastructure:</strong> Google Cloud Platform (GCP) for containerized hosting and Google Cloud Storage for media assets.</li>
                  <li><strong>Authentication & Database:</strong> Supabase Inc. for cryptographic user session management and row-level security (RLS).</li>
                </Box>
              </section>

              <Divider sx={{ borderColor: '#f1f5f9', mb: 4 }} />

              {/* Section 6 */}
              <section>
                <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.45rem' }, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.4px', mb: 2 }}>
                  6. Your Rights & Data Rectification
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75, mb: 2 }}>
                  Under applicable laws, including the Digital Personal Data Protection Act 2023, you retain full rights regarding your personal information:
                </Typography>
                <Box component="ul" sx={{ pl: 3, color: '#334155', fontSize: '0.975rem', lineHeight: 1.85, '& li': { mb: 1.2 } }}>
                  <li><strong>Right to Access & Rectify:</strong> You may request a complete export of your personal information or update inaccurate data at any time via your account profile.</li>
                  <li><strong>Right to Erasure:</strong> You may request permanent deletion of your account and associated project history, subject to statutory record-retention obligations (e.g., tax receipts).</li>
                  <li><strong>Right to Withdraw Consent:</strong> You may opt out of non-essential communications by clicking unsubscribe links or notifying support.</li>
                </Box>
              </section>

              <Divider sx={{ borderColor: '#f1f5f9', mb: 4 }} />

              {/* Section 7 */}
              <section>
                <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.45rem' }, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.4px', mb: 2 }}>
                  7. Grievance Redressal Officer & Contact
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75, mb: 2 }}>
                  In accordance with the Information Technology Act 2000 and rules made thereunder, the contact details of the Grievance Redressal Officer for AITAG are provided below:
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '16px'
                  }}
                >
                  <Typography sx={{ color: '#1e3a8a', fontWeight: 800, fontSize: '1rem', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SupportAgentIcon sx={{ color: '#2563eb' }} /> Grievance Officer, AITAG Technologies
                  </Typography>
                  <Typography sx={{ color: '#334155', fontSize: '0.925rem', mb: 0.5 }}>
                    <strong>Email:</strong> <Link href="mailto:support@aitag.in" sx={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>support@aitag.in</Link>
                  </Typography>
                  <Typography sx={{ color: '#475569', fontSize: '0.875rem', mb: 0.5 }}>
                    <strong>Response Time:</strong> Within 48 business hours
                  </Typography>
                  <Typography sx={{ color: '#475569', fontSize: '0.875rem' }}>
                    <strong>Operating Jurisdiction:</strong> Bengaluru, Karnataka, India
                  </Typography>
                </Paper>
              </section>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
