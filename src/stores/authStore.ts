import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../services/storage';

type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      signIn: (token) => set({ token, isAuthenticated: true }),
      signOut: () => set({ token: null, isAuthenticated: false }),
    }),
    {
      name: 'gffca-auth',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
