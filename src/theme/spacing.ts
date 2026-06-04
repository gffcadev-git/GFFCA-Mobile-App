/**
 * GFFCA Mobile App - Spacing Scale
 *
 * 4 px base grid. All values are derived from real usage across
 * screens and components. LOCAL FALLBACK — live values come from
 * remoteTheme.ts (OTA) via ThemeContext.
 */

export const Spacing = {
  // Base scale
  xxs:  4,
  xs:   8,
  sm:   12,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,

  // Semantic layout tokens
  screenHorizontal: 24,   // outer horizontal padding for all screens
  headerHorizontal: 20,   // horizontal padding inside ScreenHeader
  inputHorizontal:  14,   // horizontal padding inside text inputs
  safeBottom:       24,   // extra bottom padding above safe-area edge

  // Component dimensions
  buttonHeight: 52,
  inputHeight:  48,
  headerSide:   44,       // width of left/right slots in ScreenHeader
};

export type ThemeSpacing = typeof Spacing;
