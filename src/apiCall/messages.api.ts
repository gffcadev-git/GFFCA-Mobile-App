import { httpClient } from './client';
import { ENDPOINTS } from './endpoints';

export type ConversationDTO = {
  id: string;
  ref: string;
  title: string;
  preview: string;
  time: string;
  unread: number;
};

export type MessageDTO = {
  id: string;
  side: 'in' | 'out';
  text: string;
  author: string;
  date: string;
};

export const messagesApi = {
  conversations: async (): Promise<ConversationDTO[]> => {
    const res = await httpClient.get<ConversationDTO[]>(ENDPOINTS.messages.conversations);
    return res.data;
  },

  thread: async (ref: string): Promise<MessageDTO[]> => {
    const res = await httpClient.get<MessageDTO[]>(ENDPOINTS.messages.thread(ref));
    return res.data;
  },

  reply: async (ref: string, text: string): Promise<MessageDTO> => {
    const res = await httpClient.post<MessageDTO>(ENDPOINTS.messages.reply(ref), { text });
    return res.data;
  },
};
