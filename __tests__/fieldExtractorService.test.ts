import {
  computeContainerCheckDigit,
  extractContainerNumber,
  extractSealNumber,
  isValidSealFormat,
  validateContainerNumber,
} from '../src/services/fieldExtractorService';

// MSKU907032 → check digit 3; TGHU307703 → check digit 0 (verified below).

describe('computeContainerCheckDigit', () => {
  it('computes the ISO 6346 mod-11 check digit', () => {
    expect(computeContainerCheckDigit('MSKU', '907032')).toBe('3');
    expect(computeContainerCheckDigit('TGHU', '307703')).toBe('0');
  });

  it('returns empty string for illegal characters', () => {
    expect(computeContainerCheckDigit('MS-U', '907032')).toBe('');
  });
});

describe('extractContainerNumber', () => {
  it('reads a door plate with spaced check digit and type code', () => {
    expect(extractContainerNumber('MSKU 907032 3\n45G1\nMAX GROSS 30480 KG'))
      .toBe('MSKU9070323');
  });

  it('reads an unspaced number', () => {
    expect(extractContainerNumber('MSKU9070323\n45G1')).toBe('MSKU9070323');
  });

  it('reads a serial that OCR split into chunks', () => {
    expect(extractContainerNumber('MSKU 9070 32 3\n45G1')).toBe('MSKU9070323');
  });

  it('reads owner and serial split across lines', () => {
    expect(extractContainerNumber('TGHU\n307703\n0\n22G1')).toBe('TGHU3077030');
  });

  it('completes a missing check digit from the computation', () => {
    expect(extractContainerNumber('MSKU 907032')).toBe('MSKU9070323');
  });

  it('rejects a read whose printed check digit disagrees (misread serial)', () => {
    // Serial misread 907032 → 907033; printed check digit 3 no longer matches.
    expect(extractContainerNumber('MSKU 907033 3\n45G1')).toBeNull();
  });

  it('skips surrounding text and earlier four-letter words', () => {
    expect(extractContainerNumber('CONTAINER NO\nMSKU 907032 3')).toBe('MSKU9070323');
  });

  it('does not mistake a long-prefix seal for a container', () => {
    expect(extractContainerNumber('EMCS123456')).toBeNull();
  });

  it('returns null when no container is present', () => {
    expect(extractContainerNumber('SEAL EU0240124')).toBeNull();
    expect(extractContainerNumber('')).toBeNull();
  });

  // BMOU233456 → check digit 5.
  it('repairs a digit misread inside the owner prefix (BM0U → BMOU)', () => {
    expect(extractContainerNumber('BM0U 233456 5\n45G1')).toBe('BMOU2334565');
    expect(extractContainerNumber('8MOU2334565')).toBe('BMOU2334565');
  });

  it('repairs a letter misread inside the serial (23345G → 233456)', () => {
    expect(extractContainerNumber('BMOU 23345G 5')).toBe('BMOU2334565');
    expect(extractContainerNumber('BMOU 2334S6 5')).toBe('BMOU2334565');
  });

  it('pairs the owner block when OCR returns it after the digits', () => {
    expect(extractContainerNumber('233456 5\n45G1\nBMOU')).toBe('BMOU2334565');
    expect(extractContainerNumber('2334565\nMAX GROSS 30480 KG\nBMOU')).toBe('BMOU2334565');
  });

  it('still rejects a repaired read whose check digit disagrees', () => {
    // Serial misread 233456 → 233457; printed check digit 5 no longer matches.
    expect(extractContainerNumber('BM0U 233457 5\n45G1')).toBeNull();
  });
});

describe('extractSealNumber', () => {
  it('keeps the hyphenated form verbatim', () => {
    expect(extractSealNumber('UL-7376584')).toBe('UL-7376584');
  });

  it('finds the value after a SEAL keyword', () => {
    expect(extractSealNumber('SEAL EU0240124')).toBe('EU0240124');
    expect(extractSealNumber('SEAL NO 10892345')).toBe('10892345');
  });

  it('finds a letter-prefixed token anywhere', () => {
    expect(extractSealNumber('Container: MSKU9070323  Seal: EU0240124')).toBe('EU0240124');
    expect(extractSealNumber('C1018924')).toBe('C1018924');
    expect(extractSealNumber('EMCS123456')).toBe('EMCS123456');
  });

  it('joins a prefix that OCR split from the digits', () => {
    expect(extractSealNumber('EU 0240124')).toBe('EU0240124');
  });

  it('accepts numeric-only seals', () => {
    expect(extractSealNumber('10892345')).toBe('10892345');
  });

  it('does not return a container read as the seal', () => {
    expect(extractSealNumber('MSKU9070323')).toBeNull();
  });

  it('returns null when nothing seal-shaped is present', () => {
    expect(extractSealNumber('MAX GROSS 30480 KG')).toBeNull();
    expect(extractSealNumber('')).toBeNull();
  });

  it('repairs look-alike letters inside the digits (UL-0l2045 → UL-012045)', () => {
    expect(extractSealNumber('UL-0l2045')).toBe('UL-012045');
    expect(extractSealNumber('EU 024O124')).toBe('EU0240124');
    expect(extractSealNumber('1089234S')).toBe('10892345');
  });

  it('handles short single-letter prefixes split from the digits', () => {
    expect(extractSealNumber('C 1018924')).toBe('C1018924');
  });

  it('does not let the SEAL keyword scan wander into far-away digits', () => {
    expect(extractSealNumber('SEAL DAMAGED REPLACE PER POLICY MSKU 907032')).toBeNull();
  });
});

describe('validateContainerNumber', () => {
  it('accepts a full valid number and reports the check digit', () => {
    expect(validateContainerNumber('MSKU 907032 3')).toEqual({
      valid: true,
      canonical: 'MSKU9070323',
      expectedCheckDigit: '3',
    });
  });

  it('completes a missing check digit', () => {
    expect(validateContainerNumber('msku907032').canonical).toBe('MSKU9070323');
  });

  it('flags a wrong check digit with the expected one', () => {
    expect(validateContainerNumber('MSKU9070324')).toEqual({
      valid: false,
      canonical: null,
      expectedCheckDigit: '3',
    });
  });
});

describe('isValidSealFormat', () => {
  it.each(['EU0240124', 'UL-7376584', 'C1018924', '10892345', 'emcs123456'])(
    'accepts %s',
    v => expect(isValidSealFormat(v)).toBe(true),
  );

  it.each(['', 'SEAL', '1234', 'ABCDE123456', 'EU 02 40124'])(
    'rejects %s',
    v => expect(isValidSealFormat(v)).toBe(false),
  );
});
