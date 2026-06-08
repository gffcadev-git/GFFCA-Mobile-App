import { AxiosError } from 'axios';

/** Normalised error shape surfaced to the app (queries, mutations, UI). */
export type ApiError = {
  status: number;
  message: string;
  data?: unknown;
};

/** Optional standard response envelope, if the backend wraps payloads. */
export type ApiEnvelope<T> = {
  data: T;
  message?: string;
  success?: boolean;
};

/** Converts an Axios error into a predictable {@link ApiError}. */
export function normalizeError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const body = error.response?.data as { message?: string } | undefined;
  const message =
    body?.message ||
    error.message ||
    'Something went wrong. Please try again.';
  return { status, message, data: error.response?.data };
}
