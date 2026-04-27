import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@calcura/shared';

// Guest user — no backend needed
const GUEST_USER: User = {
  id: 'guest',
  username: 'Guest Aspirant',
  email: 'guest@calcura.app',
  createdAt: new Date().toISOString(),
};

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  setAuth: (token: string, user: User) => void;
  loginAsGuest: () => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isGuest: false,

      setAuth: (token, user) =>
        set({ accessToken: token, user, isAuthenticated: true, isGuest: false }),

      setAccessToken: (token) =>
        set({ accessToken: token }),

      setUser: (user) =>
        set({ user }),

      loginAsGuest: () =>
        set({ accessToken: 'guest', user: GUEST_USER, isAuthenticated: true, isGuest: true }),

      clearAuth: () =>
        set({ accessToken: null, user: null, isAuthenticated: false, isGuest: false }),
    }),
    {
      name: 'calcura-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        // Only persist user info, NOT the token (security)
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
      }),
    }
  )
);
