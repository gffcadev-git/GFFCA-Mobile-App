import { httpClient } from './client';
import { ENDPOINTS } from './endpoints';

export type CompanyDTO = {
  legalName: string;
  tradingName: string;
  incorporation: string;
  industry: string;
};

export type TaxIdDTO = {
  id: string;
  label: string;
  value: string;
  verified: boolean;
};

export type PreferencesPayload = {
  language: string;
  currency: string;
  units: string;
  dateFormat: string;
};

export const profileApi = {
  company: async (): Promise<CompanyDTO> => {
    const res = await httpClient.get<CompanyDTO>(ENDPOINTS.profile.company);
    return res.data;
  },

  taxIds: async (): Promise<TaxIdDTO[]> => {
    const res = await httpClient.get<TaxIdDTO[]>(ENDPOINTS.profile.taxIds);
    return res.data;
  },

  updatePreferences: async (payload: PreferencesPayload): Promise<void> => {
    await httpClient.put(ENDPOINTS.profile.preferences, payload);
  },
};
