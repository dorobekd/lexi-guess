"use client"
import { LexiGuessConfig, DEFAULT_CONFIG } from '../components/config';
import { useFetchData } from './useFetchData';
import { useEffect, useCallback, useRef } from 'react';

const CONFIG_URL = '/api/config';

type UseConfigReturn = {
  config: LexiGuessConfig;
  loading: boolean;
  error: Error | null;
  saveConfig: (newConfig: LexiGuessConfig) => Promise<void>;
  refreshConfig: () => Promise<void>;
};

export function useConfig(): UseConfigReturn {
  const isInitialMount = useRef(true);
  
  const { 
    data, 
    error, 
    isLoading, 
    fetchData 
  } = useFetchData<LexiGuessConfig>({
    initialData: DEFAULT_CONFIG,
  });

  const fetchConfig = useCallback(() => {
    return fetchData(CONFIG_URL);
  }, [fetchData]);

  const saveConfig = useCallback(async (newConfig: LexiGuessConfig) => {
    await fetchData(CONFIG_URL, {
      method: 'POST',
      body: newConfig,
    });
  }, [fetchData]);

  // Only fetch on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchConfig();
    }
  }, [fetchConfig]);

  return {
    config: data, // ?? DEFAULT_CONFIG,
    loading: isLoading,
    error,
    saveConfig,
    refreshConfig: fetchConfig
  };
} 