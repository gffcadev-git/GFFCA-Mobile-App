import { httpClient } from './client';
import { ENDPOINTS } from './endpoints';
import type { ApiEnvelope } from './types';
import { Shipment, ShipmentStatus } from '../data/shipments';

/**
 * Raw shipping-instruction record as returned by the backend
 * (GET /shipping-instructions). Only the fields the app consumes are typed;
 * the rest of the payload is ignored.
 */
export type ShippingInstructionDTO = {
  id: string;
  siNumber: string;
  status: string;
  originCity: string | null;
  originCountry: string | null;
  destinationId: string | null;
  bookingNumber: string | null;
  transportMode: string | null;
  carrierId: string | null;
  totalPackages: string | null;
  totalWeightKg: string | null;
  totalValueCad: string | null;
  createdAt: string;
  cargoLines?: Array<{ description?: string }>;
};

/**
 * Body for creating a new shipping instruction (POST /shipping-instructions).
 * Only `companyId` is required — the backend creates an empty draft SI and
 * returns its id. The rest of the form (booking, destination, parties, cargo…)
 * is collected through the wizard and sent later via the update/submit call.
 */
export type CreateShippingInstructionPayload = {
  companyId: string;
};

/** Backend status string → the app's {@link ShipmentStatus}. */
const STATUS_MAP: Record<string, ShipmentStatus> = {
  draft:            'Draft',
  submitted:        'Submitted',
  under_review:     'Under review',
  in_review:        'Under review',
  pending:          'Pending you',
  action_required:  'Pending you',
  approved:         'Completed',
  completed:        'Completed',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** Maps a backend SI record onto the app's {@link Shipment} shape. */
export function mapShippingInstruction(dto: ShippingInstructionDTO): Shipment {
  // NOTE: the payload carries originCity/Country but no resolved destination
  // (destinationId is an unresolved ref), so we surface the origin for now.
  const origin    = [dto.originCity, dto.originCountry].filter(Boolean).join(', ') || '—';
  const cargoType = dto.cargoLines?.[0]?.description ?? dto.transportMode ?? '—';

  return {
    id:            dto.id,
    ref:           dto.siNumber,
    status:        STATUS_MAP[dto.status?.toLowerCase()] ?? 'Submitted',
    date:          formatDate(dto.createdAt),
    destination:   origin,
    cargoType,
    cargo:         cargoType,
    carrier:       '',
    booking:       dto.bookingNumber ?? '',
    // Detail-only fields, populated from the single-SI endpoint.
    origin,
    transportMode: dto.transportMode ?? undefined,
    totalPackages: dto.totalPackages ?? undefined,
    totalWeightKg: dto.totalWeightKg ?? undefined,
    totalValueCad: dto.totalValueCad ?? undefined,
  };
}

export const shipmentsApi = {
  list: async (): Promise<Shipment[]> => {
    const res = await httpClient.get<ApiEnvelope<ShippingInstructionDTO[]>>(ENDPOINTS.shipments.list);
    return (res.data.data ?? []).map(mapShippingInstruction);
  },

  detail: async (id: string): Promise<Shipment> => {
    const res = await httpClient.get<ApiEnvelope<ShippingInstructionDTO>>(ENDPOINTS.shipments.detail(id));
    return mapShippingInstruction(res.data.data);
  },

  create: async (payload: CreateShippingInstructionPayload): Promise<Shipment> => {
    const res = await httpClient.post<ApiEnvelope<ShippingInstructionDTO>>(ENDPOINTS.shipments.create, payload);
    return mapShippingInstruction(res.data.data);
  },

  drafts: async (): Promise<Shipment[]> => {
    const res = await httpClient.get<ApiEnvelope<ShippingInstructionDTO[]>>(ENDPOINTS.shipments.drafts);
    return (res.data.data ?? []).map(mapShippingInstruction);
  },
};
