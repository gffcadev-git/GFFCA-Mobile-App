import AsyncStorage from '@react-native-async-storage/async-storage';
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
  /** Increment this to bust the local AsyncStorage cache */
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

// ─── Fetch & cache ────────────────────────────────────────────────────────────

/**
 * Tries to fetch the remote theme.json from the CDN.
 * On success → saves to AsyncStorage and returns the new theme.
 * On failure → returns the AsyncStorage-cached theme if available,
 *              otherwise falls back to DEFAULT_THEME.
 */
export async function fetchRemoteTheme(): Promise<AppTheme> {
  try {
    const res = await fetch(THEME_URL, {
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const remote: AppTheme = await res.json();
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(remote));
    return mergeWithDefaults(remote);
  } catch {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      return mergeWithDefaults(JSON.parse(cached));
    }
    return DEFAULT_THEME;
  }
}

/**
 * Returns the AsyncStorage-cached theme synchronously (if available)
 * so the app can render the correct theme before the async fetch resolves.
 */
export async function getCachedTheme(): Promise<AppTheme> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) return mergeWithDefaults(JSON.parse(cached));
  } catch {
    // ignore
  }
  return DEFAULT_THEME;
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
