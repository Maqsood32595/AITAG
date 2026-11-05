import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

interface CtaBannerSectionProps {
  onGetStarted?: () => void;
}

export const CtaBannerSection: React.FC<CtaBannerSectionProps> = ({ onGetStarted }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onGetStarted) {
      onGetStarted();
      return;
    }
    const el = document.getElementById('services') || document.getElementById('packages');
    if (el) {
      const navOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    } else {
      navigate('/services');
    }
  };

  return (
    <Box sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 8, md: 10 }, bgcolor: '#f8fafc' }}>
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3.5, sm: 4.5, md: 5 },
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #06b6d4 100%)',
            boxShadow: '0 16px 40px rgba(37,99,235,0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          {/* Left Text */}
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.45rem', sm: '1.7rem', md: '1.9rem' },
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.4px',
                mb: 0.8,
              }}
            >
              Ready to grow your business?
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.88rem', md: '0.96rem' },
                color: 'rgba(255, 255, 255, 0.92)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
              }}
            >
              Tell us what you need — we'll reply within a few hours.
            </Typography>
          </Box>

          {/* Right Button */}
          <Button
            variant="contained"
            size="large"
            onClick={handleAction}
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: '#ffffff',
              color: '#2563eb',
              fontWeight: 800,
              fontSize: '0.98rem',
              borderRadius: '24px',
              px: 4,
              py: 1.5,
              textTransform: 'none',
              boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
              flexShrink: 0,
              '&:hover': {
                bgcolor: '#f8fafc',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 24px rgba(0,0,0,0.15)',
              },
            }}
          >
            Get Started
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default CtaBannerSection;

