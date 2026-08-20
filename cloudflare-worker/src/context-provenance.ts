import type { KnowledgeSelection } from '../knowledge/source-selection';

export type ContextProvenance = {
  knowledge_bank_version: string;
  module_source_ids: string[];
  scientific_source_ids: string[];
  claim_ids: string[];
  safety_policy_ids: string[];
  context_byte_length: number;
  context_hash: string;
};

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonicalValue(entry)]));
  }
  return value;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalValue(value));
}

export async function contextProvenance(actualSuppliedContext: unknown, knowledge: KnowledgeSelection): Promise<ContextProvenance> {
  const canonical = canonicalJson(actualSuppliedContext);
  const bytes = new TextEncoder().encode(canonical);
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return {
    knowledge_bank_version: knowledge.knowledge_bank_version,
    module_source_ids: [...knowledge.module_source_ids],
    scientific_source_ids: [...knowledge.scientific_source_ids],
    claim_ids: [...knowledge.claim_ids],
    safety_policy_ids: [...knowledge.safety_policy_ids],
    context_byte_length: bytes.byteLength,
    context_hash: hash,
  };
}
