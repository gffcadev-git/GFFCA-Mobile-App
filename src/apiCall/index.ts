import { authApi } from './auth.api';
import { shipmentsApi } from './shipments.api';
import { notificationsApi } from './notifications.api';
import { partiesApi } from './parties.api';
import { messagesApi } from './messages.api';
import { profileApi } from './profile.api';

/**
 * Single entry point for every API method. Import this anywhere:
 *
 *   import { api } from '../apiCall';
 *   const shipments = await api.shipments.list();
 *   const { token } = await api.auth.login({ email, password });
 */
export const api = {
  auth:          authApi,
  shipments:     shipmentsApi,
  notifications: notificationsApi,
  parties:       partiesApi,
  messages:      messagesApi,
  profile:       profileApi,
};

// Re-export the client, endpoints, and shared types for direct access if needed
export { httpClient } from './client';
export { ENDPOINTS } from './endpoints';
export * from './types';
export type { LoginPayload, LoginData } from './auth.api';
export type { AuthUser, AuthSession } from '../stores/authStore';
export type { NotificationDTO } from './notifications.api';
export type { PartyDTO, PartyType } from './parties.api';
export type { ConversationDTO, MessageDTO } from './messages.api';
export type { CompanyDTO, TaxIdDTO, PreferencesPayload } from './profile.api';
