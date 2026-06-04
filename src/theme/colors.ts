/**
 * GFFCA Mobile App - Color Palette
 *
 * Extracted from UI designs in /data. Dark navy + purple theme.
 * This file is the LOCAL FALLBACK — the live values are fetched
 * from remote config via remoteTheme.ts and injected via ThemeContext.
 */

export const Colors = {
  // App backgrounds
  background: {
    default: '#0A0B15',   // main screen background (dark navy)
    paper:   '#141528',   // cards, input fields
    elevated:'#1C1D38',   // modals, bottom sheets
  },

  // Borders & dividers
  border:  '#252640',
  divider: '#1E1F36',

  // Brand / Primary — violet-purple (all CTA buttons across screens)
  primary: {
    main:          '#7C4FE0',
    light:         '#9B72F0',
    dark:          '#5C32C0',
    contrastText:  '#FFFFFF',
  },

  // Text
  text: {
    primary:   '#FFFFFF',
    secondary: '#8080A0',  // muted purple-gray (subtitles, labels)
    disabled:  '#505070',
    hint:      '#3E3F5E',
    link:      '#9B72F0',  // "Forgot password?", "Resend link"
  },

  // Semantic states
  success: {
    main:          '#10B981',
    light:         '#D1FAE5',
    dark:          '#059669',
    contrastText:  '#FFFFFF',
  },
  error: {
    main:          '#EF4444',
    light:         '#FEE2E2',
    dark:          '#DC2626',
    contrastText:  '#FFFFFF',
  },
  warning: {
    main:          '#F59E0B',
    light:         '#FEF3C7',
    dark:          '#D97706',
    contrastText:  '#1A1A2E',
  },
  info: {
    main:          '#38BDF8',
    light:         '#E0F2FE',
    dark:          '#0284C7',
    contrastText:  '#FFFFFF',
  },

  // Status badge tones (visible on Dashboard)
  badge: {
    green: '#10B981',
    blue:  '#38BDF8',
    purple:'#7C4FE0',
  },

  // Neutral grays
  gray: {
    50:  '#F8F9FA',
    100: '#F1F3F5',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#6C757D',
    700: '#495057',
    800: '#343A40',
    900: '#212529',
  },

  // Social auth
  social: {
    google:   '#DB4437',
    apple:    '#FFFFFF',
    facebook: '#1877F2',
  },

  // Shadows
  shadow: {
    light:  'rgba(0, 0, 0, 0.15)',
    medium: 'rgba(0, 0, 0, 0.30)',
    dark:   'rgba(0, 0, 0, 0.50)',
  },

  // Overlay (modals, drawers)
  overlay: 'rgba(0, 0, 0, 0.65)',

  // Fixed utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type ThemeColors = typeof Colors;
