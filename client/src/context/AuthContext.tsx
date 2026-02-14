// ============================================================
// Auth context — manages login state, token, and current user
// ============================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true, // true while we check localStorage on mount
  });

  // On mount, restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('unity-pulse-token');
    const savedUser = localStorage.getItem('unity-pulse-user');

    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser) as User;
        setState({ user, token: savedToken, isLoading: false });
      } catch {
        localStorage.removeItem('unity-pulse-token');
        localStorage.removeItem('unity-pulse-user');
        setState({ user: null, token: null, isLoading: false });
      }
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<{
      data: { token: string; user: User };
    }>('/auth/login', { email, password });

    const { token, user } = response.data;

    localStorage.setItem('unity-pulse-token', token);
    localStorage.setItem('unity-pulse-user', JSON.stringify(user));

    setState({ user, token, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('unity-pulse-token');
    localStorage.removeItem('unity-pulse-user');
    setState({ user: null, token: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to access auth state. Throws if used outside AuthProvider. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
