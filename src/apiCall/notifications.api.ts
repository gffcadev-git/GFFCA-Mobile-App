import { httpClient } from './client';
import { ENDPOINTS } from './endpoints';

export type NotificationDTO = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export const notificationsApi = {
  list: async (): Promise<NotificationDTO[]> => {
    const res = await httpClient.get<NotificationDTO[]>(ENDPOINTS.notifications.list);
    return res.data;
  },

  markAllRead: async (): Promise<void> => {
    await httpClient.post(ENDPOINTS.notifications.markAllRead);
  },
};
