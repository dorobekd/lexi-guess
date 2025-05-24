"use client";
import { createContext, useContext, ReactNode } from 'react';
import { WordliConfig } from '../components/config';
import { useConfig } from '../hooks/useConfig';

type ConfigContextType = {
  config: WordliConfig;
  loading: boolean;
  error: Error | null;
  saveConfig: (newConfig: WordliConfig) => Promise<void>;
};

const ConfigContext = createContext<ConfigContextType | null>(null);

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

  return (
    <ConfigContext.Provider value={configState}>
      {children}
    </ConfigContext.Provider>
  );
} 