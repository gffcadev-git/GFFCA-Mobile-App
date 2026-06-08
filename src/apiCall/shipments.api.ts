import { httpClient } from './client';
import { ENDPOINTS } from './endpoints';
import { Shipment } from '../data/shipments';

export const shipmentsApi = {
  list: async (): Promise<Shipment[]> => {
    const res = await httpClient.get<Shipment[]>(ENDPOINTS.shipments.list);
    return res.data;
  },

  detail: async (ref: string): Promise<Shipment> => {
    const res = await httpClient.get<Shipment>(ENDPOINTS.shipments.detail(ref));
    return res.data;
  },

  create: async (payload: Partial<Shipment>): Promise<Shipment> => {
    const res = await httpClient.post<Shipment>(ENDPOINTS.shipments.create, payload);
    return res.data;
  },

  drafts: async (): Promise<Shipment[]> => {
    const res = await httpClient.get<Shipment[]>(ENDPOINTS.shipments.drafts);
    return res.data;
  },
};
