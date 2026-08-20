const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_PATTERN = /(?:\+?\d[\d().\s-]{7,}\d)/;
const LONG_NUMBER_PATTERN = /\b\d{6,}\b/;

/** Supplementary input check only. It is not automated PHI redaction. */
export function containsLikelyIdentifier(value: string): boolean {
  return EMAIL_PATTERN.test(value) || PHONE_PATTERN.test(value) || LONG_NUMBER_PATTERN.test(value);
}
