/**
 * Field extraction for container & seal numbers from free-form OCR / manual text.
 *
 * Pure, offline, framework-free — text in → canonical field or null out.
 * See design/FIELD_PARSING_SPEC.md §3 (Container, ISO 6346) and §4 (Seal).
 *
 * The reliability trick for containers (§3.4): the *computed* check digit is
 * authoritative. A read whose printed check digit disagrees is discarded
 * (likely an OCR error); a read missing the check digit is completed from the
 * computation. Output is always the canonical 11-char string.
 */

// ─── Container (ISO 6346) — AAAA NNNNNN C ───────────────────────────────────────

/** Strip punctuation to spaces before matching, so gaps/line-breaks tolerate. */
const CONTAINER_CLEAN_REGEX = /[^A-Z0-9\s]/gi;
/** owner(4 letters) · gap≤10 · serial(6 digits) · gap≤8 · check(1 digit, optional). */
const CONTAINER_REGEX = /\b([A-Z]{4})[\s\S]{0,10}?(\d{6})[\s\S]{0,8}?(\d)?\b/i;

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
 * Extract a canonical 11-char container number, or null.
 *
 * The computed check digit is authoritative: if OCR also read a check digit it
 * MUST match (else reject as a misread); if OCR didn't capture it, the computed
 * digit is appended.
 */
export function extractContainerNumber(text: string): string | null {
  const cleaned = text.replace(CONTAINER_CLEAN_REGEX, ' ');
  const m = CONTAINER_REGEX.exec(cleaned);
  if (!m) return null;

  const owner = m[1].toUpperCase();
  const serial = m[2];
  const ocrCheckDigit = m[3]; // may be undefined
  const computed = computeContainerCheckDigit(owner, serial);
  if (!computed) return null;

  if (ocrCheckDigit != null && ocrCheckDigit !== computed) return null;
  return owner + serial + computed; // canonical 11-char ID
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

/** 1–3 letter prefix, optional hyphen, 6–8 digits. No checksum standard exists. */
const SEAL_REGEX = /\b([A-Z]{1,3}-?\d{6,8})\b/i;

/** Extract the first seal-shaped token from OCR text, upper-cased, or null. */
export function extractSealNumber(text: string): string | null {
  const m = SEAL_REGEX.exec(text);
  return m ? m[1].toUpperCase() : null;
}

/** Format-only check (no checksum) for a manually-entered seal number. */
export function isValidSealFormat(value: string): boolean {
  return SEAL_REGEX.test(value.trim());
}
