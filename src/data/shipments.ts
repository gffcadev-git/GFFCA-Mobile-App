import type { BadgeTone } from '../components/Badge';

// ─── Status ───────────────────────────────────────────────────────────────────

export type ShipmentStatus =
  | 'Pending you'
  | 'Under review'
  | 'Submitted'
  | 'Draft'
  | 'Completed';

export const SHIPMENT_STATUS_TONE: Record<ShipmentStatus, BadgeTone> = {
  'Pending you':  'error',
  'Under review': 'warning',
  'Submitted':    'success',
  'Draft':        'neutral',
  'Completed':    'success',
};

// ─── Shipment ─────────────────────────────────────────────────────────────────

export type Shipment = {
  id:           string;
  ref:          string;
  status:       ShipmentStatus;
  date:         string;
  destination:  string;
  /** Short cargo label used in the list (e.g. "Used auto") */
  cargoType:    string;
  /** Full cargo description used on the detail screen */
  cargo:        string;
  carrier:      string;
  booking:      string;
  /** Present when the shipment needs the user to act — drives the alert banner */
  actionNeeded?: string;
};

export const SHIPMENTS: Shipment[] = [
  { id: '1', ref: '#GFF-2047', status: 'Pending you',  date: 'May 28', destination: 'Kingston, Jamaica', cargoType: 'Used auto',     cargo: 'Used auto — 2003 Honda Accord', carrier: 'MSC Mediterranean', booking: 'MSC1234567', actionNeeded: 'The docs team asked for the missing consignee phone number. Reply or update the SI to continue.' },
  { id: '2', ref: '#GFF-2043', status: 'Under review', date: 'May 25', destination: 'Lagos, Nigeria',    cargoType: 'Metal scrap',   cargo: 'Metal scrap — Ferrous scrap',    carrier: 'MSC Mediterranean', booking: 'MSC1234567' },
  { id: '3', ref: '#GFF-2039', status: 'Submitted',    date: 'May 18', destination: 'Accra, Ghana',      cargoType: 'Used clothing', cargo: 'Used clothing — Mixed apparel',  carrier: 'MSC Mediterranean', booking: 'MSC1234567' },
  { id: '4', ref: '#GFF-2031', status: 'Draft',        date: 'May 15', destination: 'Banjul, Gambia',    cargoType: 'Used auto',     cargo: 'Used auto — 2008 Toyota Corolla', carrier: 'MSC Mediterranean', booking: 'MSC1234567' },
  { id: '5', ref: '#GFF-2025', status: 'Completed',    date: 'May 9',  destination: 'Freetown, SL',      cargoType: 'Used machinery', cargo: 'Used machinery — Generator set', carrier: 'MSC Mediterranean', booking: 'MSC1234567' },
  { id: '6', ref: '#GFF-2018', status: 'Completed',    date: 'May 2',  destination: 'Monrovia, LR',      cargoType: 'Used auto',     cargo: 'Used auto — 2005 Honda CR-V',    carrier: 'MSC Mediterranean', booking: 'MSC1234567' },
];

export function getShipmentByRef(ref: string): Shipment | undefined {
  return SHIPMENTS.find(s => s.ref === ref);
}

// ─── Status timeline ──────────────────────────────────────────────────────────

export type TimelineState = 'done' | 'active' | 'pending';
export type TimelineStep  = { label: string; meta: string; state: TimelineState };

/**
 * Derives the four-stage status timeline (Created → Submitted → Docs review →
 * Approved) from a shipment's current status.
 */
export function getShipmentTimeline(status: ShipmentStatus): TimelineStep[] {
  const created   = { label: 'Created',     meta: 'May 26',      state: 'done' as TimelineState };
  const submitted = { label: 'Submitted',   meta: 'May 28',      state: 'done' as TimelineState };
  const docs      = { label: 'Docs review', meta: 'In progress', state: 'active' as TimelineState };
  const approved  = { label: 'Approved',    meta: '—',           state: 'pending' as TimelineState };

  switch (status) {
    case 'Draft':
      return [
        { ...created,   state: 'active',  meta: '—' },
        { ...submitted, state: 'pending', meta: '—' },
        { ...docs,      state: 'pending', meta: '—' },
        approved,
      ];
    case 'Submitted':
      return [created, { ...submitted, state: 'active' }, { ...docs, state: 'pending', meta: '—' }, approved];
    case 'Pending you':
      return [created, submitted, docs, approved];
    case 'Under review':
      return [created, submitted, { ...docs, state: 'done' }, approved];
    case 'Completed':
      return [created, submitted, { ...docs, state: 'done' }, { ...approved, state: 'done', meta: 'Jun 2' }];
  }
}
