import { useQuery } from '@tanstack/react-query';
import { api } from '../apiCall';
import { SHIPMENTS } from '../data/shipments';

/**
 * Server state for the shipments list. Fetches via `api.shipments.list()`
 * (axios + interceptors), and uses the bundled mock as `initialData` so the
 * UI renders instantly and keeps working until the backend is live.
 */
export function useShipments() {
  return useQuery({
    queryKey:    ['shipments'],
    queryFn:     api.shipments.list,
    initialData: SHIPMENTS,
  });
}
