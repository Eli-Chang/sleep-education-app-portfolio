import manifest from '../evidence/manifest.json';
import osaBasics from '../evidence/osa-basics.json';
import pap from '../evidence/pap.json';
import pregnancy from '../evidence/pregnancy.json';
import sleepHygiene from '../evidence/sleep-hygiene.json';
import relationships from '../evidence/relationships.json';

export type EvidenceEntry = {
  source_id: string; context_id: string; locale: 'en' | 'es'; topic: string; approved_text: string;
  source_title: string; source_location: string; version: string; review_status: string;
};
export const evidenceBankVersion = manifest.evidence_bank_version;
const entries = [...osaBasics, ...pap, ...pregnancy, ...sleepHygiene, ...relationships] as EvidenceEntry[];

export function getEvidence(contextId: string, locale: 'en' | 'es', enabled: boolean, version?: string): EvidenceEntry[] {
  if (!enabled || version !== evidenceBankVersion) return [];
  return entries.filter(entry => entry.context_id === contextId && entry.locale === locale);
}

export function isValidEvidenceId(sourceId: string, supplied: EvidenceEntry[]): boolean {
  return supplied.some(entry => entry.source_id === sourceId);
}
