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
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Services & Packages', to: '/services' },
  { label: 'Verified Experts', to: '/talent' },
  { label: 'Blog', to: '/blog' },
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
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleServicesClick = (e: React.MouseEvent) => {
    if (location.pathname === '/services') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleHowItWorksClick = (e: React.MouseEvent) => {
    if (location.pathname === '/how-it-works') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={trigger ? 4 : 0}
      sx={{
        bgcolor: trigger ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: trigger ? 'transparent' : 'rgba(79,70,229,0.08)',
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
            mr: 3.5,
            cursor: 'pointer',
          }}
        >
          <img src="/small_logo.png" alt="AITAG Logo" style={{ height: 44, objectFit: 'contain' }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #0f172a 0%, #4f46e5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              ml: 1.2,
              display: 'flex',
              alignItems: 'center',
              fontSize: '1.4rem',
            }}
          >
            AITAG
          </Typography>
        </Box>

        {/* Desktop Nav Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flexGrow: 1 }}>
          {NAV_LINKS.map((link) => {
            const isActive =
              link.to === '/'
                ? location.pathname === '/'
                : link.to === '/services'
                ? location.pathname === '/services' || location.pathname === '/packages'
                : location.pathname === link.to;

            return (
              <Button
                key={link.to}
                component={Link}
                to={link.to}
                onClick={(e: React.MouseEvent) => {
                  if (link.to === '/') {
                    handleHomeClick(e);
                    return;
                  }
                  if (link.to === '/services') {
                    handleServicesClick(e);
                    return;
                  }
                  if (link.to === '/how-it-works') {
                    handleHowItWorksClick(e);
                    return;
                  }
                }}
                sx={{
                  color: isActive ? '#2563eb' : '#475569',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.875rem',
                  px: 1.8,
                  borderRadius: '8px',
                  textTransform: 'none',
                  bgcolor: isActive ? 'rgba(37,99,235,0.08)' : 'transparent',
                  '&:hover': {
                    color: '#2563eb',
                    bgcolor: 'rgba(37,99,235,0.06)',
                  },
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {link.label}
              </Button>
            );
          })}
        </Box>

        {/* Right CTA / Auth Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* + Post a Requirement Button */}
          <Button
            component={Link}
            to={user ? '/add_task' : '/signin?redirect=/add_task'}
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              bgcolor: '#eff6ff',
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '0.82rem',
              borderRadius: '20px',
              px: 2,
              py: 0.7,
              textTransform: 'none',
              border: '1px solid #dbeafe',
              '&:hover': {
                bgcolor: '#dbeafe',
              },
            }}
          >
            + Post a Requirement
          </Button>

          {/* My Orders Text Link */}
          <Button
            component={Link}
            to={user ? '/my_tasks' : '/signin?redirect=/my_tasks'}
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'none',
              px: 1.2,
              '&:hover': {
                color: '#0f172a',
                bgcolor: 'transparent',
              },
            }}
          >
            My Orders
          </Button>

          {/* Mobile menu icon */}
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
                  if (link.to === '/services') {
                    handleServicesClick(e);
                    return;
                  }
                  if (link.to === '/how-it-works') {
                    handleHowItWorksClick(e);
                    return;
                  }
                }}
              >
                {link.label}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem
              component={Link}
              to={user ? '/add_task' : '/signin?redirect=/add_task'}
              onClick={() => setMobileMenuAnchorEl(null)}
            >
              + Post a Requirement
            </MenuItem>
            <MenuItem
              component={Link}
              to={user ? '/my_tasks' : '/signin?redirect=/my_tasks'}
              onClick={() => setMobileMenuAnchorEl(null)}
            >
              My Orders
            </MenuItem>
          </Menu>

          {/* User Profile or Register / Sign In Pill */}
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
                  onClick={() => { navigate('/workflows'); setAnchorEl(null); }}
                  sx={{ gap: 1.5, py: 1.5, cursor: 'pointer !important', '&:hover': { color: '#4f46e5' } }}
                >
                  <TrendingUpIcon fontSize="small" /> Workflows
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
                  background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: '24px',
                  textTransform: 'none',
                  fontSize: '0.88rem',
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
                  borderColor: '#cbd5e1',
                  color: '#0f172a',
                  fontWeight: 700,
                  borderRadius: '20px',
                  px: 2.5,
                  cursor: 'pointer !important',
                  textTransform: 'none',
                  '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                }}
              >
                Sign In
              </Button>
            )
          ) : (
            <Button
              component={Link}
              to="/signin"
              variant="outlined"
              sx={{
                borderColor: '#cbd5e1',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: '0.84rem',
                borderRadius: '20px',
                px: 2.2,
                py: 0.6,
                textTransform: 'none',
                bgcolor: '#ffffff',
                '&:hover': {
                  borderColor: '#94a3b8',
                  bgcolor: '#f8fafc',
                },
              }}
            >
              Register / Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
