import { useState, useEffect } from 'react';

interface TingiConfig {
  apiKey: string;
  cx: string;
}

const STORAGE_KEY = 'tingi_config';

export function useTingiConfig() {
  const [config, setConfig] = useState<TingiConfig>({ apiKey: '', cx: '' });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig(parsed);
      }
    } catch (error) {
      console.error('Failed to load Tingi config:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveConfig = (newConfig: TingiConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.error('Failed to save Tingi config:', error);
      throw new Error('Failed to save configuration');
    }
  };

  const isConfigured = config.apiKey.trim() !== '' && config.cx.trim() !== '';

  return {
    config,
    saveConfig,
    isConfigured,
    isLoaded,
  };
}
