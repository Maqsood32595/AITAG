import React from 'react';
import { Box, Container, Typography, Chip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Navbar from '../components/Navbar';
import WhatWeCreateSection from '../components/WhatWeCreateSection';
import ServicePackagesSection from '../components/ServicePackagesSection';
import PaymentTrustSection from '../components/PaymentTrustSection';
import WhyChooseUsSection from '../components/WhyChooseUsSection';
import CtaBannerSection from '../components/CtaBannerSection';

export const Services: React.FC = () => {
  const scrollToPackages = (slug?: string) => {
    const targetId = slug ? `package-${slug}` : 'packages';
    const el = document.getElementById(targetId) || document.getElementById('packages');
    if (el) {
      const navOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />

      {/* Services Header Banner */}
      <Box
        sx={{
          pt: { xs: 12, md: 15 },
          pb: { xs: 5, md: 7 },
          background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
          borderBottom: '1px solid #e2e8f0',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Chip
              icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important', color: '#2563eb !important' }} />}
              label="✦ READY-TO-ORDER PRODUCTIZED AI SERVICES"
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
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              color: '#0f172a',
              letterSpacing: '-1px',
              mb: 1.5,
            }}
          >
            Services & Curated Packages
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              color: '#475569',
              maxWidth: 680,
              mx: 'auto',
              lineHeight: 1.6,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Choose a ready-made package starting at <strong>₹499</strong> or request custom work.
            Every order includes verified AI expert execution, fast turnaround, and 100% payment escrow safety.
          </Typography>
        </Container>
      </Box>

      {/* Overview Cards (Logo, Social, Catalogue, Website) */}
      <WhatWeCreateSection onSelectPackage={scrollToPackages} />

      {/* Detailed Package Customizer & Order Brief Modal */}
      <ServicePackagesSection />

      {/* Payment Safety Escrow */}
      <PaymentTrustSection />

      {/* Why Choose Us */}
      <WhyChooseUsSection />

      {/* Bottom CTA Banner */}
      <CtaBannerSection onGetStarted={() => scrollToPackages()} />
    </Box>
  );
};

export default Services;

