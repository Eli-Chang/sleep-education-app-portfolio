export type DetectedLanguage = 'ENGLISH' | 'SPANISH' | 'MIXED' | 'UNCERTAIN';

type SegmentLanguage = 'ENGLISH' | 'SPANISH' | 'MIXED' | 'UNCERTAIN';

// Classification is deliberately local and conservative. Meaningful clauses are
// classified independently so a short wrong-language clause cannot be hidden by
// a larger dominant-language paragraph.
const ENGLISH_MARKERS = new Set([
  'a', 'about', 'airway', 'and', 'answer', 'are', 'ask', 'because', 'better', 'but', 'by', 'can', 'care', 'clear', 'could', 'doctor', 'does', 'during', 'english', 'explain', 'follow', 'for', 'from', 'guidance', 'has', 'have', 'healthcare', 'help', 'however', 'how', 'if', 'in', 'important', 'is', 'it', 'keep', 'may', 'of', 'only', 'open', 'or', 'part', 'please', 'pressure', 'remains', 'should', 'sleep', 'speak', 'study', 'talk', 'team', 'that', 'the', 'then', 'this', 'to', 'use', 'way', 'when', 'which', 'will', 'with', 'would', 'you', 'your',
]);

const EXTENDED_ENGLISH_MARKERS = new Set([
  'both', 'change', 'difference', 'device', 'delivers', 'effective', 'explains', 'fixed', 'form', 'forms', 'general', 'helps', 'information', 'level', 'main', 'need', 'night', 'pattern', 'positive', 'prescribed', 'provides', 'range', 'science', 'support', 'therapy', 'throughout', 'upper', 'used', 'usual', 'vary', 'whereas', 'within',
]);

const SPANISH_MARKERS = new Set([
  'a', 'abierta', 'abiertas', 'acostarse', 'afectar', 'al', 'atencion', 'atención', 'ayuda', 'ayudar', 'cada', 'como', 'cómo', 'con', 'consulte', 'de', 'debe', 'del', 'durante', 'el', 'equipo', 'es', 'esta', 'estudio', 'hable', 'importante', 'insomnio', 'la', 'las', 'los', 'mantener', 'medica', 'médica', 'medico', 'médico', 'medico', 'noche', 'para', 'pero', 'por', 'preguntas', 'profesional', 'puede', 'que', 'qué', 'respiracion', 'respiración', 'respiratorias', 'salud', 'se', 'su', 'sueño', 'tome', 'tomar', 'una', 'un', 'via', 'vía', 'vias', 'vías',
]);

const IGNORED_TERMS = new Set([
  'aasm', 'api', 'citation', 'citations', 'cpap', 'groq', 'id', 'nhlbi', 'osa', 'pap', 'ref', 'reference', 'references', 'source', 'sources',
]);

// Shared function words are not reliable language evidence. In particular,
// counting "a" as Spanish can turn an otherwise ordinary English PAP answer
// into a false MIXED result.
const AMBIGUOUS_MARKERS = new Set(['a']);

function tokensFor(value: string): string[] {
  return value.toLocaleLowerCase().normalize('NFC').match(/[a-záéíóúüñ]+/giu) ?? [];
}

function meaningfulTokens(value: string): string[] {
  return tokensFor(value).filter(token => !IGNORED_TERMS.has(token) && !/^\d+$/.test(token));
}

function classifySegment(value: string): SegmentLanguage | null {
  const tokens = meaningfulTokens(value);
  if (tokens.length < 2) return null;
  const normalized = value.toLocaleLowerCase().normalize('NFC');
  let english = 0;
  let spanish = 0;
  if (/[áéíóúüñ¿¡]/u.test(normalized)) spanish += 2;
  for (const token of tokens) {
    if (AMBIGUOUS_MARKERS.has(token)) continue;
    if (ENGLISH_MARKERS.has(token) || EXTENDED_ENGLISH_MARKERS.has(token)) english += 1;
    if (SPANISH_MARKERS.has(token)) spanish += 1;
  }
  const unambiguousSpanish = tokens.filter(token => SPANISH_MARKERS.has(token) && !AMBIGUOUS_MARKERS.has(token)).length;
  english += (normalized.match(/\b(?:the|this|that|your|you|can|should|may|please)\s+[a-záéíóúüñ]+/giu) ?? []).length;
  spanish += (normalized.match(/\b(?:el|la|los|las|su|sus|un|una|puede|debe|consulte|hable)\s+[a-záéíóúüñ]+/giu) ?? []).length;
  english += tokens.filter(token => /(?:ing|tion|ness|ment|ly)$/.test(token)).length * 0.5;
  spanish += tokens.filter(token => /(?:ción|ciones|mente|ando|iendo|ado|ada|ados|adas|ido|ida)$/.test(token)).length * 0.5;
  const hasEnglishEvidence = english >= 2;
  const hasSpanishEvidence = spanish >= 2 || unambiguousSpanish >= 2;
  if (hasEnglishEvidence && unambiguousSpanish >= 1) return 'MIXED';
  if (hasEnglishEvidence && hasSpanishEvidence) return 'MIXED';
  if (hasEnglishEvidence) return 'ENGLISH';
  if (hasSpanishEvidence) return 'SPANISH';
  return 'UNCERTAIN';
}

export function detectEnglishSpanish(value: string): DetectedLanguage {
  const segments = value
    .split(/(?:[.!?;:]+|\r?\n+)+/u)
    .map(segment => segment.trim())
    .filter(Boolean);
  const classifications = segments.map(classifySegment).filter((value): value is SegmentLanguage => value !== null);
  const meaningfulClassifications = classifications.filter(value => value !== 'UNCERTAIN');
  if (meaningfulClassifications.includes('MIXED')) return 'MIXED';
  if (meaningfulClassifications.includes('ENGLISH') && meaningfulClassifications.includes('SPANISH')) return 'MIXED';
  // Short list fragments such as "Warning signs include" or "Rapid
  // spreading" carry too little independent evidence to override the
  // meaningful language classification of the surrounding prose. A
  // meaningful foreign-language clause is still classified above as MIXED.
  if (meaningfulClassifications.length === 0) return 'UNCERTAIN';
  return meaningfulClassifications[0];
}

export function languageMatchesLocale(value: string, locale: 'en' | 'es'): { accepted: boolean; detected: DetectedLanguage } {
  const detected = detectEnglishSpanish(value);
  return { accepted: detected === (locale === 'en' ? 'ENGLISH' : 'SPANISH'), detected };
}

export const languageFallback = {
  en: 'I could not verify this response in English. I can still provide general sleep and health education, but a healthcare professional should help with individualized questions.',
  es: 'No pude verificar esta respuesta en español. Todavía puedo ofrecer educación general sobre el sueño y la salud, pero un profesional debe ayudar con preguntas individuales.',
} as const;
