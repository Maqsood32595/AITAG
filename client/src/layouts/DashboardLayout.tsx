import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, AppBar, Toolbar, Avatar, IconButton } from '@mui/material';


import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isFreelancer = location.pathname.includes('/freelancer');

  const menuItems = isFreelancer ? [
    { text: 'Find Work', icon: <span>🔍</span>, path: '/freelancer' },
    { text: 'My Proposals', icon: <span>📄</span>, path: '/freelancer/proposals' },
    { text: 'Messages', icon: <span>💬</span>, path: '/freelancer/messages' },
    { text: 'Wallet', icon: <span>💰</span>, path: '/freelancer/wallet' },
  ] : [
    { text: 'Post a Job', icon: <span>➕</span>, path: '/' },
    { text: 'My Hires', icon: <span>👥</span>, path: '/hires' },
    { text: 'Messages', icon: <span>💬</span>, path: '/messages' },
    { text: 'Escrow Funding', icon: <span>💰</span>, path: '/escrow' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', color: 'text.primary', borderBottom: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: '32px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #4f46e5, #0891b2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
              🌟
            </Box>
            <Typography variant="h6" sx={{ letterSpacing: '-0.5px', fontWeight: 800 }}>AITAG</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', fontWeight: 600, '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/')}>Client Dashboard</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer', fontWeight: 600, '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/freelancer')}>Freelancer Dashboard</Typography>
            
            <Box sx={{ display: 'flex', gap: 1, ml: 2, alignItems: 'center' }}>
              <IconButton size="small">🔔</IconButton>
              <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: '14px', fontWeight: 700, ml: 1, border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>{isFreelancer ? 'FR' : 'CL'}</Avatar>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #e2e8f0', bgcolor: 'background.paper', px: 2, pt: 2 },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 1 }}>
          <List>
            {menuItems.map((item) => {
              const active = location.pathname === item.path || (item.path !== '/' && item.path !== '/freelancer' && location.pathname.startsWith(item.path));
              return (
                <ListItem button key={item.text} onClick={() => navigate(item.path)} sx={{ borderRadius: '12px', mb: 1, py: 1.2, bgcolor: active ? 'primary.50' : 'transparent', color: active ? 'primary.main' : 'text.primary', transition: 'all 0.2s', '&:hover': { bgcolor: active ? 'primary.50' : '#f8fafc' } }}>
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 44 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: '14px' }} />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 5, overflow: 'hidden' }}>
        <Toolbar />
        <Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
};
