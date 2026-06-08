import { storage } from '../services/storage';
import { Colors, ThemeColors } from './colors';
import { Spacing, ThemeSpacing } from './spacing';
import { Typography, ThemeTypography } from './typography';

// ─── Remote config URL ───────────────────────────────────────────────────────
// Replace with your actual CDN / Firebase Storage URL before going live.
const THEME_URL = 'https://cdn.gffca.com/config/theme.json';

const CACHE_KEY = '@gffca_theme_v1';

// ─── Types ───────────────────────────────────────────────────────────────────

export type RemoteAssets = {
  /** GFF Portal wordmark / logo */
  logo: string;
  /** Lock graphic used on ForgotPassword screens */
  lockIcon: string;
  /** Email-sent confirmation graphic */
  emailSentIcon: string;
  /** Dashboard welcome banner background */
  welcomeBanner: string;
};

export type AppTheme = {
  /** Increment this to bust the local (MMKV) theme cache */
  version: number;
  colors:     ThemeColors;
  assets:     RemoteAssets;
  spacing:    ThemeSpacing;
  typography: ThemeTypography;
};

// ─── Default (bundled) theme ──────────────────────────────────────────────────
// Used on first launch (no cache) or when the network is unreachable.

export const DEFAULT_ASSETS: RemoteAssets = {
  logo:          '',   // bundled screens use text-based logo
  lockIcon:      '',   // screens render an icon component as fallback
  emailSentIcon: '',
  welcomeBanner: '',
};

export const DEFAULT_THEME: AppTheme = {
  version:    1,
  colors:     Colors,
  assets:     DEFAULT_ASSETS,
  spacing:    Spacing,
  typography: Typography,
};

// ─── Fetch & cache (MMKV-backed) ──────────────────────────────────────────────

/**
 * Returns the MMKV-cached theme synchronously (or DEFAULT_THEME). Because MMKV
 * is sync, the provider can read this on the very first render → no theme flash.
 */
export function getCachedTheme(): AppTheme {
  const cached = storage.getString(CACHE_KEY);
  if (cached) {
    try {
      return mergeWithDefaults(JSON.parse(cached));
    } catch {
      // corrupt cache → fall through to default
    }
  }
  return DEFAULT_THEME;
}

/**
 * Tries to fetch the remote theme.json from the CDN.
 * On success → saves to MMKV and returns the new theme.
 * On failure → returns the MMKV-cached theme (or DEFAULT_THEME).
 */
export async function fetchRemoteTheme(): Promise<AppTheme> {
  try {
    const res = await fetch(THEME_URL, {
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const remote: AppTheme = await res.json();
    storage.set(CACHE_KEY, JSON.stringify(remote));
    return mergeWithDefaults(remote);
  } catch {
    return getCachedTheme();
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Deep-merges the remote payload on top of DEFAULT_THEME so that any keys
 * missing from the remote JSON gracefully fall back to the bundled values.
 */
function mergeWithDefaults(remote: Partial<AppTheme>): AppTheme {
  return {
    version:    remote.version ?? DEFAULT_THEME.version,
    colors:     { ...DEFAULT_THEME.colors,     ...remote.colors },
    assets:     { ...DEFAULT_ASSETS,           ...remote.assets },
    spacing:    { ...DEFAULT_THEME.spacing,    ...remote.spacing },
    typography: { ...DEFAULT_THEME.typography, ...remote.typography },
  };
}
