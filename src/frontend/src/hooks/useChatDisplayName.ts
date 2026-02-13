import { useState, useEffect } from 'react';

const SESSION_STORAGE_KEY = 'chat_display_name';
const LOCAL_STORAGE_KEY = 'chat_display_name_local';

export function useChatDisplayName() {
  const [displayName, setDisplayNameState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load from both session and local storage on mount
  useEffect(() => {
    // Try sessionStorage first
    let stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    
    // Fallback to localStorage if sessionStorage is empty
    if (!stored) {
      stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      
      // If found in localStorage, copy to sessionStorage for this session
      if (stored) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, stored);
      }
    }
    
    if (stored) {
      setDisplayNameState(stored);
    }
    setIsLoading(false);
  }, []);

  const setDisplayName = (name: string) => {
    const trimmed = name.trim();
    setDisplayNameState(trimmed);
    if (trimmed) {
      // Write to both storages
      sessionStorage.setItem(SESSION_STORAGE_KEY, trimmed);
      localStorage.setItem(LOCAL_STORAGE_KEY, trimmed);
    } else {
      // Clear both storages
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const clearDisplayName = () => {
    setDisplayNameState('');
    // Clear both storages
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const isValid = displayName.trim().length > 0;

  return {
    displayName,
    setDisplayName,
    clearDisplayName,
    isValid,
    isLoading,
  };
}
