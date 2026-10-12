import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ServicePackagesSection from '../components/ServicePackagesSection';

const Home: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />
      <HeroSection />
      <ServicePackagesSection />
    </Box>
  );
};

export default Home;
