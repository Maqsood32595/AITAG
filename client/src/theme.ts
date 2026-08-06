import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4f46e5', // indigo
      light: '#818cf8',
      dark: '#4338ca',
    },
    secondary: {
      main: '#0891b2', // cyan
    },
    success: {
      main: '#10b981', // emerald
    },
    warning: {
      main: '#d97706', // amber
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h5: { fontWeight: 800, letterSpacing: '-0.5px' },
    h6: { fontWeight: 700, letterSpacing: '-0.25px' },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(79,70,229,0.2)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0',
        }
      }
    }
  }
});
