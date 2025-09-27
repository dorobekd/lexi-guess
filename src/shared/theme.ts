import { createTheme, PaletteMode } from '@mui/material/styles';

const getThemePalette = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light' 
      ? {
          background: {
            default: '#fafafa',
            paper: '#ffffff',
          },
          primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#dc004e',
            light: '#ff5983',
            dark: '#9a0036',
            contrastText: '#ffffff',
          },
        }
      : {
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          primary: {
            main: '#90caf9',
            light: '#e3f2fd',
            dark: '#42a5f5',
            contrastText: '#000000',
          },
          secondary: {
            main: '#f48fb1',
            light: '#fce4ec',
            dark: '#c2185b',
            contrastText: '#000000',
          },
        }
    ),
  },
  typography: {
    fontFamily: [
      'var(--font-geist-sans)',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 'clamp(1.25rem, 3vw, 2rem)',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
      lineHeight: 1.4,
    },
    button: {
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      fontWeight: 500,
      textTransform: 'none' as const,
    },
  },
  shape: {
    borderRadius: 8,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          minHeight: '44px', // Touch-friendly minimum size
          '@media (max-width: 600px)': {
            minHeight: '48px', // Larger touch targets on mobile
            padding: '12px 20px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            minHeight: '44px',
            '@media (max-width: 600px)': {
              minHeight: '48px',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' 
            ? '0 2px 8px rgba(0,0,0,0.1)' 
            : '0 2px 8px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Improve text rendering on mobile
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          // Prevent zoom on input focus on iOS
          '@media screen and (max-width: 600px)': {
            fontSize: '16px',
          },
        },
      },
    },
  },
});

export const lightTheme = createTheme(getThemePalette('light'));
export const darkTheme = createTheme(getThemePalette('dark')); 