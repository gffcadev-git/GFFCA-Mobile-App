import { httpClient } from './client';
import { ENDPOINTS } from './endpoints';

export type PartyType = 'Shipper' | 'Consignee' | 'Notify';

export type PartyDTO = {
  id: string;
  name: string;
  type: PartyType;
  location: string;
  taxId: string;
};

export const partiesApi = {
  list: async (): Promise<PartyDTO[]> => {
    const res = await httpClient.get<PartyDTO[]>(ENDPOINTS.parties.list);
    return res.data;
  },

  create: async (payload: Omit<PartyDTO, 'id'>): Promise<PartyDTO> => {
    const res = await httpClient.post<PartyDTO>(ENDPOINTS.parties.create, payload);
    return res.data;
  },
};
