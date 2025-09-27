"use client";

import CssBaseline from '@mui/material/CssBaseline';
import { ConfigProvider } from './ConfigProvider';
import { ThemeProvider } from './ThemeProvider';
import { GameStateProvider } from './GameStateProvider';
import { ErrorBoundary } from './ErrorBoundary';

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <CssBaseline />
        <ConfigProvider>
          <GameStateProvider>
            {children}
          </GameStateProvider>
        </ConfigProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
} 