"use client";
import { createContext, useContext, ReactNode } from 'react';
import { DEFAULT_CONFIG, LexiGuessConfig } from '../components/config';
import { useConfig } from '../hooks/useConfig';
import LoadingPlaceholder from '../components/container/LoadingPlaceholder';

type ConfigContextType = {
  config: LexiGuessConfig;
  loading: boolean;
  error: Error | null;
  saveConfig: (newConfig: LexiGuessConfig) => Promise<void>;
  refreshConfig: () => Promise<void>;
};

const ConfigContext = createContext<ConfigContextType>({
  config: DEFAULT_CONFIG,
  loading: true,
  error: null,
  saveConfig: async () => {},
  refreshConfig: async () => {},
});

export function useConfigContext() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfigContext must be used within a ConfigProvider');
  }
  return context;
}

type ConfigProviderProps = {
  children: ReactNode;
};

export function ConfigProvider({ children }: ConfigProviderProps) {
  const configState = useConfig();

  if (configState.loading || !configState.config) {
    return <LoadingPlaceholder
      wordRows={DEFAULT_CONFIG.maxGuesses}
      keyboardRows={DEFAULT_CONFIG.keyboardRows.length}
    />
  }


  return (
    <ConfigContext.Provider value={configState}>
      {children}
    </ConfigContext.Provider>
  );
} 