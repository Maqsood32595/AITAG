import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography,
  AppBar, Toolbar, IconButton, Tooltip, Menu, MenuItem, Divider, useTheme, useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnimatedAvatar } from '../components/AnimatedAvatar';

const DRAWER_WIDTH = 260;

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();

  // Sidebar receding state: persist desktop preference
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aitag_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Mobile drawer open state
  const [mobileOpen, setMobileOpen] = useState(false);

  // User profile dropdown menu state
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(prev => !prev);
    } else {
      setCollapsed(prev => {
        const next = !prev;
        try {
          localStorage.setItem('aitag_sidebar_collapsed', String(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  };

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle/recede sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

  const handleLogout = () => {
    setUserMenuAnchor(null);
    logout();
    navigate('/signin');
  };

  const isFreelancer = user?.role === 'freelancer';
  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';

  const menuItems = isFreelancer ? [
    { text: 'Dashboard', icon: <span>📊</span>, path: '/dashboard' },
    { text: 'Analytics', icon: <span>📈</span>, path: '/analytics' },
    { text: 'Browse Tasks', icon: <span>🔍</span>, path: '/all_tasks' },
    { text: 'Workflows', icon: <span>🎬</span>, path: '/workflows' },
    { text: 'Account', icon: <span>👤</span>, path: '/account' },
  ] : isAdmin ? [
    { text: 'Dashboard', icon: <span>📊</span>, path: '/dashboard' },
    { text: 'Platform Analytics', icon: <span>📈</span>, path: '/analytics' },
    { text: 'All Tasks', icon: <span>📋</span>, path: '/all_tasks' },
    { text: 'Account', icon: <span>👤</span>, path: '/account' },
  ] : [
    { text: 'Dashboard', icon: <span>📊</span>, path: '/dashboard' },
    { text: 'Analytics', icon: <span>📈</span>, path: '/analytics' },
    { text: 'My Posted Tasks', icon: <span>📋</span>, path: '/my_tasks' },
    { text: 'Account', icon: <span>👤</span>, path: '/account' },
  ];

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 2, pb: 1, px: 2 }}>
      <Toolbar />
      <Box sx={{ overflowY: 'auto', flex: 1, mt: 1 }}>
        <List sx={{ p: 0 }}>
          {menuItems.map((item) => {
            const active = location.pathname === item.path || (item.path !== '/' && item.path !== '/freelancer' && location.pathname.startsWith(item.path));
            return (
              <ListItemButton
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '12px',
                  mb: 1,
                  py: 1.2,
                  px: 2,
                  bgcolor: active ? 'primary.50' : 'transparent',
                  color: active ? 'primary.main' : 'text.primary',
                  cursor: 'pointer !important',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    bgcolor: active ? 'primary.50' : '#f8fafc',
                    transform: 'translateX(3px)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40, fontSize: '1.2rem' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: active ? 700 : 500,
                    fontSize: '14px',
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Receding collapse trigger at bottom of sidebar (desktop only) */}
      {!isMobile && (
        <Box sx={{ pt: 1.5, pb: 1, px: 0.5, borderTop: '1px solid #f1f5f9' }}>
          <ListItemButton
            onClick={toggleSidebar}
            sx={{
              borderRadius: '10px',
              py: 0.9,
              px: 1.5,
              color: '#64748b',
              cursor: 'pointer !important',
              '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
              <ChevronLeftIcon />
            </ListItemIcon>
            <ListItemText
              primary="Collapse Sidebar"
              primaryTypographyProps={{ fontSize: '13px', fontWeight: 600 }}
            />
            <Typography
              variant="caption"
              sx={{
                bgcolor: '#e2e8f0',
                px: 0.8,
                py: 0.2,
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 700,
                color: '#475569',
              }}
            >
              Ctrl+B
            </Typography>
          </ListItemButton>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Application Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(16px)',
          color: 'text.primary',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Left: Sidebar Toggle + Brand Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={isMobile ? "Open Navigation Menu" : collapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}>
              <IconButton
                onClick={toggleSidebar}
                edge="start"
                sx={{
                  color: '#475569',
                  bgcolor: 'rgba(241,245,249,0.9)',
                  borderRadius: '10px',
                  p: 1,
                  cursor: 'pointer !important',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#e2e8f0', color: '#4f46e5' },
                }}
                aria-label="Toggle navigation drawer"
              >
                {isMobile ? <MenuIcon fontSize="small" /> : collapsed ? <MenuIcon fontSize="small" /> : <MenuOpenIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer !important',
                userSelect: 'none',
              }}
              onClick={() => navigate('/')}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
                }}
              >
                🌟
              </Box>
              <Typography variant="h6" sx={{ letterSpacing: '-0.5px', fontWeight: 800 }}>
                AITAG
              </Typography>
            </Box>
          </Box>

          {/* Right: Dashboard Role Badge + Interactive User Avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 3 } }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontWeight: 600,
                fontSize: '13px',
                bgcolor: 'rgba(79,70,229,0.06)',
                color: '#4f46e5',
                px: 1.5,
                py: 0.5,
                borderRadius: '8px',
              }}
            >
              {user?.role === 'admin' ? '🛡️ Admin Workspace' : isFreelancer ? '💼 AI Specialist Hub' : '👔 Client Portal'}
            </Typography>

            <Tooltip title={user?.name || user?.email || 'Account Menu'}>
              <Box
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                  p: 0.5,
                  pr: { xs: 0.5, sm: 1.5 },
                  borderRadius: '30px',
                  cursor: 'pointer !important',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'rgba(79,70,229,0.06)' },
                }}
              >
                <AnimatedAvatar
                  name={user?.name || user?.email}
                  size={38}
                  src={user?.photo_url}
                />
                <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', lineHeight: 1.2 }}>
                    {user?.name || 'My Account'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '11px' }}>
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>

            {/* Profile Dropdown Menu */}
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={() => setUserMenuAnchor(null)}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  borderRadius: '14px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                  border: '1px solid #e2e8f0',
                  minWidth: 220,
                  p: 0.5,
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                  {user?.name || 'User Account'}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {user?.email}
                </Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={() => { navigate('/dashboard'); setUserMenuAnchor(null); }}
                sx={{ gap: 1.5, py: 1.2, borderRadius: '8px', cursor: 'pointer !important', '&:hover': { color: '#4f46e5' } }}
              >
                <DashboardIcon fontSize="small" /> Dashboard
              </MenuItem>
              <MenuItem
                onClick={() => { navigate('/analytics'); setUserMenuAnchor(null); }}
                sx={{ gap: 1.5, py: 1.2, borderRadius: '8px', cursor: 'pointer !important', '&:hover': { color: '#4f46e5' } }}
              >
                <TrendingUpIcon fontSize="small" /> Analytics & Dossier
              </MenuItem>
              <MenuItem
                onClick={() => { navigate('/account'); setUserMenuAnchor(null); }}
                sx={{ gap: 1.5, py: 1.2, borderRadius: '8px', cursor: 'pointer !important', '&:hover': { color: '#4f46e5' } }}
              >
                <AccountCircleIcon fontSize="small" /> Account Dossier
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={handleLogout}
                sx={{ gap: 1.5, py: 1.2, borderRadius: '8px', color: '#ef4444', cursor: 'pointer !important', '&:hover': { bgcolor: 'rgba(239,68,68,0.06)' } }}
              >
                <LogoutIcon fontSize="small" /> Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Receding Sidebar Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              borderRight: '1px solid #e2e8f0',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="persistent"
          open={!collapsed}
          sx={{
            width: !collapsed ? DRAWER_WIDTH : 0,
            flexShrink: 0,
            transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid #e2e8f0',
              bgcolor: 'background.paper',
              transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Application Workspace */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 2.5, sm: 3.5, md: 4.5 },
          width: {
            xs: '100%',
            md: !collapsed ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          },
          transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1), margin 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
        }}
      >
        <Toolbar />
        <Box sx={{ flex: 1, width: '100%' }}>
          {children}
        </Box>

        {/* Clean In-Dashboard Contained Footer (Never overlaps or gets obscured) */}
        <Box
          component="footer"
          sx={{
            mt: 'auto',
            pt: 6,
            pb: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            borderTop: '1px solid #e2e8f0',
            color: '#94a3b8',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#10b981',
                boxShadow: '0 0 8px rgba(16,185,129,0.6)',
              }}
            />
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              © {new Date().getFullYear()} AITAG • Decentralized AI Service Ecosystem • Systems Operational
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2.5 }}>
            <Typography
              component="span"
              variant="caption"
              onClick={() => navigate('/analytics')}
              sx={{
                color: '#64748b',
                cursor: 'pointer !important',
                fontWeight: 600,
                '&:hover': { color: '#4f46e5' },
              }}
            >
              Platform Analytics
            </Typography>
            <Typography
              component="span"
              variant="caption"
              onClick={() => navigate('/all_tasks')}
              sx={{
                color: '#64748b',
                cursor: 'pointer !important',
                fontWeight: 600,
                '&:hover': { color: '#4f46e5' },
              }}
            >
              Browse Tasks
            </Typography>
            <Typography
              component="span"
              variant="caption"
              onClick={() => navigate('/talent')}
              sx={{
                color: '#64748b',
                cursor: 'pointer !important',
                fontWeight: 600,
                '&:hover': { color: '#4f46e5' },
              }}
            >
              Verified Talent
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
