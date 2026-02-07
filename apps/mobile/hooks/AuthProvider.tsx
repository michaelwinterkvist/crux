import React, { useCallback, useEffect, useState } from 'react';
import type { User } from '@crux/shared';
import { AuthContext, type AuthState } from './useAuth';
import { api, setTokens, clearTokens, getToken } from '../lib/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        try {
          const { data } = await api.get<{ data: User }>('/auth/me');
          setUser(data);
        } catch {
          await clearTokens();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ data: { user: User; token: string; refreshToken: string } }>(
      '/auth/login',
      { email, password },
    );
    await setTokens(data.token, data.refreshToken);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, name: string, password: string) => {
    const { data } = await api.post<{ data: { user: User; token: string; refreshToken: string } }>(
      '/auth/register',
      { email, name, password },
    );
    await setTokens(data.token, data.refreshToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await clearTokens();
    setUser(null);
  }, []);

  const value: AuthState = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
