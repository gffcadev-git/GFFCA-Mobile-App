import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../services/storage';
import { saveTokens, loadTokens, clearTokens } from '../services/secureTokens';

/**
 * A company the signed-in user is associated with, as returned inside the
 * login response's `user.associatedCompanies`.
 */
export type AssociatedCompany = {
  id: string;
  name: string;
  /** Relationship to the user, e.g. "parent". */
  type: string;
};

/** Authenticated user as returned by the auth API. */
export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantCode: string;
  /** The user's primary company. */
  companyId: string;
  /** Additional roles, or null when none. */
  subRoles: string[] | null;
  /** Companies the user can act for. Persisted to MMKV with the rest of `user`. */
  associatedCompanies: AssociatedCompany[];
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
  /**
   * Non-secret profile — persisted to MMKV for instant render on launch.
   * Includes `associatedCompanies` from the login response.
   */
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** False until secure tokens have been loaded on app start. */
  isHydrated: boolean;

  signIn: (session: AuthSession) => Promise<void>;
  /**
   * Clear the in-memory + Keychain *session*. The biometric login credential
   * is deliberately left intact — it's a separate Keychain entry and the whole
   * point of biometric sign-in is to return after signing out. Turning it off
   * is an explicit Profile toggle (see services/biometricCredentials).
   */
  signOut: () => Promise<void>;
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

      signOut: async () => {
        await clearTokens();
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
