import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { oauthApi } from '../api';

const DEFAULT_CLIENT_ID = '146304368488-snstqv6tulh315kh4gep22verk8gm1pe.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleAuthButtonProps {
  role?: string;
  mode?: 'signin' | 'signup';
  onError?: (err: string) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  role = 'client',
  mode = 'signin',
  onError
}) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState(DEFAULT_CLIENT_ID);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch dynamic OAuth config if available
  useEffect(() => {
    oauthApi.getConfig()
      .then(res => {
        if (res.data?.clientId) {
          setClientId(res.data.clientId);
        }
      })
      .catch(() => {});
  }, []);

  // 2. Load Google Identity Services (GIS) library
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.warn('Google Identity Services script failed to load');
    };
    document.head.appendChild(script);
  }, []);

  // 3. Initialize GIS & render official Google button
  useEffect(() => {
    if (!scriptLoaded || !window.google?.accounts?.id || !buttonRef.current) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      buttonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: mode === 'signup' ? 'signup_with' : 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 320
      });
    } catch (err: any) {
      console.warn('Error initializing Google Sign-In:', err);
    }
  }, [scriptLoaded, clientId, mode, role]);

  const handleGoogleCredentialResponse = async (response: { credential?: string }) => {
    if (!response.credential) {
      const err = 'No credential returned by Google';
      setErrorMsg(err);
      onError?.(err);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle(response.credential, role);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Google authentication failed';
      setErrorMsg(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFallbackClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setErrorMsg('Google authentication services are still loading. Please check internet connectivity.');
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      {errorMsg && (
        <Alert severity="error" sx={{ width: '100%', mb: 1, borderRadius: '10px' }}>
          {errorMsg}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CircularProgress size={24} sx={{ color: '#4f46e5' }} />
          <Box sx={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>
            Verifying Google Account...
          </Box>
        </Box>
      ) : (
        <>
          {/* Official Google GIS Button Container */}
          <Box
            ref={buttonRef}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              minHeight: '44px',
              '& > div': { width: '100% !important', display: 'flex', justifyContent: 'center' }
            }}
          />

          {/* Fallback button if GIS script is delayed or ad-blocked */}
          {!scriptLoaded && (
            <Button
              onClick={handleFallbackClick}
              fullWidth
              variant="outlined"
              size="large"
              sx={{
                py: 1.2,
                borderRadius: '12px',
                borderColor: '#e2e8f0',
                color: '#1e293b',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                '&:hover': {
                  borderColor: '#cbd5e1',
                  backgroundColor: '#f8fafc'
                },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5
              }}
            >
              <GoogleSvgIcon />
              {mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
            </Button>
          )}
        </>
      )}
    </Box>
  );
};

const GoogleSvgIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);
