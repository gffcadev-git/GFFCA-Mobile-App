import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../services/storage';
import { saveTokens, loadTokens, clearTokens } from '../services/secureTokens';
import { disableBiometric } from '../services/biometricCredentials';

/** Authenticated user as returned by the auth API. */
export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantCode: string;
};

/** Session payload handed to {@link AuthState.signIn} after a successful login. */
export type AuthSession = {
  token: string;
  refreshToken: string;
  user: AuthUser;
};

type AuthState = {
  /**
   * Bearer access + refresh tokens. Held in memory only so the axios
   * interceptor can read them synchronously; the durable copy lives in the
   * device Keychain/Keystore (see services/secureTokens), never in MMKV.
   */
  token: string | null;
  refreshToken: string | null;
  /** Non-secret profile — persisted to MMKV for instant render on launch. */
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** False until secure tokens have been loaded on app start. */
  isHydrated: boolean;

  signIn: (session: AuthSession) => Promise<void>;
  signOut: (opts?: { wipeBiometric?: boolean }) => Promise<void>;
  /** Update tokens after a refresh, keeping the Keychain in sync. */
  setTokens: (tokens: { token: string; refreshToken: string }) => Promise<void>;
  /** Load tokens from the secure store into memory on app launch. */
  bootstrap: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isHydrated: false,

      signIn: async ({ token, refreshToken, user }) => {
        await saveTokens({ accessToken: token, refreshToken });
        set({ token, refreshToken, user, isAuthenticated: true });
      },

      signOut: async ({ wipeBiometric = false } = {}) => {
        await clearTokens();
        // Explicit user sign-out also removes the biometric-stored refresh token.
        // The involuntary 401 path leaves it, so an expired access token alone
        // doesn't disable the convenience login.
        if (wipeBiometric) await disableBiometric();
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
      },

      setTokens: async ({ token, refreshToken }) => {
        await saveTokens({ accessToken: token, refreshToken });
        set({ token, refreshToken });
      },

      bootstrap: async () => {
        const tokens = await loadTokens();
        if (tokens) {
          set({
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
          });
        } else {
          // No secure tokens → ensure any persisted profile can't pose as a session.
          if (get().user) set({ user: null });
          set({ isAuthenticated: false });
        }
        set({ isHydrated: true });
      },
    }),
    {
      name: 'gffca-auth',
      storage: createJSONStorage(() => zustandMMKVStorage),
      // Only the non-secret profile is persisted to MMKV. Tokens and the
      // derived auth flags come exclusively from the Keychain at bootstrap.
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
