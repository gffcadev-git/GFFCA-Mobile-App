/**
 * VIN (Vehicle Identification Number) decoder — ISO 3779.
 *
 * Pure, offline, framework-free. OCR/manual text in → decoded segments +
 * checksum out. See design/FIELD_PARSING_SPEC.md §2 for the full reference.
 *
 *   17 chars, alphabet [A-Z0-9] except I, O, Q (banned to avoid 1/0 confusion).
 *   pos 1-3  WMI    world manufacturer identifier (region in §2.4)
 *   pos 4-8  VDS    vehicle descriptor section
 *   pos 9    CD     weighted mod-11 check digit over the whole VIN
 *   pos 10   YEAR   model-year code (30-year repeating cycle, §2.5)
 *   pos 11   PLANT  assembly plant
 *   pos 12-17 SERIAL production serial
 */

/** Strict VIN: excludes I, O, Q. Used for gating ("is there a VIN here?") + storage. */
export const VIN_STRICT = /\b[A-HJ-NPR-Z0-9]{17}\b/i;
/** Loose VIN: any A-Z0-9. Used in the decoder UI so I/O/Q typos still surface. */
export const VIN_LOOSE = /\b[A-Z0-9]{17}\b/gi;

/** Letters illegal in a VIN — surfaced so the user can repair an OCR misread. */
const ILLEGAL_VIN_CHARS = ['I', 'O', 'Q'];

// Transliteration table for the check-digit sum. I/O/Q are absent (illegal).
const letterValues: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};
// Positional weights; position 9 (the check digit itself) has weight 0.
const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export interface VinAnalysis {
  /** Trimmed, upper-cased input. */
  vin: string;
  /** length === 17 */
  lengthOk: boolean;
  /** Any I/O/Q found, de-duped. */
  invalidChars: string[];
  /** Region + country derived from WMI position 1 (§2.4). */
  regionAndCountry: string;
  /** Model year from position 10, both cycle years e.g. "1996 / 2026" (§2.5). */
  modelYear: string;
  /** true/false when checkable; null when length≠17 or an illegal char is present. */
  checkDigitValid: boolean | null;
  /** The computed check digit (digit or "X"); null when not computable. */
  expectedCheckDigit: string | null;
}

/** Region / country from WMI position 1 (§2.4). */
function regionFromWmi(c: string): string {
  switch (c) {
    case '1': case '4': case '5': return 'North America · United States';
    case '2': return 'North America · Canada';
    case '3': return 'North America · Mexico';
    case '6': return 'Oceania · Australia';
    case '8': case '9': return 'South America · Brazil / Argentina';
    case 'J': return 'Asia · Japan';
    case 'K': return 'Asia · South Korea';
    case 'L': return 'Asia · China';
    case 'R': return 'Asia · Taiwan';
    case 'S': return 'Europe · United Kingdom';
    case 'V': return 'Europe · France / Spain';
    case 'W': return 'Europe · Germany';
    case 'Y': return 'Europe · Sweden / Finland';
    case 'Z': return 'Europe · Italy';
    default:  return 'Unknown Region';
  }
}

// Model-year code → the two years (30 yrs apart) it maps to (§2.5).
const yearMap: Record<string, [number, number]> = {
  A: [1980, 2010], B: [1981, 2011], C: [1982, 2012], D: [1983, 2013], E: [1984, 2014],
  F: [1985, 2015], G: [1986, 2016], H: [1987, 2017], J: [1988, 2018], K: [1989, 2019],
  L: [1990, 2020], M: [1991, 2021], N: [1992, 2022], P: [1993, 2023], R: [1994, 2024],
  S: [1995, 2025], T: [1996, 2026], V: [1997, 2027], W: [1998, 2028], X: [1999, 2029],
  Y: [2000, 2030], '1': [2001, 2031], '2': [2002, 2032], '3': [2003, 2033], '4': [2004, 2034],
  '5': [2005, 2035], '6': [2006, 2036], '7': [2007, 2037], '8': [2008, 2038], '9': [2009, 2039],
};

function modelYearFromCode(c: string): string {
  const pair = yearMap[c];
  return pair ? `${pair[0]} / ${pair[1]}` : 'Unknown';
}

/**
 * Decode + validate a VIN. Engine-agnostic: pass any trimmed candidate string.
 *
 * A VIN is "valid for display" when `lengthOk && invalidChars.length === 0`.
 * The checksum is reported separately so a failed check (not universally
 * enforced worldwide) is a warning, not a hard reject — see §2.3 caveat.
 */
export function analyzeVin(raw: string): VinAnalysis {
  const vin = raw.trim().toUpperCase().replace(/\s+/g, '');
  const lengthOk = vin.length === 17;

  const invalidChars = Array.from(
    new Set(vin.split('').filter(c => ILLEGAL_VIN_CHARS.includes(c))),
  );

  const regionAndCountry = vin.length >= 1 ? regionFromWmi(vin[0]) : 'Unknown Region';
  const modelYear = vin.length >= 10 ? modelYearFromCode(vin[9]) : 'Unknown';

  let checkDigitValid: boolean | null = null;
  let expectedCheckDigit: string | null = null;

  if (lengthOk) {
    let sum = 0;
    let computable = true;
    for (let i = 0; i < 17; i++) {
      const c = vin[i];
      const val = c >= '0' && c <= '9' ? parseInt(c, 10) : (letterValues[c] ?? -1);
      if (val === -1) { computable = false; break; } // illegal char → can't validate
      sum += val * weights[i];
    }
    if (computable) {
      const rem = sum % 11;
      expectedCheckDigit = rem === 10 ? 'X' : String(rem);
      checkDigitValid = vin[8] === expectedCheckDigit;
    }
  }

  return {
    vin,
    lengthOk,
    invalidChars,
    regionAndCountry,
    modelYear,
    checkDigitValid,
    expectedCheckDigit,
  };
}

/** True when the VIN is the right shape to show/store (length + legal chars). */
export function isVinDisplayable(a: VinAnalysis): boolean {
  return a.lengthOk && a.invalidChars.length === 0;
}

/** Everything that can't be part of a VIN — stripped to fuse OCR-split reads. */
const VIN_FUSE_REGEX = /[^A-Z0-9]/g;

/**
 * Collect candidate VINs from a block of OCR text, best first.
 *
 * Two passes, mirroring the container extractor's tolerance:
 *  1. Clean contiguous matches in the raw text (fast path, no noise).
 *  2. Fused-stream 17-char windows — handles OCR that splits the VIN with
 *     stray spaces / line breaks ("1HGCM8 2633A0 04352"). A window is kept
 *     only when displayable (17 legal chars), and checksum-valid reads are
 *     ordered first so a genuine VIN wins over an accidental 17-char run.
 *
 * Without this second pass a VIN that doesn't OCR into one unbroken token
 * never parses, so the auto-scan camera loops forever and the field stays
 * empty — unlike container/seal, which already fuse before matching.
 */
export function extractVins(text: string): string[] {
  const upper = text.toUpperCase();

  // Pass 1 — clean contiguous matches.
  const clean = Array.from(new Set([...upper.matchAll(VIN_LOOSE)].map(m => m[0])));
  if (clean.length > 0) return clean;

  // Pass 2 — slide a 17-char window over the fused (separator-stripped) stream.
  const fused = upper.replace(VIN_FUSE_REGEX, '');
  const anchored: string[] = []; // checksum verifies — strongest signal
  const fallback: string[] = []; // right shape, checksum not enforced/var
  const seen = new Set<string>();
  for (let i = 0; i + 17 <= fused.length; i++) {
    const candidate = fused.slice(i, i + 17);
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    const a = analyzeVin(candidate);
    if (!isVinDisplayable(a)) continue;
    (a.checkDigitValid === true ? anchored : fallback).push(candidate);
  }
  return [...anchored, ...fallback];
}
