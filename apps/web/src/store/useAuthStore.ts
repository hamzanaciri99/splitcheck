import { create } from 'zustand';
import type { AuthResult, User } from '@splitcheck/core';
import { api } from '../api/client';

type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

type AuthStore = {
  status: AuthStatus;
  user: User | null;
  error: string | null;
  bootstrap: () => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
};

async function applyAuthResult(result: AuthResult, set: (state: Partial<AuthStore>) => void): Promise<void> {
  await api.setTokens(result.tokens);
  set({ status: 'signedIn', user: result.user, error: null });
}

export const useAuthStore = create<AuthStore>((set) => ({
  status: 'loading',
  user: null,
  error: null,

  bootstrap: async () => {
    const tokens = await api.getTokens();
    if (!tokens) {
      set({ status: 'signedOut', user: null });
      return;
    }
    try {
      const user = await api.get<User>('/api/auth/me');
      set({ status: 'signedIn', user });
    } catch {
      await api.clearTokens();
      set({ status: 'signedOut', user: null });
    }
  },

  signup: async (email, password, displayName) => {
    set({ error: null });
    try {
      const result = await api.post<AuthResult>('/api/auth/signup', { email, password, displayName }, { auth: false });
      await applyAuthResult(result, set);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Sign up failed' });
      throw err;
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const result = await api.post<AuthResult>('/api/auth/login', { email, password }, { auth: false });
      await applyAuthResult(result, set);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Login failed' });
      throw err;
    }
  },

  loginWithGoogle: async (idToken) => {
    set({ error: null });
    try {
      const result = await api.post<AuthResult>('/api/auth/google', { idToken }, { auth: false });
      await applyAuthResult(result, set);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Google sign-in failed' });
      throw err;
    }
  },

  logout: async () => {
    await api.post('/api/auth/logout', undefined).catch(() => {});
    await api.clearTokens();
    set({ status: 'signedOut', user: null });
  },
}));
