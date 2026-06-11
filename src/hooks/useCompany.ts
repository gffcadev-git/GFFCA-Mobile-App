import { useQuery } from '@tanstack/react-query';
import { api } from '../apiCall';

/**
 * Server state for a single company. Fetches GET /companies/{id} via
 * `api.profile.companyById`. The id is the signed-in user's `companyId`
 * (read from the persisted auth store / MMKV). Disabled until an id exists.
 */
export function useCompany(id: string | undefined) {
  return useQuery({
    queryKey: ['company', id],
    queryFn:  () => api.profile.companyById(id as string),
    enabled:  !!id,
  });
}
