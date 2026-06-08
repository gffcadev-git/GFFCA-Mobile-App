import { httpClient } from './client';
import { ENDPOINTS } from './endpoints';

export type LoginPayload = { email: string; password: string };
export type AuthUser = { id: string; name: string; role: string };
export type LoginResponse = { token: string; user: AuthUser };

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await httpClient.post<LoginResponse>(ENDPOINTS.auth.login, payload);
    return res.data;
  },

  refresh: async (): Promise<{ token: string }> => {
    const res = await httpClient.post<{ token: string }>(ENDPOINTS.auth.refresh);
    return res.data;
  },

  me: async (): Promise<AuthUser> => {
    const res = await httpClient.get<AuthUser>(ENDPOINTS.auth.me);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await httpClient.post(ENDPOINTS.auth.logout);
  },
};
