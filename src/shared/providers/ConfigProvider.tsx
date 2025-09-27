"use client";
import { createContext, useContext, ReactNode, useState, useCallback, useEffect, useMemo } from 'react';
import { DEFAULT_CONFIG, LexiGuessConfig } from '@/features/game/config';
import { logger } from '@/shared/lib/clientLogger';

type ConfigContextType = {
  config: LexiGuessConfig;
  saveConfig: (newConfig: LexiGuessConfig) => Promise<void>;
  resetConfig: () => void;
  isLoading: boolean;
  error: Error | null;
};

const ConfigContext = createContext<ConfigContextType>({
  config: DEFAULT_CONFIG,
  saveConfig: async () => {},
  resetConfig: () => {},
  isLoading: false,
  error: null,
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

const CONFIG_STORAGE_KEY = 'lexi-guess-config';

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [config, setConfig] = useState<LexiGuessConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load config from localStorage on mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        // Validate the saved config has required properties
        if (parsedConfig && typeof parsedConfig === 'object') {
          setConfig({ ...DEFAULT_CONFIG, ...parsedConfig });
        }
      }
    } catch (err) {
      logger.error('Failed to load config from localStorage', { 
        error: err instanceof Error ? { message: err.message } : err 
      });
      setError(err instanceof Error ? err : new Error('Failed to load config'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveConfig = useCallback(async (newConfig: LexiGuessConfig) => {
    try {
      setError(null);
      // Validate config before saving
      if (!newConfig || typeof newConfig !== 'object') {
        throw new Error('Invalid config provided');
      }
      
      // Ensure required properties exist
      const validatedConfig = { ...DEFAULT_CONFIG, ...newConfig };
      
      setConfig(validatedConfig);
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(validatedConfig));
      
      logger.info('Config saved successfully', { config: validatedConfig });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save config');
      logger.error('Failed to save config', { error: { message: error.message } });
      setError(error);
      throw error;
    }
  }, []);

  const resetConfig = useCallback(() => {
    try {
      setConfig(DEFAULT_CONFIG);
      localStorage.removeItem(CONFIG_STORAGE_KEY);
      setError(null);
      logger.info('Config reset to default');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to reset config');
      logger.error('Failed to reset config', { error: { message: error.message } });
      setError(error);
    }
  }, []);

  const contextValue = useMemo(() => ({
    config,
    saveConfig,
    resetConfig,
    isLoading,
    error,
  }), [config, saveConfig, resetConfig, isLoading, error]);

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
} 