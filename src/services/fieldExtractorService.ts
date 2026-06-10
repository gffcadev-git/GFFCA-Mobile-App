/**
 * Field extraction for container & seal numbers from free-form OCR / manual text.
 *
 * Pure, offline, framework-free — text in → canonical field or null out.
 * See design/FIELD_PARSING_SPEC.md §3 (Container, ISO 6346) and §4 (Seal).
 *
 * Two OCR realities drive the design:
 *
 *  1. ML Kit fragments and reorders: "BMOU 233456 7" may arrive split across
 *     blocks ("BMOU" after the digits), with door markings (type code "45G1",
 *     weights) in between. So container extraction fuses the text into one
 *     alphanumeric stream, slides a window over *every* candidate position,
 *     and falls back to pairing a prefix block with a digits block.
 *
 *  2. OCR confuses look-alike characters (O↔0, I/l↔1, S↔5, B↔8, …). Each
 *     position in a container number is known to be a letter (owner prefix,
 *     chars 1–4) or a digit (serial+check, chars 5–11), so misreads are
 *     repaired positionally — "BM0U" → "BMOU", "23345G" → "233456" — and the
 *     ISO 6346 check digit then decides whether the repaired read is real.
 *     A read whose printed check digit disagrees is discarded; a read missing
 *     the check digit is completed from the computation. Output is always the
 *     canonical 11-char string.
 */

/** Collapse to one alphanumeric stream so OCR gaps/line-breaks can't split a read. */
const FUSE_REGEX = /[^A-Z0-9]+/g;

// ─── OCR confusable repair ──────────────────────────────────────────────────────

/** Digits OCR'd where a letter must be (container owner prefix). */
const LETTER_REPAIRS: Record<string, string> = {
  '0': 'O', '1': 'I', '2': 'Z', '4': 'A', '5': 'S', '6': 'G', '8': 'B',
};
/** Letters OCR'd where a digit must be (serial, check digit, seal digits). */
const DIGIT_REPAIRS: Record<string, string> = {
  O: '0', Q: '0', D: '0', I: '1', L: '1', Z: '2', S: '5', G: '6', T: '7', B: '8',
};

/** Force a run to letters, repairing confusables. null if a char can't be a letter. */
function repairToLetters(raw: string): string | null {
  let out = '';
  for (const ch of raw) {
    if (ch >= 'A' && ch <= 'Z') out += ch;
    else if (LETTER_REPAIRS[ch]) out += LETTER_REPAIRS[ch];
    else return null;
  }
  return out;
}

/** Force a run to digits, repairing confusables. null if a char can't be a digit. */
function repairToDigits(raw: string): string | null {
  let out = '';
  for (const ch of raw) {
    if (ch >= '0' && ch <= '9') out += ch;
    else if (DIGIT_REPAIRS[ch]) out += DIGIT_REPAIRS[ch];
    else return null;
  }
  return out;
}

const isDigit = (ch: string | undefined): boolean => ch != null && ch >= '0' && ch <= '9';

// ─── Container (ISO 6346) — AAAA NNNNNN C ───────────────────────────────────────

// Char→value lookup; underscores skip multiples of 11 (10, 22, 33) which would
// collide under mod-11. value(ch) = CHECK_CHARS.indexOf(ch).
const CHECK_CHARS = '0123456789A_BCDEFGHIJK_LMNOPQRSTU_VWXYZ';
const CHECK_POWERS = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];

/** mod-11 check digit over the 10 chars (owner+serial). '' if an illegal char. */
export function computeContainerCheckDigit(owner: string, serial: string): string {
  const full = (owner + serial).toUpperCase(); // 10 chars
  let sum = 0;
  for (let i = 0; i < full.length; i++) {
    const val = CHECK_CHARS.indexOf(full[i]);
    if (val < 0) return ''; // illegal char
    sum += val * CHECK_POWERS[i];
  }
  const check = sum % 11;
  return check === 10 ? '0' : String(check);
}

/**
 * Owner prefix at a window position: 3 repaired letters + a literal 'U'.
 *
 * Every freight container's owner code ends in 'U' (the ISO 6346 equipment
 * category), and no repair produces a 'U' — so anchoring on a real 'U'
 * accepts any owner prefix (BMOU, MSKU, TGHU, …) while killing the false
 * candidates that aggressive repair would otherwise mint from shifted
 * windows ("M0U2" → "MOUZ").
 */
function ownerAt(fused: string, i: number): string | null {
  if (fused[i + 3] !== 'U') return null;
  const head = repairToLetters(fused.slice(i, i + 3));
  return head ? head + 'U' : null;
}

/**
 * Extract a canonical 11-char container number, or null.
 *
 * Passes over the fused stream, strongest first:
 *  1. 11-char window — repaired owner + serial + printed check digit that
 *     verifies ("different container, different prefix" is fine: any
 *     U-anchored prefix is accepted, the check digit is the proof).
 *  2. 10-char window — owner + serial with nothing digit-like after it:
 *     the check digit wasn't captured, complete it.
 *  3. Block pairing — ML Kit sometimes returns the owner block *after* the
 *     digits block; pair a 4-char prefix token with a 6/7-digit token,
 *     again preferring a verifying check digit.
 * A read whose printed check digit disagrees is never returned — that's how
 * single-character misreads are rejected instead of silently accepted.
 */
export function extractContainerNumber(text: string): string | null {
  const upper = text.toUpperCase();
  const fused = upper.replace(FUSE_REGEX, '');

  // Pass 1 — verified 11-char windows.
  for (let i = 0; i + 11 <= fused.length; i++) {
    const owner = ownerAt(fused, i);
    if (!owner) continue;
    const digits = repairToDigits(fused.slice(i + 4, i + 11));
    if (!digits) continue;
    if (computeContainerCheckDigit(owner, digits.slice(0, 6)) === digits[6]) {
      return owner + digits;
    }
  }

  // Pass 2 — 10-char windows missing the check digit. A real digit right
  // after means pass 1 already judged (and rejected) the 11-char read.
  for (let i = 0; i + 10 <= fused.length; i++) {
    const owner = ownerAt(fused, i);
    if (!owner) continue;
    const serial = repairToDigits(fused.slice(i + 4, i + 10));
    if (!serial || isDigit(fused[i + 10])) continue;
    return owner + serial + computeContainerCheckDigit(owner, serial);
  }

  // Pass 3 — pair a prefix token with a digits token across reordered blocks.
  const tokens = upper.replace(FUSE_REGEX, ' ').trim().split(' ').filter(Boolean);
  const owners: string[] = [];
  const serialChecks: string[] = []; // 7 digits: serial + printed check
  const serials: string[] = [];      // 6 digits: check digit not captured
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.length === 4) {
      const owner = ownerAt(token, 0);
      if (owner) owners.push(owner);
    } else if (token.length === 7) {
      const digits = repairToDigits(token);
      if (digits) serialChecks.push(digits);
    } else if (token.length === 6) {
      const digits = repairToDigits(token);
      if (!digits) continue;
      // "233456 7" — a lone trailing digit is the printed check digit.
      const check = tokens[i + 1]?.length === 1 ? repairToDigits(tokens[i + 1]) : null;
      if (check) serialChecks.push(digits + check);
      else serials.push(digits);
    }
  }
  for (const owner of owners) {
    for (const digits of serialChecks) {
      if (computeContainerCheckDigit(owner, digits.slice(0, 6)) === digits[6]) {
        return owner + digits;
      }
    }
  }
  if (owners.length > 0 && serials.length > 0) {
    return owners[0] + serials[0] + computeContainerCheckDigit(owners[0], serials[0]);
  }
  return null;
}

/** Result of validating an already-entered container string (manual or parsed). */
export interface ContainerValidation {
  /** true when the string parses to a structurally-valid ISO 6346 container. */
  valid: boolean;
  /** Canonical 11-char form when valid, else null. */
  canonical: string | null;
  /** Computed check digit when owner+serial were readable, else null. */
  expectedCheckDigit: string | null;
}

/**
 * Validate a container value the user typed/confirmed. Unlike
 * {@link extractContainerNumber} (which mines a noisy OCR blob), this is strict
 * about the 11-char canonical shape but still reports the expected check digit
 * so the UI can explain a mismatch.
 */
export function validateContainerNumber(value: string): ContainerValidation {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const m = /^([A-Z]{4})(\d{6})(\d)?$/.exec(compact);
  if (!m) return { valid: false, canonical: null, expectedCheckDigit: null };

  const owner = m[1];
  const serial = m[2];
  const typedCheck = m[3];
  const expected = computeContainerCheckDigit(owner, serial);
  if (!expected) return { valid: false, canonical: null, expectedCheckDigit: null };

  const valid = typedCheck == null || typedCheck === expected;
  return {
    valid,
    canonical: valid ? owner + serial + expected : null,
    expectedCheckDigit: expected,
  };
}

// ─── Seal ───────────────────────────────────────────────────────────────────────

// No global standard exists and formats vary per supplier: "C1018924",
// "UL-7376584", "EU0240124", purely numeric "10892345" — and OCR salts the
// digits with look-alike letters ("UL-0l2045"). Accept 0–4 letter prefix +
// 5–10 digits with confusable repair on the digit part, preferring tokens
// flagged by a SEAL keyword, then prefixed tokens, then bare digit runs.

/** Tokens like "MSKU907032(3)" are container owner+serial reads, not seals. */
const CONTAINER_SHAPE_REGEX = /^[A-Z]{3}U\d{6,7}$/;
/** Hyphenated prefix form in the raw text, e.g. "UL-7376584" / "UL-0l2045". */
const SEAL_HYPHEN_REGEX = /\b([A-Z]{1,4})-([A-Z0-9]{5,10})\b/g;
const SEAL_KEYWORD_REGEX = /^SEALS?$/;
const SEAL_KEYWORD_FILLER_REGEX = /^(?:NO|NR|NUM|NUMBER)$/;

type SealParts = Readonly<{ prefix: string; digits: string }>;

/**
 * Split a token into letter prefix + repaired digits, or null when it isn't
 * seal-shaped. Bare digit runs need 6+ digits (5-digit runs are usually
 * weights/markings); prefixed runs need 5+.
 */
function splitSealToken(token: string): SealParts | null {
  const prefix = /^[A-Z]*/.exec(token)![0];
  if (prefix.length > 4 || prefix.length === token.length) return null;
  const digits = repairToDigits(token.slice(prefix.length));
  if (!digits) return null;
  if (digits.length < (prefix ? 5 : 6) || digits.length > 10) return null;
  if (CONTAINER_SHAPE_REGEX.test(prefix + digits)) return null;
  return { prefix, digits };
}

/** Seal from a token, optionally requiring a letter prefix. */
function sealFromToken(token: string, requirePrefix: boolean): string | null {
  const parts = splitSealToken(token);
  if (!parts || (requirePrefix && !parts.prefix)) return null;
  return parts.prefix + parts.digits;
}

/** Seal from a letters-only token followed by a digits-only token ("EU 0240124"). */
function sealFromPair(letters: string, next: string | undefined): string | null {
  if (next == null) return null;
  if (!/^[A-Z]{1,4}$/.test(letters) || SEAL_KEYWORD_FILLER_REGEX.test(letters)) return null;
  const digits = repairToDigits(next);
  if (!digits || digits.length < 5 || digits.length > 10) return null;
  const fusedForm = letters + digits;
  return CONTAINER_SHAPE_REGEX.test(fusedForm) ? null : fusedForm;
}

/** True when the token visibly contains enough real digits to be a bare seal. */
function looksNumeric(token: string): boolean {
  let count = 0;
  for (const ch of token) if (isDigit(ch)) count++;
  return count >= 4;
}

/** Hyphenated prefix form, kept hyphenated ("UL-0l2045" → "UL-012045"). */
function sealFromHyphenForm(upper: string): string | null {
  for (const m of upper.matchAll(SEAL_HYPHEN_REGEX)) {
    const digits = repairToDigits(m[2]);
    if (digits) return `${m[1]}-${digits}`;
  }
  return null;
}

/**
 * Value within a few tokens of a "SEAL [NO]" keyword — capped so the scan
 * can't wander into unrelated text.
 */
function sealAfterKeyword(tokens: readonly string[]): string | null {
  for (let i = 0; i < tokens.length; i++) {
    if (!SEAL_KEYWORD_REGEX.test(tokens[i])) continue;
    let j = i + 1;
    while (j < tokens.length && SEAL_KEYWORD_FILLER_REGEX.test(tokens[j])) j++;
    const limit = Math.min(tokens.length, j + 3);
    for (; j < limit; j++) {
      const seal = sealFromToken(tokens[j], false) ?? sealFromPair(tokens[j], tokens[j + 1]);
      if (seal) return seal;
    }
  }
  return null;
}

/** Letter-prefixed token anywhere, including a prefix split from its digits. */
function sealFromPrefixedToken(tokens: readonly string[]): string | null {
  for (let i = 0; i < tokens.length; i++) {
    const seal = sealFromToken(tokens[i], true) ?? sealFromPair(tokens[i], tokens[i + 1]);
    if (seal) return seal;
  }
  return null;
}

/**
 * Bare digit run (numeric-only seals). A run right after a 4-letter
 * category-U prefix is a container serial, not a seal.
 */
function sealFromBareDigits(tokens: readonly string[]): string | null {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!looksNumeric(token)) continue;
    const prev = i > 0 ? tokens[i - 1] : '';
    if (prev.length === 4 && repairToLetters(prev)?.endsWith('U')) continue;
    const seal = sealFromToken(token, false);
    if (seal) return seal;
  }
  return null;
}

/**
 * Extract the first seal-shaped value from OCR text, upper-cased, or null.
 *
 * Passes, strongest first:
 *  1. hyphenated prefix form, kept hyphenated ("UL-0l2045" → "UL-012045");
 *  2. token(s) right after a "SEAL [NO]" keyword;
 *  3. any letter-prefixed token ("C1018924", "EU0240124"), joining a
 *     "EU 0240124" split;
 *  4. a bare digit run of 6–10 (numeric-only seals), confusables repaired.
 */
export function extractSealNumber(text: string): string | null {
  const upper = text.toUpperCase();
  const tokens = upper.replace(FUSE_REGEX, ' ').trim().split(' ').filter(Boolean);
  return (
    sealFromHyphenForm(upper) ??
    sealAfterKeyword(tokens) ??
    sealFromPrefixedToken(tokens) ??
    sealFromBareDigits(tokens)
  );
}

/** Format-only check (no checksum) for a manually-entered seal number. */
export function isValidSealFormat(value: string): boolean {
  return /^[A-Z]{0,4}[- ]?\d{5,10}$/.test(value.trim().toUpperCase());
}
