/**
 * GFFCA Mobile App - Typography Scale
 *
 * Covers font sizes, weights, letter-spacing, and line-heights
 * extracted from all screens and components. LOCAL FALLBACK —
 * live values come from remoteTheme.ts (OTA) via ThemeContext.
 */

export const Typography = {
  fontSize: {
    xs:   12,   // terms / fine print
    sm:   13,   // labels, captions, helper text
    md:   14,   // body copy, tagline, sub-heading
    base: 15,   // text input value
    lg:   16,   // button label
    xl:   17,   // screen / nav header title
    xxl:  26,   // page heading
    xxxl: 28,   // brand / hero title
    icon: 32,   // emoji icon placeholders
  },

  fontWeight: {
    regular:  '400' as const,
    medium:   '500' as const,
    semiBold: '600' as const,
    bold:     '700' as const,
  },

  letterSpacing: {
    tight:  0.1,
    normal: 0.2,
    wide:   0.4,
  },

  lineHeight: {
    tight:  18,
    normal: 22,
  },

  borderRadius: {
    sm:   8,
    md:   10,   // inputs
    lg:   12,   // buttons, cards
    full: 9999, // pill / circular
  },
};

export type ThemeTypography = typeof Typography;
