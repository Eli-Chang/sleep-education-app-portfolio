import manifest from './knowledge-bank-manifest.json';
import moduleEn from './module-content.en.json';
import moduleEs from './module-content.es.json';
import scientificSources from './scientific-sources.json';
import claimMap from './claim-map.json';
import safetyPolicies from './safety-policy.json';
import emergencyPolicy from './emergency-policy.json';
import { isDirectDiagnosisRequest } from '../src/safety-enforcement';
import { CONVERSATION_POLICY_ID } from '../../shared/conversation-policy';

export type KnowledgeLocale = 'en' | 'es';
export type KnowledgeSelection = {
  knowledge_bank_version: string;
  module_source_ids: string[];
  scientific_source_ids: string[];
  safety_policy_ids: string[];
  claim_ids: string[];
  module_context: Array<Record<string, unknown>>;
  scientific_context: Array<Record<string, unknown>>;
  safety_context: Array<Record<string, unknown>>;
  claim_context: Array<Record<string, unknown>>;
};

const normalize = (value: string) => value.toLocaleLowerCase();
const includesAny = (text: string, terms: string[]) => terms.some((term) => normalize(text).includes(term));

export function selectKnowledge(input: {
  moduleId: string;
  screenId?: string;
  locale: KnowledgeLocale;
  userText: string;
}): KnowledgeSelection | null {
  const text = normalize(input.userText);
  const pregnancy = includesAny(text, ['pregnan', 'embaraz', 'pregnancy', 'preeclampsia', 'gestational']) || input.moduleId === 'm4';
  const medication = includesAny(text, ['medication', 'medicine', 'medicamento', 'medicina', 'drug', 'pill', 'pastilla']);
  const pressureSubject = includesAny(text, ['pressure', 'presi\u00f3n', 'presion', 'setting', 'ajuste', 'cpap', 'pap']);
  const pressureDecision = includesAny(text, ['recommend', 'choose', 'set ', 'change', 'increase', 'decrease', 'adjust', 'for me', 'my pressure', 'my setting', 'recomienda', 'elegir', 'poner', 'cambiar', 'subir', 'bajar', 'ajustar', 'para m\u00ed', 'mi presi\u00f3n', 'mi presion', 'mi ajuste', 'what pressure should', 'which setting should', 'qu\u00e9 presi\u00f3n debo', 'qu\u00e9 ajuste debo']);
  const pressure = pressureSubject && pressureDecision;
  const airway = includesAny(text, ['airway', 'throat', 'narrow', 'obstruct', 'v\u00eda respiratoria', 'garganta', 'estrech']);
  const osaTopic = includesAny(text, ['sleep apnea', 'obstructive sleep apnea', 'osa', 'aos', 'apnea del sue\u00f1o', 'apnea del sueno', 'hypopnea', 'apnea-hypopnea']);
  const ahiTopic = includesAny(text, ['ahi', 'apnea-hypopnea index', 'apnea hypopnea index', '\u00edndice de apnea', 'indice de apnea']);
  const papTopic = includesAny(text, ['pap', 'cpap', 'positive airway pressure', 'presi\u00f3n positiva', 'presion positiva']);
  const questions = includesAny(text, ['healthcare team', 'care team', 'doctor', 'clinician', 'questions', 'equipo de salud', 'profesional', 'preguntas']);
  const urgent = includesAny(text, ['chest pain', 'severe shortness', "can't breathe", 'cannot breathe', 'dolor de pecho', 'no puedo respirar', 'emergencia']);
  const diagnosis = isDirectDiagnosisRequest(text);
  const personalAdvice = includesAny(text, ['my ', 'me ', 'for me', 'i ', 'should i', 'can i', 'mi ', 'para m\u00ed', 'debo'])
    && includesAny(text, ['symptom', 'condition', 'disease', 'treatment', 'what should', 'que debo', 'qu\u00e9 debo', 'pain', 'dolor']);

  const claimIds = new Set<string>();
  const policyIds = new Set<string>([CONVERSATION_POLICY_ID, 'POLICY-GENERAL-SCOPE', 'POLICY-LANGUAGE']);
  if (urgent) { claimIds.add('EMERGENCY_ESCALATION'); policyIds.add('POLICY-URGENT'); }
  else if (medication) { claimIds.add('MEDICATION_BOUNDARY'); policyIds.add('POLICY-MEDICATION'); }
  else if (pressure) { claimIds.add('PAP_PRESSURE_BOUNDARY'); policyIds.add('POLICY-PAP-SETTINGS'); }
  if (diagnosis) policyIds.add('POLICY-DIAGNOSIS');
  if (personalAdvice) policyIds.add('POLICY-PERSONALIZED-MEDICAL-ADVICE');
  if (diagnosis || medication || pressure || personalAdvice) policyIds.add('POLICY-CLINICIAN-REFERRAL');
  if (pregnancy) { claimIds.add('OSA_PREGNANCY_PAP_GENERAL'); claimIds.add('PREGNANCY_CLINICIAN_MONITORING'); policyIds.add('POLICY-PREGNANCY'); }
  if (airway || osaTopic || input.moduleId === 'm1') { claimIds.add('OSA_DEFINITION'); claimIds.add('AIRWAY_NARROWING'); }
  if (papTopic || pressure || input.moduleId === 'm1') claimIds.add('PAP_AIRWAY_SUPPORT');
  if (ahiTopic) claimIds.add('AHI_GENERAL_EDUCATION');
  if (questions) claimIds.add('HEALTHCARE_TEAM_QUESTIONS');
  if (input.moduleId === 'm5' || papTopic) claimIds.add('PAP_SIDE_EFFECTS_AND_BARRIERS');
  claimIds.add('OSA_EDUCATIONAL_ROLE');

  const modules = (input.locale === 'es' ? moduleEs.entries : moduleEn.entries).filter((entry) => entry.module_id === input.moduleId && (!input.screenId || entry.screen_id === input.screenId));
  const moduleContext = modules.length ? modules.slice(0, 2) : (input.locale === 'es' ? moduleEs.entries : moduleEn.entries).filter((entry) => entry.module_id === input.moduleId).slice(0, 2);
  const claims = claimMap.filter((claim) => claimIds.has(claim.claim_id));
  const scientificIds = [...new Set(claims.flatMap((claim) => claim.source_ids).filter((id) => id.startsWith('CHEST-') || id.startsWith('SASM-') || id.startsWith('AASM-') || id.startsWith('NHLBI-') || id.startsWith('AHA-')))];
  if (input.locale === 'es') {
    for (const id of scientificIds.filter((value) => value.endsWith('-EN'))) {
      const counterpart = `${id.slice(0, -3)}ES`;
      if (scientificSources.some((source) => source.source_id === counterpart)) scientificIds.push(counterpart);
    }
  }
  const safetyContext = safetyPolicies.filter((policy) => policyIds.has(policy.policy_id)).sort((a, b) => b.priority - a.priority);
  if (urgent) safetyContext.unshift(emergencyPolicy as unknown as typeof safetyContext[number]);
  return {
    knowledge_bank_version: manifest.knowledge_bank_version,
    module_source_ids: moduleContext.map((entry) => `${entry.module_id}:${entry.screen_id}`),
    scientific_source_ids: [...new Set(scientificIds)],
    safety_policy_ids: [...new Set(safetyContext.map((policy) => policy.policy_id))],
    claim_ids: [...claimIds].filter((id) => claims.some((claim) => claim.claim_id === id)),
    module_context: moduleContext as unknown as Array<Record<string, unknown>>,
    scientific_context: scientificSources.filter((source) => scientificIds.includes(source.source_id)).map((source) => ({ source_id: source.source_id, title: source.title, reviewed_summary: source.reviewed_summary, limitations: source.important_limitations, language: source.language })),
    safety_context: safetyContext as unknown as Array<Record<string, unknown>>,
    claim_context: claims.map((claim) => ({ claim_id: claim.claim_id, supported_statement: claim.supported_statement, limitations: claim.limitations, allowed_languages: claim.allowed_languages })),
  };
}

export const knowledgeBank = { manifest, scientificSources, claimMap, safetyPolicies, emergencyPolicy };
