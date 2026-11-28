import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

const PrivateRoute = ({ children, allowedRoles, redirectTo = '/talent' }: PrivateRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isRoleForbidden = Boolean(
    user &&
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role || '')
  );

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
    } else if (!loading && isRoleForbidden) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, isRoleForbidden, redirectTo, navigate, location]);

  if (loading || !user || isRoleForbidden) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#4f46e5' }} />
      </Box>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;
