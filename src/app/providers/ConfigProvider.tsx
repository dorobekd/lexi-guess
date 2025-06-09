"use client";
import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { DEFAULT_CONFIG, LexiGuessConfig } from '../components/config';

type ConfigContextType = {
  config: LexiGuessConfig;
  saveConfig: (newConfig: LexiGuessConfig) => Promise<void>;
};

const ConfigContext = createContext<ConfigContextType>({
  config: DEFAULT_CONFIG,
  saveConfig: async () => {},
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
  const [config, setConfig] = useState<LexiGuessConfig>(DEFAULT_CONFIG);

  const saveConfig = useCallback(async (newConfig: LexiGuessConfig) => {
    setConfig(newConfig);
  }, []);

  return (
    <ConfigContext.Provider value={{ config, saveConfig }}>
      {children}
    </ConfigContext.Provider>
  );
} 