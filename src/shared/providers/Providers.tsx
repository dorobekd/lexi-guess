"use client";

import CssBaseline from '@mui/material/CssBaseline';
import { ConfigProvider } from './ConfigProvider';
import { ThemeProvider } from './ThemeProvider';

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <CssBaseline />
      <ConfigProvider>
        {children}
      </ConfigProvider>
    </ThemeProvider>
  );
} 