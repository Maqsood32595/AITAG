import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import WhatWeCreateSection from '../components/WhatWeCreateSection';
import WhyChooseUsSection from '../components/WhyChooseUsSection';
import CtaBannerSection from '../components/CtaBannerSection';
import ServicePackagesSection from '../components/ServicePackagesSection';

const Home: React.FC = () => {
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
      <HeroSection />
      <WhatWeCreateSection onSelectPackage={scrollToPackages} />
      <WhyChooseUsSection />
      <CtaBannerSection onGetStarted={() => scrollToPackages()} />
      <ServicePackagesSection />
    </Box>
  );
};

export default Home;
