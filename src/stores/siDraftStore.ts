import { create } from 'zustand';
import type { Shipment } from '../data/shipments';

/** A single vehicle entry in the cargo/VIN flow. */
export type Vehicle = { id: string; vin: string; notes: string };

/**
 * The full multi-step "New / resume shipping instruction" form. One shared
 * source of truth so every wizard step reads and writes the same draft — the
 * fields are hydrated from a fetched SI when resuming, or start empty for a new
 * one.
 */
export type SiDraftForm = {
  // identity (set when resuming a saved SI)
  id?:  string;
  ref?: string;

  // Step 1 — destination & booking
  bookingNumber: string;
  destination:   string;

  // Step 2 — container & seal
  containerNumber: string;
  sealNumber:      string;

  // Step 3 — shipper
  shipperName:    string;
  shipperPhone:   string;
  shipperEmail:   string;
  shipperTaxId:   string;
  shipperAddress: string;

  // Step 4 — cargo type
  cargoTypeId: string;

  // Step 5 — notify party
  notifyName:  string;
  notifyPhone: string;
  notifyEmail: string;

  // Cargo · vehicles
  vehicles: Vehicle[];
};

const EMPTY_FORM: SiDraftForm = {
  id:              undefined,
  ref:             undefined,
  bookingNumber:   '',
  destination:     '',
  containerNumber: '',
  sealNumber:      '',
  shipperName:     '',
  shipperPhone:    '',
  shipperEmail:    '',
  shipperTaxId:    '',
  shipperAddress:  '',
  cargoTypeId:     'auto',
  notifyName:      '',
  notifyPhone:     '',
  notifyEmail:     '',
  vehicles:        [{ id: '1', vin: '', notes: '' }],
};

let nextVehicleId = 2;

type SiDraftState = {
  form: SiDraftForm;
  /** Tracks which SI id the form was last hydrated from, so we hydrate once. */
  hydratedId?: string;

  /** Patch one or more form fields. */
  setForm: (patch: Partial<SiDraftForm>) => void;
  /** Populate the form from a fetched SI (resuming a draft). Idempotent per id. */
  hydrate: (s: Shipment) => void;
  /** Clear the form back to a fresh SI. */
  reset: () => void;

  // ── Vehicle helpers ──
  addVehicle:    () => void;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;
};

export const useSiDraftStore = create<SiDraftState>((set, get) => ({
  form: EMPTY_FORM,
  hydratedId: undefined,

  setForm: (patch) => set((state) => ({ form: { ...state.form, ...patch } })),

  hydrate: (s) => {
    // Only hydrate once per SI so user edits aren't overwritten by a refetch.
    if (get().hydratedId === s.id) return;
    set({
      hydratedId: s.id,
      form: {
        ...EMPTY_FORM,
        id:            s.id,
        ref:           s.ref,
        // Confirmed top-level fields. Nested fields (container, parties,
        // vehicles, cargo type) await the populated SI shape — see siDraftStore
        // TODO before wiring them into hydrate.
        bookingNumber: s.booking ?? '',
        destination:   s.destination ?? '',
      },
    });
  },

  reset: () => {
    nextVehicleId = 2;
    set({ form: EMPTY_FORM, hydratedId: undefined });
  },

  addVehicle: () =>
    set((state) => ({
      form: {
        ...state.form,
        vehicles: [...state.form.vehicles, { id: String(nextVehicleId++), vin: '', notes: '' }],
      },
    })),

  updateVehicle: (id, patch) =>
    set((state) => ({
      form: {
        ...state.form,
        vehicles: state.form.vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v)),
      },
    })),

  removeVehicle: (id) =>
    set((state) => ({
      form: { ...state.form, vehicles: state.form.vehicles.filter((v) => v.id !== id) },
    })),
}));
