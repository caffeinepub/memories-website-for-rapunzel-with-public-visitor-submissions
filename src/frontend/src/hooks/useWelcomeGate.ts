import { useState, useEffect } from 'react';

const STORAGE_KEY = 'rapunzel_welcome_dismissed';

export function useWelcomeGate() {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Check session storage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setIsDismissed(true);
    }
    setIsInitializing(false);
  }, []);

  const dismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(STORAGE_KEY, 'true');
  };

  const reset = () => {
    setIsDismissed(false);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return {
    isDismissed,
    isInitializing,
    dismiss,
    reset,
  };
}
