import { httpClient } from './client';
import { ENDPOINTS } from './endpoints';
import { ENV } from '../config/env';
import type { ApiEnvelope } from './types';
import type { AuthUser } from '../stores/authStore';

export type LoginPayload = {
  email: string;
  password: string;
  /** Defaults to {@link ENV.DEFAULT_TENANT_CODE} ("gff") when omitted. */
  tenantCode?: string;
};

/** Shape inside the `data` envelope returned by POST /auth/login. */
export type LoginData = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export const authApi = {
  login: async ({ email, password, tenantCode }: LoginPayload): Promise<LoginData> => {
    const res = await httpClient.post<ApiEnvelope<LoginData>>(ENDPOINTS.auth.login, {
      email,
      password,
      tenantCode: tenantCode ?? ENV.DEFAULT_TENANT_CODE,
    });
    return res.data.data;
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const res = await httpClient.post<ApiEnvelope<{ accessToken: string }>>(
      ENDPOINTS.auth.refresh,
      { refreshToken },
    );
    return res.data.data;
  },

  me: async (): Promise<AuthUser> => {
    const res = await httpClient.get<ApiEnvelope<AuthUser>>(ENDPOINTS.auth.me);
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await httpClient.post(ENDPOINTS.auth.logout);
  },
};
