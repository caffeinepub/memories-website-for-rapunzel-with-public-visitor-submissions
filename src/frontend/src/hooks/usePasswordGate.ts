import { useState, useEffect } from 'react';

const SESSION_STORAGE_KEY = 'rapunzel_unlocked';
const SESSION_USERNAME_KEY = 'rapunzel_username';
const LOCAL_STORAGE_KEY = 'rapunzel_unlocked_local';
const LOCAL_USERNAME_KEY = 'rapunzel_username_local';
const CORRECT_PASSWORD = '5699';
const ALLOWED_USERNAMES = ['tingi99', 'meow99'];

export function usePasswordGate() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [unlockedUsername, setUnlockedUsername] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Check both session and local storage on mount
  useEffect(() => {
    // Try sessionStorage first
    let stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    let storedUsername = sessionStorage.getItem(SESSION_USERNAME_KEY);
    
    // Fallback to localStorage if sessionStorage is empty
    if (!stored || !storedUsername) {
      stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      storedUsername = localStorage.getItem(LOCAL_USERNAME_KEY);
      
      // If found in localStorage, copy to sessionStorage for this session
      if (stored === 'true' && storedUsername && ALLOWED_USERNAMES.includes(storedUsername)) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
        sessionStorage.setItem(SESSION_USERNAME_KEY, storedUsername);
      }
    }
    
    if (stored === 'true' && storedUsername && ALLOWED_USERNAMES.includes(storedUsername)) {
      setIsUnlocked(true);
      setUnlockedUsername(storedUsername);
    }
    setIsInitializing(false);
  }, []);

  const unlock = (username: string, password: string): boolean => {
    if (ALLOWED_USERNAMES.includes(username) && password === CORRECT_PASSWORD) {
      setIsUnlocked(true);
      setUnlockedUsername(username);
      // Write to both storages
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      sessionStorage.setItem(SESSION_USERNAME_KEY, username);
      localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
      localStorage.setItem(LOCAL_USERNAME_KEY, username);
      return true;
    }
    return false;
  };

  const lock = () => {
    setIsUnlocked(false);
    setUnlockedUsername(null);
    // Clear both storages
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_USERNAME_KEY);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(LOCAL_USERNAME_KEY);
  };

  return {
    isUnlocked,
    unlockedUsername,
    isInitializing,
    unlock,
    lock,
  };
}
