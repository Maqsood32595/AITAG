import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, Button, Avatar, Menu, MenuItem,
  IconButton, Divider, Tooltip, useScrollTrigger, Slide,
  Typography, Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Browse Tasks', to: '/all_tasks' },
  { label: 'AI Talent', to: '/talent' },
  { label: 'Blog', to: '/blog' },
  { label: 'Post a Task', to: '/add_task' },
  { label: 'My Tasks', to: '/my_tasks' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 });

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    navigate('/');
  };

  return (
    <AppBar
      position="fixed"
      elevation={trigger ? 4 : 0}
      sx={{
        bgcolor: trigger ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: trigger ? 'transparent' : 'rgba(79,70,229,0.1)',
        color: '#0f172a',
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar sx={{ maxWidth: 1280, mx: 'auto', width: '100%', px: { xs: 2, md: 4 } }}>
        {/* Logo */}
        <Box
          component={Link}
          to="/"
          sx={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            mr: 4,
          }}
        >
          <img src="/small_logo.png" alt="AITAG Logo" style={{ height: 64, objectFit: 'contain' }} />
        </Box>

        {/* Desktop Nav Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flexGrow: 1 }}>
          {NAV_LINKS.map((link) => (
            <Button
              key={link.to}
              component={Link}
              to={link.to}
              onClick={(e: React.MouseEvent) => {
                if (!user && (link.to === '/add_task' || link.to === '/my_tasks' || link.to === '/dashboard')) {
                  e.preventDefault();
                  navigate('/signin', { state: { error: 'You must be signed in to access this page.' }, replace: true });
                }
              }}
              sx={{
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.875rem',
                px: 2,
                borderRadius: '8px',
                '&:hover': {
                  color: '#4f46e5',
                  bgcolor: 'rgba(79,70,229,0.06)',
                },
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {link.label}
            </Button>
          ))}
        </Box>

        {/* Auth Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {user ? (
            <>
              <Tooltip title={user.name}>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                  <Avatar
                    src={user.photo_url || undefined}
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: '#4f46e5',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      border: '2px solid rgba(79,70,229,0.2)',
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(79,70,229,0.1)',
                    minWidth: 200,
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                    {user.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {user.email}
                  </Typography>
                  <Chip
                    label={user.role}
                    size="small"
                    sx={{
                      mt: 0.5,
                      bgcolor: 'rgba(79,70,229,0.1)',
                      color: '#4f46e5',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>
                <Divider />
                <MenuItem
                  onClick={() => { navigate('/dashboard'); setAnchorEl(null); }}
                  sx={{ gap: 1.5, py: 1.5, '&:hover': { color: '#4f46e5' } }}
                >
                  <DashboardIcon fontSize="small" /> Dashboard
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{ gap: 1.5, py: 1.5, color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.06)' } }}
                >
                  <LogoutIcon fontSize="small" /> Log Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                component={Link}
                to="/signin"
                variant="outlined"
                sx={{
                  borderColor: 'rgba(79,70,229,0.3)',
                  color: '#4f46e5',
                  fontWeight: 600,
                  borderRadius: '10px',
                  px: 2.5,
                  '&:hover': { borderColor: '#4f46e5', bgcolor: 'rgba(79,70,229,0.04)' },
                  display: { xs: 'none', sm: 'flex' },
                }}
              >
                Sign In
              </Button>
              <Button
                component={Link}
                to="/signup"
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: '10px',
                  px: 2.5,
                  boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(79,70,229,0.45)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Get Started
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
