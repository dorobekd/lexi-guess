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
        }
      : {
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
        }
    ),
  },
});

export const lightTheme = createTheme(getThemePalette('light'));
export const darkTheme = createTheme(getThemePalette('dark')); 