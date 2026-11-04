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
    fontSize: 13, // Refined compact SaaS typography scale
    h4: { fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.4px' },
    h5: { fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.3px' },
    h6: { fontWeight: 700, fontSize: '0.98rem', letterSpacing: '-0.2px' },
    subtitle1: { fontSize: '0.88rem' },
    subtitle2: { fontSize: '0.8rem' },
    body1: { fontSize: '0.84rem' },
    body2: { fontSize: '0.78rem' },
    button: { textTransform: 'none', fontWeight: 700, fontSize: '0.8rem' },
    caption: { fontSize: '0.7rem' },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButtonBase: {
      styleOverrides: {
        root: {
          cursor: 'pointer !important',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          cursor: 'pointer !important',
          borderRadius: '8px',
          boxShadow: 'none',
          padding: '6px 14px',
          fontSize: '0.8rem',
          '&:hover': {
            boxShadow: '0 3px 10px rgba(79,70,229,0.18)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          cursor: 'pointer !important',
        }
      }
    },
    MuiLink: {
      styleOverrides: {
        root: {
          cursor: 'pointer !important',
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          cursor: 'pointer !important',
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          cursor: 'pointer !important',
          fontSize: '0.82rem',
          padding: '6px 12px',
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          cursor: 'pointer !important',
          fontSize: '0.82rem',
          minHeight: '40px',
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.72rem',
          height: '24px',
          '&.MuiChip-clickable': {
            cursor: 'pointer !important',
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0',
        }
      }
    }
  }
});
