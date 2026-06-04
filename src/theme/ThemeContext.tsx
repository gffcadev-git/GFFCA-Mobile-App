import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  AppTheme,
  DEFAULT_THEME,
  fetchRemoteTheme,
  getCachedTheme,
} from './remoteTheme';

// ─── Context ──────────────────────────────────────────────────────────────────

type ThemeContextValue = {
  theme: AppTheme;
  /** True while the initial fetch is in-flight and no cache exists yet */
  loading: boolean;
  /** Call this to manually force a refresh (e.g. pull-to-refresh) */
  refresh: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme:   DEFAULT_THEME,
  loading: true,
  refresh: async () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme]     = useState<AppTheme>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const updated = await fetchRemoteTheme();
    setTheme(updated);
  }, []);

  // On mount: load cache first (instant), then fetch latest in background
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const cached = await getCachedTheme();
      if (!cancelled) {
        setTheme(cached);
        setLoading(false);
      }
      const fresh = await fetchRemoteTheme();
      if (!cancelled) setTheme(fresh);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // Re-fetch whenever the app comes back to foreground
  useEffect(() => {
    const sub = AppState.addEventListener(
      'change',
      (state: AppStateStatus) => {
        if (state === 'active') refresh();
      },
    );
    return () => sub.remove();
  }, [refresh]);

  return (
    <ThemeContext.Provider value={{ theme, loading, refresh }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Returns the full AppTheme object (colors + assets + version). */
export function useTheme(): AppTheme {
  return useContext(ThemeContext).theme;
}

/** Returns only the color palette — shorthand for the majority of use-sites. */
export function useColors() {
  return useContext(ThemeContext).theme.colors;
}

/** Returns only the remote asset URLs. */
export function useAssets() {
  return useContext(ThemeContext).theme.assets;
}

/** Returns the spacing scale. */
export function useSpacing() {
  return useContext(ThemeContext).theme.spacing;
}

/** Returns the typography scale (font sizes, weights, letter-spacing, border radii). */
export function useTypography() {
  return useContext(ThemeContext).theme.typography;
}

/** True while the very first fetch is in-flight and no cache exists. */
export function useThemeLoading(): boolean {
  return useContext(ThemeContext).loading;
}
