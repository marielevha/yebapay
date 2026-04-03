import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import {
  persistHasSeenOnboarding,
  readHasSeenOnboarding,
} from '@/features/onboarding/onboarding-storage';

type OnboardingContextValue = {
  hasSeenOnboarding: boolean;
  isBootstrapping: boolean;
  markOnboardingSeen: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const storedValue = await readHasSeenOnboarding();

      if (!cancelled) {
        setHasSeenOnboarding(storedValue);
        setIsBootstrapping(false);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<OnboardingContextValue>(() => {
    const markOnboardingSeen = async () => {
      if (hasSeenOnboarding) {
        return;
      }

      await persistHasSeenOnboarding();
      setHasSeenOnboarding(true);
    };

    return {
      hasSeenOnboarding,
      isBootstrapping,
      markOnboardingSeen,
    };
  }, [hasSeenOnboarding, isBootstrapping]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }

  return context;
}
