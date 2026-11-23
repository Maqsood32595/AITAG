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
import GavelIcon from '@mui/icons-material/Gavel';
import HandshakeIcon from '@mui/icons-material/Handshake';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import Navbar from '../components/Navbar';

export const TermsOfService: React.FC = () => {
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
              Terms of Service
            </Typography>
          </Breadcrumbs>

          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Chip
              icon={<GavelIcon sx={{ fontSize: '18px !important', color: '#4f46e5' }} />}
              label="✦ LEGAL AGREEMENT"
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
              label="Customer & Specialist Agreement"
              size="small"
              sx={{
                bgcolor: 'rgba(59, 130, 246, 0.08)',
                color: '#2563eb',
                border: '1px solid rgba(59, 130, 246, 0.25)',
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
              Terms of Service.
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
            These Terms govern your access to and use of AITAG's website, mobile experiences, and AI talent marketplace. By accessing or using our services, you agree to be bound by these terms.
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
                  <HandshakeIcon sx={{ color: '#4f46e5' }} /> Key Highlights
                </Typography>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography sx={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.92rem', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} /> 100% Escrow Protection
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>
                      Client funds are held securely and only disbursed to specialists after milestone approval.
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#f1f5f9' }} />
                  <Box>
                    <Typography sx={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.92rem', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} /> Guaranteed Revisions
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>
                      Packages include guaranteed revision cycles to ensure deliverables match your exact expectations.
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#f1f5f9' }} />
                  <Box>
                    <Typography sx={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.92rem', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} /> Fair Dispute Guarantee
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>
                      Full refund guarantee if a specialist fails to fulfill the approved project scope.
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#f1f5f9' }} />
                  <Box>
                    <Typography sx={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.92rem', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} /> Legal Jurisdiction
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>
                      Subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India.
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
                  1. Acceptance of Terms & Eligibility
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75, mb: 2 }}>
                  By registering an account, ordering a package, or providing services through AITAG (referred to as "Platform", "we", "us", or "our"), you agree to comply with and be bound by these Terms of Service.
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75 }}>
                  You represent that you are at least 18 years of age and legally authorized to enter into binding agreements under the Indian Contract Act 1872 and applicable local laws.
                </Typography>
              </section>

              <Divider sx={{ borderColor: '#f1f5f9', mb: 4 }} />

              {/* Section 2 */}
              <section>
                <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.45rem' }, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.4px', mb: 2 }}>
                  2. Marketplace Structure & Role of AITAG
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75, mb: 2 }}>
                  AITAG operates a managed marketplace connecting businesses ("Clients") with certified freelance AI practitioners ("Specialists").
                </Typography>
                <Box component="ul" sx={{ pl: 3, color: '#334155', fontSize: '0.975rem', lineHeight: 1.85, '& li': { mb: 1.2 } }}>
                  <li><strong>Escrow Facilitator:</strong> AITAG acts as an escrow intermediary to protect both parties. Funds deposited by Clients remain secured by AITAG until milestone completion.</li>
                  <li><strong>Independent Contractors:</strong> Specialists are independent professionals and not employees, agents, or joint-venturers of AITAG.</li>
                  <li><strong>Quality Assurance:</strong> While AITAG screens and vets Specialists, Clients are encouraged to review deliverables thoroughly during the designated approval window.</li>
                </Box>
              </section>

              <Divider sx={{ borderColor: '#f1f5f9', mb: 4 }} />

              {/* Section 3 */}
              <section>
                <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.45rem' }, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.4px', mb: 2 }}>
                  3. Pricing, Payments & Milestone Escrow
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75, mb: 2 }}>
                  All prices are quoted in Indian Rupees (INR ₹) inclusive of applicable taxes unless stated otherwise.
                </Typography>
                <Box component="ul" sx={{ pl: 3, color: '#334155', fontSize: '0.975rem', lineHeight: 1.85, '& li': { mb: 1.2 } }}>
                  <li><strong>Payment Methods:</strong> Payments are processed securely via verified gateways (Razorpay, UPI, Credit/Debit cards, Net Banking).</li>
                  <li><strong>Disbursement & Commission:</strong> Escrowed funds are disbursed to the Specialist only after the Client formally approves the milestone deliverable or upon expiration of the 7-day review window without reported dispute. The platform fee is 20% inclusive of 1% statutory TDS withholding under Section 194-O, ensuring specialists receive 80% net earnings.</li>
                  <li><strong>Statutory Tax Withholding:</strong> Where mandated by law, AITAG complies with Section 194-O of the Indian Income Tax Act regarding e-commerce marketplace TDS deductions.</li>
                </Box>
              </section>

              <Divider sx={{ borderColor: '#f1f5f9', mb: 4 }} />

              {/* Section 4 */}
              <section>
                <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.45rem' }, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.4px', mb: 2 }}>
                  4. Revisions, Cancellations & Refund Guarantee
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75, mb: 2 }}>
                  We stand by the quality of our service with a transparent satisfaction policy:
                </Typography>
                <Box component="ul" sx={{ pl: 3, color: '#334155', fontSize: '0.975rem', lineHeight: 1.85, '& li': { mb: 1.2 } }}>
                  <li><strong>Standard Revisions:</strong> Every standard package includes designated revision rounds specified in the package description to refine deliverables within the original scope.</li>
                  <li><strong>Full Refund Before Approval:</strong> If a Specialist fails to begin work, abandons the order, or delivers work materially non-compliant with the agreed brief, the Client is entitled to a 100% refund of the held escrow amount.</li>
                  <li><strong>Post-Approval Finality:</strong> Once a Client formally accepts and approves a deliverable, the escrow is released and that order milestone is considered finalized and non-refundable.</li>
                  <li><strong>Dispute Resolution:</strong> If a disagreement arises regarding scope compliance, AITAG's moderation team will impartially review the brief, submitted files, and messages to issue a binding determination within 3 business days.</li>
                </Box>
              </section>

              <Divider sx={{ borderColor: '#f1f5f9', mb: 4 }} />

              {/* Section 5 */}
              <section>
                <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.45rem' }, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.4px', mb: 2 }}>
                  5. Intellectual Property Rights & Commercial License
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75, mb: 2 }}>
                  Intellectual property is transferred cleanly upon milestone payment:
                </Typography>
                <Box component="ul" sx={{ pl: 3, color: '#334155', fontSize: '0.975rem', lineHeight: 1.85, '& li': { mb: 1.2 } }}>
                  <li><strong>Client Ownership:</strong> Upon full payment release, the Client receives full, perpetual, worldwide commercial ownership and copyright of the final approved work product.</li>
                  <li><strong>Pre-Existing Tools:</strong> Specialists and AITAG retain rights in their pre-existing proprietary tools, prompt libraries, and foundational scripts, granting the Client an irrevocable license to use any embedded elements necessary for the deliverable.</li>
                  <li><strong>Portfolio Rights:</strong> Unless the Client requests non-disclosure in writing at the time of order placement, Specialists may showcase watermarked excerpts in their verified AITAG portfolios.</li>
                </Box>
              </section>

              <Divider sx={{ borderColor: '#f1f5f9', mb: 4 }} />

              {/* Section 6 */}
              <section>
                <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.45rem' }, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.4px', mb: 2 }}>
                  6. Prohibited Activities & AI Ethics
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75, mb: 2 }}>
                  Users and Specialists agree not to use the Platform to request, generate, or deliver:
                </Typography>
                <Box component="ul" sx={{ pl: 3, color: '#334155', fontSize: '0.975rem', lineHeight: 1.85, '& li': { mb: 1.2 } }}>
                  <li>Deepfakes intended to mislead, harass, impersonate individuals without consent, or defame.</li>
                  <li>Content that infringes third-party trademarks, copyrights, or trade secrets.</li>
                  <li>Adult, hate speech, violent, gambling, or unlawful material under the Indian Penal Code or IT Act.</li>
                  <li>Circumventing platform payment protections by soliciting off-platform direct transactions.</li>
                </Box>
              </section>

              <Divider sx={{ borderColor: '#f1f5f9', mb: 4 }} />

              {/* Section 7 */}
              <section>
                <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.45rem' }, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.4px', mb: 2 }}>
                  7. Governing Law & Dispute Jurisdiction
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75, mb: 2 }}>
                  These Terms are governed by and construed in accordance with the laws of India.
                </Typography>
                <Typography sx={{ color: '#334155', fontSize: '0.975rem', lineHeight: 1.75, mb: 3 }}>
                  Any disputes or claims arising out of or in connection with these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the competent civil courts in Bengaluru, Karnataka, India.
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
                    <SupportAgentIcon sx={{ color: '#2563eb' }} /> Customer Support & Legal Inquiries
                  </Typography>
                  <Typography sx={{ color: '#334155', fontSize: '0.925rem', mb: 0.5 }}>
                    <strong>Email:</strong> <Link href="mailto:contact@aitag.in" sx={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>contact@aitag.in</Link>
                  </Typography>
                  <Typography sx={{ color: '#475569', fontSize: '0.875rem' }}>
                    <strong>Headquarters:</strong> Bengaluru, Karnataka, India
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

export default TermsOfService;
