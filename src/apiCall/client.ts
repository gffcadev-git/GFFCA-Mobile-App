import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { ENV } from '../config/env';
import { useAuthStore } from '../stores/authStore';
import { normalizeError } from './types';

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
  (error: AxiosError) => {
    // Auth expired/invalid → sign the user out so the app routes to SignIn
    if (error.response?.status === 401) {
      useAuthStore.getState().signOut();
    }

    if (__DEV__) {
      console.log(`[API ✕] ${error.response?.status ?? 'ERR'} ${error.config?.url} — ${error.message}`);
    }
    // Reject with a normalised error so callers get a consistent shape
    return Promise.reject(normalizeError(error));
  },
);
