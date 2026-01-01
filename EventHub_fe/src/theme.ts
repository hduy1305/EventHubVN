import { createTheme, alpha } from '@mui/material/styles';

// Professional "SaaS" Palette
const palette = {
  primary: {
    main: '#2563eb', // Royal Blue
    light: '#60a5fa',
    dark: '#1e40af',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#475569', // Slate 600
    light: '#94a3b8',
    dark: '#1e293b', // Slate 800
    contrastText: '#ffffff',
  },
  success: {
    main: '#10b981',
    light: '#d1fae5',
    contrastText: '#064e3b',
  },
  warning: {
    main: '#f59e0b',
    light: '#fef3c7',
    contrastText: '#78350f',
  },
  error: {
    main: '#ef4444',
    light: '#fee2e2',
    contrastText: '#7f1d1d',
  },
  background: {
    default: '#f8fafc', // Slate 50
    paper: '#ffffff',
  },
  text: {
    primary: '#0f172a', // Slate 900
    secondary: '#64748b', // Slate 500
    disabled: '#94a3b8',
  },
  divider: '#e2e8f0', // Slate 200
};

const theme = createTheme({
  palette,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
      color: palette.text.primary,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
      color: palette.text.primary,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.01em',
      color: palette.text.primary,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: palette.text.primary,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      color: palette.text.primary,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: palette.text.primary,
    },
    subtitle1: {
      fontSize: '1rem',
      color: palette.text.primary,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: palette.text.secondary,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: palette.text.primary,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: palette.text.secondary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#94a3b8 #f1f5f9',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: '#f1f5f9',
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#94a3b8',
            minHeight: 24,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: palette.primary.main,
          '&:hover': {
            backgroundColor: palette.primary.dark,
          },
        },
        outlined: {
          borderWidth: '1px',
          '&:hover': {
            borderWidth: '1px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: `1px solid ${palette.divider}`,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // Tailwind 'shadow'
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // Tailwind 'shadow-md'
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove default MUI overlay for dark mode if strictly using light mode or custom handling
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#ffffff', 0.8),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${palette.divider}`,
          boxShadow: 'none',
          color: palette.text.primary,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: '6px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '6px',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          minWidth: '70px',
        },
      },
    },
  },
});

export default theme;