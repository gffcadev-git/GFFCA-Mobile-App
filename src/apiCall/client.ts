import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { ENV } from '../config/env';
import { useAuthStore } from '../stores/authStore';
import { ENDPOINTS } from './endpoints';
import { ApiEnvelope, normalizeError } from './types';

/**
 * Single shared Axios instance. Every API method in `apiCall/*.api.ts`
 * goes through this so auth, logging, and error handling are centralised.
 */
export const httpClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Silent access-token refresh ──────────────────────────────────────────────
// The access token is short-lived (~15 min). When a request comes back 401 we
// swap it for a fresh one using the refresh token and replay the request, so the
// user never sees a login screen mid-session.

/** Requests config gets a private flag so we only retry a given request once. */
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/**
 * Holds the in-flight refresh so a burst of concurrent 401s triggers exactly
 * one /auth/refresh call; every waiting request resolves off the same promise.
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * Exchange the refresh token for a new access token via a *bare* axios call —
 * deliberately not `httpClient`, so it skips these interceptors (no recursion,
 * no stale bearer header) — then persist it. Resolves to the new access token,
 * or `null` when the refresh token is itself expired/invalid.
 */
async function runRefresh(refreshToken: string): Promise<string | null> {
  try {
    const res = await axios.post<ApiEnvelope<{ accessToken: string; refreshToken?: string }>>(
      `${ENV.API_BASE_URL}${ENDPOINTS.auth.refresh}`,
      { refreshToken },
      {
        timeout: ENV.API_TIMEOUT,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      },
    );
    const { accessToken, refreshToken: rotated } = res.data.data;
    // Keep the rotated refresh token if the backend issued one; otherwise reuse.
    await useAuthStore.getState().setTokens({
      token: accessToken,
      refreshToken: rotated ?? refreshToken,
    });
    return accessToken;
  } catch {
    return null;
  }
}

// ─── Request interceptor — runs BEFORE every request leaves the app ───────────
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach the bearer token from the auth store (if signed in)
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (__DEV__) {
      console.log(`[API →] ${config.method?.toUpperCase()} ${config.url}`, config.data ?? '');
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(normalizeError(error)),
);

// ─── Response interceptor — runs AFTER every response comes back ──────────────
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (__DEV__) {
      console.log(`[API ←] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      const { token, refreshToken } = useAuthStore.getState();

      if (refreshToken) {
        original._retry = true;
        // Collapse concurrent 401s into a single refresh round-trip.
        refreshPromise ??= runRefresh(refreshToken).finally(() => { refreshPromise = null; });
        const newToken = await refreshPromise;

        if (newToken) {
          // Replay the original request with the freshly minted token.
          original.headers.Authorization = `Bearer ${newToken}`;
          return httpClient(original);
        }
        // Refresh token is expired/invalid too → the session is truly over.
        await useAuthStore.getState().signOut();
      } else if (token) {
        // Authenticated but nothing to refresh with → sign out, route to SignIn.
        await useAuthStore.getState().signOut();
      }
      // else: not signed in (e.g. a failed login) — just surface the error.
    }

    if (__DEV__) {
      console.log(`[API ✕] ${error.response?.status ?? 'ERR'} ${error.config?.url} — ${error.message}`);
    }
    // Reject with a normalised error so callers get a consistent shape
    return Promise.reject(normalizeError(error));
  },
);
