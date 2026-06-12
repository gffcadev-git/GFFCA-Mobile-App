import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type CreateShippingInstructionPayload } from '../apiCall';

/**
 * Server state for the shipments list. Fetches the live shipping-instructions
 * endpoint via `api.shipments.list()` (axios + interceptors), which maps the
 * backend SI records onto the app's Shipment shape.
 */
export function useShipments() {
  return useQuery({
    queryKey: ['shipments'],
    queryFn:  api.shipments.list,
  });
}

/**
 * Server state for a single shipping instruction. Fetches
 * GET /shipping-instructions/{id} using the SI id from the list. Disabled
 * until an id is available.
 */
export function useShipmentDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['shipment', id],
    queryFn:  () => api.shipments.detail(id as string),
    enabled:  !!id,
  });
}

/**
 * Creates a new shipping instruction (POST /shipping-instructions). Used by
 * Step 1 of the wizard: a draft SI is created up-front with just the user's
 * `companyId`, and the returned id is threaded through the remaining steps so
 * the final submit can PUT the collected form against that SI. Invalidates the
 * shipments list so the new draft shows up.
 */
export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateShippingInstructionPayload) => api.shipments.create(payload),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['shipments'] }); },
  });
}
