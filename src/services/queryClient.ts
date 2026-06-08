import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { querySyncStorage } from './storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,            // 1 min
      gcTime:    1000 * 60 * 60 * 24,  // 24h (kept in MMKV)
      retry:     2,
      refetchOnWindowFocus: true,
    },
  },
});

// MMKV-backed persister (synchronous → pairs perfectly with MMKV)
export const queryPersister = createSyncStoragePersister({
  storage: querySyncStorage,
  key:     'gffca-react-query-cache',
});
