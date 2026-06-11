import { httpClient } from './client';
import { ENDPOINTS } from './endpoints';
import type { ApiEnvelope } from './types';

export type CompanyDTO = {
  legalName: string;
  tradingName: string;
  incorporation: string;
  industry: string;
};

/** A contact person attached to a company (GET /companies/{id} → `contacts`). */
export type CompanyContactDTO = {
  id?: string;
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
};

/** Full company record from GET /companies/{id}. */
export type CompanyDetailDTO = {
  id: string;
  name: string;
  type: string;
  parentCompanyId: string | null;
  parentCompany: CompanyDetailDTO | null;
  subsidiaries: CompanyDetailDTO[];
  taxId: string | null;
  /** Street line — a flat string, not a structured address. */
  address: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  assignedSalespersonId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  contacts: CompanyContactDTO[];
  savedParties: unknown[];
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

  /** Fetch a single company by id (GET /companies/{id}). */
  companyById: async (id: string): Promise<CompanyDetailDTO> => {
    const res = await httpClient.get<ApiEnvelope<CompanyDetailDTO>>(ENDPOINTS.profile.companyById(id));
    return res.data.data;
  },

  taxIds: async (): Promise<TaxIdDTO[]> => {
    const res = await httpClient.get<TaxIdDTO[]>(ENDPOINTS.profile.taxIds);
    return res.data;
  },

  updatePreferences: async (payload: PreferencesPayload): Promise<void> => {
    await httpClient.put(ENDPOINTS.profile.preferences, payload);
  },
};
