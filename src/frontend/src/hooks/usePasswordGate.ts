import { useState, useEffect } from 'react';

const STORAGE_KEY = 'rapunzel_unlocked';
const CORRECT_PASSWORD = '5699';
const ALLOWED_USERNAMES = ['tingi99', 'meow99'];

export function usePasswordGate() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Check session storage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setIsUnlocked(true);
    }
    setIsInitializing(false);
  }, []);

  const unlock = (username: string, password: string): boolean => {
    if (ALLOWED_USERNAMES.includes(username) && password === CORRECT_PASSWORD) {
      setIsUnlocked(true);
      sessionStorage.setItem(STORAGE_KEY, 'true');
      return true;
    }
    return false;
  };

  const lock = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return {
    isUnlocked,
    isInitializing,
    unlock,
    lock,
  };
}
