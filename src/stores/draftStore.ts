import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../services/storage';

export type ShippingDraft = {
  id: string;
  ref: string;
  step: number;       // 1..6
  data: Record<string, unknown>;
  updatedAt: number;
};

type DraftState = {
  drafts: ShippingDraft[];
  upsert: (draft: ShippingDraft) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      drafts: [],
      upsert: (draft) =>
        set((s) => {
          const rest = s.drafts.filter((d) => d.id !== draft.id);
          return { drafts: [...rest, { ...draft, updatedAt: Date.now() }] };
        }),
      remove: (id) => set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),
      clear: () => set({ drafts: [] }),
    }),
    {
      name: 'gffca-drafts',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
