import { useState, useEffect } from 'react';

const STORAGE_KEY = 'rapunzel_unlocked';
const USERNAME_KEY = 'rapunzel_username';
const CORRECT_PASSWORD = '5699';
const ALLOWED_USERNAMES = ['tingi99', 'meow99'];

export function usePasswordGate() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [unlockedUsername, setUnlockedUsername] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Check session storage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const storedUsername = sessionStorage.getItem(USERNAME_KEY);
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
      sessionStorage.setItem(STORAGE_KEY, 'true');
      sessionStorage.setItem(USERNAME_KEY, username);
      return true;
    }
    return false;
  };

  const lock = () => {
    setIsUnlocked(false);
    setUnlockedUsername(null);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(USERNAME_KEY);
  };

  return {
    isUnlocked,
    unlockedUsername,
    isInitializing,
    unlock,
    lock,
  };
}
