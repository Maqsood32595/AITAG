import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, Button, Avatar, Menu, MenuItem,
  IconButton, Divider, Tooltip, useScrollTrigger, Slide,
  Typography, Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import AnimatedAvatar from './AnimatedAvatar';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'AI Packages', to: '/#packages' },
  { label: 'Browse Tasks', to: '/all_tasks' },
  { label: 'AI Talent', to: '/talent' },
  { label: 'Blog', to: '/blog' },
  { label: 'Post a Task', to: '/add_task' },
  { label: 'My Tasks', to: '/my_tasks' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 });

  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/signin');
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.hash) {
        window.history.pushState(null, '', '/');
      }
    } else {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePackagesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.location.pathname !== '/') {
      navigate('/#packages');
      setTimeout(() => {
        const el = document.getElementById('packages');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const el = document.getElementById('packages');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', '/#packages');
      }
    }
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
          onClick={handleHomeClick}
          sx={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            mr: 4,
            cursor: 'pointer',
          }}
        >
          <img src="/small_logo.png" alt="AITAG Logo" style={{ height: 60, objectFit: 'contain' }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #0f172a 0%, #4f46e5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              ml: 1.5,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            AITAG
          </Typography>
        </Box>

        {/* Desktop Nav Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flexGrow: 1 }}>
          {NAV_LINKS.map((link) => (
            <Button
              key={link.to}
              component={Link}
              to={link.to}
              onClick={(e: React.MouseEvent) => {
                if (link.to === '/') {
                  handleHomeClick(e);
                  return;
                }
                if (link.to === '/#packages') {
                  handlePackagesClick(e);
                  return;
                }
                if (link.to === '/add_task' && user?.role === 'client') {
                  handlePackagesClick(e);
                  return;
                }
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

        {/* Auth Buttons & Mobile Menu Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' }, color: '#0f172a' }}
            onClick={(e) => setMobileMenuAnchorEl(e.currentTarget)}
          >
            <MenuIcon />
          </IconButton>
          
          <Menu
            anchorEl={mobileMenuAnchorEl}
            open={Boolean(mobileMenuAnchorEl)}
            onClose={() => setMobileMenuAnchorEl(null)}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            {NAV_LINKS.map((link) => (
              <MenuItem
                key={link.to}
                component={Link}
                to={link.to}
                onClick={(e: React.MouseEvent) => {
                  setMobileMenuAnchorEl(null);
                  if (link.to === '/') {
                    handleHomeClick(e);
                    return;
                  }
                  if (link.to === '/#packages') {
                    handlePackagesClick(e);
                    return;
                  }
                  if (link.to === '/add_task' && user?.role === 'client') {
                    handlePackagesClick(e);
                    return;
                  }
                  if (!user && (link.to === '/add_task' || link.to === '/my_tasks' || link.to === '/dashboard')) {
                    e.preventDefault();
                    navigate('/signin', { state: { error: 'You must be signed in to access this page.' }, replace: true });
                  }
                }}
              >
                {link.label}
              </MenuItem>
            ))}
          </Menu>

          {/* User Menu / Auth Buttons */}
          {user && !isAuthPage ? (
            <>
              <Tooltip title={user.name || user.email}>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5, cursor: 'pointer !important' }}>
                  <AnimatedAvatar
                    name={user.name || user.email}
                    size={36}
                    src={user.photo_url}
                  />
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
                    label={user.role === 'client' ? 'AI Services Customer' : user.role}
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
                  sx={{ gap: 1.5, py: 1.5, cursor: 'pointer !important', '&:hover': { color: '#4f46e5' } }}
                >
                  <DashboardIcon fontSize="small" /> Dashboard
                </MenuItem>
                <MenuItem
                  onClick={() => { navigate('/analytics'); setAnchorEl(null); }}
                  sx={{ gap: 1.5, py: 1.5, cursor: 'pointer !important', '&:hover': { color: '#4f46e5' } }}
                >
                  <TrendingUpIcon fontSize="small" /> Analytics & Information
                </MenuItem>
                <MenuItem
                  onClick={() => { navigate('/account'); setAnchorEl(null); }}
                  sx={{ gap: 1.5, py: 1.5, cursor: 'pointer !important', '&:hover': { color: '#4f46e5' } }}
                >
                  <AccountCircleIcon fontSize="small" /> Account Dossier
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{ gap: 1.5, py: 1.5, color: '#ef4444', cursor: 'pointer !important', '&:hover': { bgcolor: 'rgba(239,68,68,0.06)' } }}
                >
                  <LogoutIcon fontSize="small" /> Log Out
                </MenuItem>
              </Menu>
            </>
          ) : isAuthPage ? (
            location.pathname === '/signin' ? (
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
                  cursor: 'pointer !important',
                  boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(79,70,229,0.45)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Create Account
              </Button>
            ) : (
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
                  cursor: 'pointer !important',
                  '&:hover': { borderColor: '#4f46e5', bgcolor: 'rgba(79,70,229,0.04)' },
                }}
              >
                Sign In
              </Button>
            )
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
                  cursor: 'pointer !important',
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
                  cursor: 'pointer !important',
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
