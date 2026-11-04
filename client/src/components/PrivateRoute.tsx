import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!loading && !user) {
      const currentPath = location.pathname + location.search;
      const redirectUrl = `/signin?redirect=${encodeURIComponent(currentPath)}`;
      navigate(redirectUrl, {
        state: {
          error: 'Please sign in to access this page.',
          from: currentPath,
        },
        replace: true,
      });
    }
  }, [user, loading, navigate, location]);

  if (loading || !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4f46e5' }} />
      </Box>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;
