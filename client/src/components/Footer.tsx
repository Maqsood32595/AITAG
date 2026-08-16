import React from 'react';
import { Box, Container, Typography, Grid, Link, Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: '#0f172a', color: '#f8fafc', py: 8, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <img src="/logo.png" alt="AITAG Logo" style={{ height: 200, objectFit: 'contain' }} />
            </Box>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 280 }}>
              Leveraging AI to reduce cost to the end customer. The smartest way to find, hire, and work with top AI talent globally.
            </Typography>
          </Grid>
          
          <Grid xs={12} sm={6} md={2}>
            <Typography sx={{ fontWeight: 700, mb: 2.5 }}>Platform</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Link href="/all_tasks" underline="none" sx={{ color: '#94a3b8', fontSize: '0.9rem', '&:hover': { color: '#fff' } }}>Browse Tasks</Link>
              <Link href="/add_task" underline="none" sx={{ color: '#94a3b8', fontSize: '0.9rem', '&:hover': { color: '#fff' } }}>Post a Task</Link>
              <Link href="/talent" underline="none" sx={{ color: '#94a3b8', fontSize: '0.9rem', '&:hover': { color: '#fff' } }}>AI Talent</Link>
            </Box>
          </Grid>
          
          <Grid xs={12} sm={6} md={2}>
            <Typography sx={{ fontWeight: 700, mb: 2.5 }}>Resources</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Link href="/blog" underline="none" sx={{ color: '#94a3b8', fontSize: '0.9rem', '&:hover': { color: '#fff' } }}>Blog</Link>
              <Link href="/all_tasks" underline="none" sx={{ color: '#94a3b8', fontSize: '0.9rem', '&:hover': { color: '#fff' } }}>Browse Tasks</Link>
              <Link href="/talent" underline="none" sx={{ color: '#94a3b8', fontSize: '0.9rem', '&:hover': { color: '#fff' } }}>AI Talent</Link>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 4 }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} AITAG Fractal Architecture. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" underline="none" sx={{ color: '#64748b', fontSize: '0.85rem', '&:hover': { color: '#fff' } }}>Privacy</Link>
            <Link href="#" underline="none" sx={{ color: '#64748b', fontSize: '0.85rem', '&:hover': { color: '#fff' } }}>Terms</Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
