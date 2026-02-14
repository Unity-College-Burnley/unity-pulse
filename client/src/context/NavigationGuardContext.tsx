// ============================================================
// NavigationGuard — lets pages block navigation with a warning
// ============================================================

import { createContext, useContext, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

type GuardFn = () => string | null;

interface NavigationGuardContextValue {
  /** Register a guard that returns a warning message, or null to allow. */
  setGuard: (fn: GuardFn | null) => void;
  /** Returns the warning message if blocked, or null if navigation is allowed. */
  check: () => string | null;
}

const NavigationGuardContext = createContext<NavigationGuardContextValue>({
  setGuard: () => {},
  check: () => null,
});

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const guardRef = useRef<GuardFn | null>(null);

  const setGuard = useCallback((fn: GuardFn | null) => {
    guardRef.current = fn;
  }, []);

  const check = useCallback(() => {
    return guardRef.current ? guardRef.current() : null;
  }, []);

  return (
    <NavigationGuardContext.Provider value={{ setGuard, check }}>
      {children}
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard() {
  return useContext(NavigationGuardContext);
}
