import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/signin', { state: { error: 'You must be signed in to access this page.' }, replace: true });
    }
  }, [user, loading, navigate]);

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
