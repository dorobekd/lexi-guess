"use client";
import { useState, useEffect } from 'react';
import { WordliConfig, DEFAULT_CONFIG } from '../components/config';

type UseConfigReturn = {
  config: WordliConfig;
  loading: boolean;
  error: Error | null;
  saveConfig: (newConfig: WordliConfig) => Promise<void>;
};

export function useConfig(): UseConfigReturn {
  const [config, setConfig] = useState<WordliConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config');
      if (!response.ok) throw new Error('Failed to fetch config');
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setConfig(DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig: WordliConfig) => {
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      });

      if (!response.ok) throw new Error('Failed to save config');
      
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save settings'));
      throw err; // Re-throw to let the caller handle the error
    }
  };

  return {
    config,
    loading,
    error,
    saveConfig
  };
} 