"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '@/shared/theme';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  isSystemTheme: boolean;
  setSystemTheme: (useSystem: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

type ThemeProviderProps = {
  children: ReactNode;
};

// Custom hook for system theme detection
function useSystemTheme() {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { systemTheme, mounted };
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { systemTheme, mounted } = useSystemTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSystemTheme, setIsSystemTheme] = useState(true);
  
  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (!mounted) return;
    
    const savedTheme = localStorage.getItem('theme-preference');
    const savedSystemPreference = localStorage.getItem('use-system-theme');
    
    if (savedSystemPreference !== null) {
      const useSystem = JSON.parse(savedSystemPreference);
      setIsSystemTheme(useSystem);
      if (useSystem) {
        setIsDarkMode(systemTheme === 'dark');
      } else if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } else {
      // First visit - use system preference
      setIsDarkMode(systemTheme === 'dark');
    }
  }, [mounted, systemTheme]);

  // Update theme when system theme changes (if using system theme)
  useEffect(() => {
    if (isSystemTheme && mounted) {
      setIsDarkMode(systemTheme === 'dark');
    }
  }, [systemTheme, isSystemTheme, mounted]);

  const toggleTheme = useCallback(() => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    setIsSystemTheme(false);
    localStorage.setItem('theme-preference', newDarkMode ? 'dark' : 'light');
    localStorage.setItem('use-system-theme', 'false');
  }, [isDarkMode]);

  const setSystemTheme = useCallback((useSystem: boolean) => {
    setIsSystemTheme(useSystem);
    localStorage.setItem('use-system-theme', useSystem.toString());
    
    if (useSystem) {
      setIsDarkMode(systemTheme === 'dark');
    }
  }, [systemTheme]);

  const contextValue = useMemo(() => ({
    isDarkMode,
    toggleTheme,
    isSystemTheme,
    setSystemTheme,
  }), [isDarkMode, toggleTheme, isSystemTheme, setSystemTheme]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <MuiThemeProvider theme={lightTheme}>
        {children}
      </MuiThemeProvider>
    );
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
} 