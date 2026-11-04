import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import WhatWeCreateSection from '../components/WhatWeCreateSection';
import PaymentTrustSection from '../components/PaymentTrustSection';
import WhyChooseUsSection from '../components/WhyChooseUsSection';
import CtaBannerSection from '../components/CtaBannerSection';
import ServicePackagesSection from '../components/ServicePackagesSection';

const Home: React.FC = () => {
  const location = useLocation();

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollTarget = params.get('scroll');
    const hashTarget = location.hash?.replace('#', '');
    const target = scrollTarget || hashTarget;

    if (target === 'services' || target === 'packages') {
      const timer = setTimeout(() => {
        const el = document.getElementById(target) || document.getElementById('services') || document.getElementById('packages');
        if (el) {
          const navOffset = 80;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.search, location.hash]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />
      <HeroSection />
      <WhatWeCreateSection onSelectPackage={scrollToPackages} />
      <PaymentTrustSection />
      <WhyChooseUsSection />
      <CtaBannerSection onGetStarted={() => scrollToPackages()} />
      <ServicePackagesSection />
    </Box>
  );
};

export default Home;
