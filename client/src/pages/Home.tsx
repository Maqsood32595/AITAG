import React from 'react';
import { Box } from '@mui/material';
import HeroSection from '../components/HeroSection';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <Box>
      <Navbar />
      <HeroSection />
    </Box>
  );
};

export default Home;
