import type { KnowledgeSelection } from '../knowledge/source-selection';

export type SafetyIntent = 'EMERGENCY' | 'MEDICATION_SELECTION' | 'PAP_PRESSURE_SELECTION' | 'DIAGNOSIS_REQUEST' | 'PERSONALIZED_MEDICAL_ADVICE' | 'PREGNANCY_PAP_EDUCATION' | 'GENERAL_EDUCATION';
export type SafetyViolation = 'PAP_PRESSURE_DIRECTIVE' | 'MEDICATION_DIRECTIVE' | 'DIAGNOSIS_ASSERTION' | 'TREATMENT_DIRECTIVE' | 'UNQUALIFIED_UNIVERSAL_SAFETY_CLAIM';
export type SafetyPolicyClass = 'PAP_SETTING_DIRECTIVE' | 'DIAGNOSIS_ASSERTION' | 'MEDICATION_RECOMMENDATION' | 'MEDICATION_DOSING' | 'MEDICATION_START_STOP' | 'OTHER_PROHIBITED_TREATMENT_DIRECTIVE' | 'UNQUALIFIED_UNIVERSAL_SAFETY_CLAIM';

export type PregnancyPolicyConcept = 'PREGNANCY_PAP_GENERAL_EDUCATION' | 'PREGNANCY_CLINICAL_OVERSIGHT' | 'PREGNANCY_EVIDENCE_LIMITATION';

export type PregnancyBoundaryResult = {
  allowed: boolean;
  generalEducation: boolean;
  clinicalOversight: boolean;
  evidenceLimitation: boolean;
  missing: PregnancyPolicyConcept[];
};

const has = (value: string, patterns: RegExp[]) => patterns.some(pattern => pattern.test(value));
const namedSleepProduct = /\b(?:melatonin|melatonina|diphenhydramine|difenhidramina|doxylamine|doxilamina|trazodone|trazodona|zolpidem|ambien|benadryl|unisom|valerian|valeriana|magnesium|magnesio|cbd|cannabis|antihistamine|antihistam(?:ine|ínico)|supplement|suplemento)\b/i;
const diagnosisTopic = /\b(?:sleep apnea|obstructive sleep apnea|osa|aos|apnea(?: del sue[nñ]o)?)\b/i;
const directDiagnosisPatterns = [
  /\b(?:do|does|could|would)\s+(?:i|you|this|that)\b.{0,90}\b(?:have|mean|suggest|indicate|confirm|show)\b/i,
  /\b(?:am i|do i|could i|would you say i|can you tell me if i|do you think i|so i)\b.{0,100}\b(?:have|likely)\b/i,
  /\b(?:based on (?:my symptoms?|what i (?:told|said) you|my sleep study|my results?))\b.{0,110}\b(?:do i have|am i likely|does (?:this|that) mean|sleep apnea|osa)\b/i,
  /\b(?:do my symptoms?|does my snoring|does my sleep study|do my results?)\b.{0,100}\b(?:mean|indicate|suggest|show|confirm|have)\b/i,
  /\b(?:my symptoms?|my snoring|my sleep study|my results?)\b.{0,100}\b(?:mean|indicate|suggest|show|confirm)\b/i,
  /\b(?:tengo|podr[ií]a tener|es posible que tenga|puedes decirme si tengo|dime si tengo)\b.{0,100}\b(?:apnea|aos)\b/i,
  /\b(?:mis s[ií]ntomas?|mis ronquidos?|mi estudio(?: del sue[nñ]o)?|mis resultados?)\b.{0,100}\b(?:significa|indica|sugiere|confirma|tengo|apnea|aos)\b/i,
  /\b(?:esto|eso)\b.{0,40}\b(?:significa|es|confirma|indica)\b.{0,70}\b(?:tengo|apnea|aos)\b/i,
  /\b(?:is this|is it|es esto|es apnea)\b/i,
];

export function isDirectDiagnosisRequest(userText: string): boolean {
  const text = userText.normalize('NFC');
  return diagnosisTopic.test(text) && directDiagnosisPatterns.some(pattern => pattern.test(text));
}

export function isTeachBackUncertaintyMessage(userText: string): boolean {
  return /\b(?:i\s+(?:do not|don't)\s+(?:really\s+)?know|i(?:'m| am)\s+(?:confused|not sure)|no s[eé]|no entiendo)\b/i.test(userText.normalize('NFC'));
}

export function isSurgeryPathwayQuestion(userText: string): boolean {
  return /\b(?:surgery|surgical|operation|cirug[ií]a|operaci[oó]n)\b/i.test(userText.normalize('NFC'));
}

function blocked(violation: SafetyViolation, policyId: string, policyClass: SafetyPolicyClass) {
  return { allowed: false as const, violation, policyId, policyClass };
}

export function classifySafetyIntent(userText: string, knowledge: KnowledgeSelection | null, options: { interactionKind?: string } = {}): SafetyIntent {
  const text = userText.toLocaleLowerCase();
  const policies = new Set(knowledge?.safety_policy_ids ?? []);
  if (policies.has('POLICY-URGENT') || has(text, [/\b(chest pain|cannot breathe|can't breathe|severe shortness of breath|overdose|unconscious|suicid)/i, /\b(dolor de pecho|no puedo respirar|dificultad grave para respirar|sobredosis|inconsciente|suicid)/i])) return 'EMERGENCY';
  const medicationSubject = /(medication|medicine|drug|pill|medicamento|medicina|pastilla)/i.test(text) || namedSleepProduct.test(text);
  const medicationDecision = /(what|which|recommend|choose|select|start|stop|take|use|dose|dosage|suitable|appropriate|good choice|right (?:choice|option)|safe for|qu[eé]|cual|recomienda|elegir|tomar|usar|iniciar|dejar|dosis|adecuad|apropiad|buena opci[oó]n)/i.test(text);
  const namedSelectionSyntax = /\b(?:which|what)\s+[a-z][a-z-]{2,}\s+(?:should|can|could)\s+i\s+(?:take|use)\b|\bshould\s+i\s+(?:take|use)\s+[a-z][a-z-]{2,}|\bqu[eé]\s+[a-záéíóúüñ][a-záéíóúüñ-]{2,}\s+(?:debo|puedo)\s+(?:tomar|usar)\b/i.test(text);
  const personalizedNamedProduct = namedSleepProduct.test(text) && /\b(?:for me|my sleep|me\??|i\s|would|could|does|is|should|can|make sense|work)\b/i.test(text);
  if ((medicationSubject && medicationDecision) || namedSelectionSyntax || personalizedNamedProduct) return 'MEDICATION_SELECTION';
  if (/\b(?:what|which)\b.{0,60}\b(?:pap|cpap|pressure|setting)s?\b/i.test(text) && !/\b(?:should i|for me|my pressure|my setting|recommend|choose|set|change|increase|decrease|adjust)\b/i.test(text)) return 'GENERAL_EDUCATION';
  if (/\b(?:what does|what is|explain|how does|difference between|what are)\b.{0,80}\b(?:pap|cpap|apap|positive airway pressure|pressure|setting|side effects?)\b/i.test(text)
    && !/\b(?:should i|for me|my pressure|my setting|recommend|choose|set|change|increase|decrease|adjust)\b/i.test(text)) return 'GENERAL_EDUCATION';
  if (has(text, [/\b(what|which|recommend|choose|set|change|increase|decrease|adjust)\b.{0,50}\b(cpap|pap|pressure|setting)\b/i, /\b(cpap|pap|pressure|setting)\b.{0,50}\b(should i use|for me|my setting|my pressure)\b/i, /\b(qu[eé]|cual|recomienda|elegir|poner|cambiar|subir|bajar|ajustar)\b.{0,50}\b(cpap|pap|presi[oó]n|ajuste)\b/i])) return 'PAP_PRESSURE_SELECTION';
  // A lesson's policy metadata is context, not proof that the learner is
  // asking for a diagnosis. In teach-back mode, use the actual message for
  // deterministic routing so uncertainty such as “I don't really know” can
  // reach the tutor. Explicit diagnosis questions remain blocked.
  if (isDirectDiagnosisRequest(text) || (options.interactionKind !== 'teach-back' && policies.has('POLICY-DIAGNOSIS'))) return 'DIAGNOSIS_REQUEST';
  if (policies.has('POLICY-PERSONALIZED-MEDICAL-ADVICE')) return 'PERSONALIZED_MEDICAL_ADVICE';
  if (has(text, [/\b(pregnan|pregnancy|gestational|preeclampsia)\b/i, /\b(embaraz|embarazo|gestaci[oó]n|preeclampsia)\b/i])) return 'PREGNANCY_PAP_EDUCATION';
  return 'GENERAL_EDUCATION';
}

function normalizeSafetyText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLocaleLowerCase();
}

/**
 * Checks the required semantic concepts for pregnancy/PAP education locally.
 * The matcher intentionally combines concepts and nearby action words instead
 * of requiring one exact sentence or one exact singular/plural form.
 */
export function screenPregnancyReply(reply: string): PregnancyBoundaryResult {
  const text = normalizeSafetyText(reply);
  const pap = /\b(?:pap|positive airway pressure|presion positiva(?: en las vias respiratorias)?)\b/u.test(text);
  const osa = /\b(?:obstructive sleep apnea|sleep apnea|osa|apnea obstructiva(?: del sueno)?|apnea del sueno|aos)\b/u.test(text);
  const pregnancy = /\b(?:pregnan\w*|embaraz\w*|gestacion\w*)\b/u.test(text);
  const generalEducation = pap && osa && pregnancy && (
    /\b(?:se considera|se suele considerar)\b.{0,100}\b(?:tratamiento\s+)?(?:apropiad\w*|adecuad\w*)\b/u.test(text)
    || /\b(?:pap|positive airway pressure|presion positiva)\b.{0,140}\b(?:puede|se puede|can be|may be)\s+(?:utiliz\w*|us\w*|emple\w*|used|utilized|ser)\b(?:.{0,80}\b(?:tratamiento|treatment|apropiad\w*|adecuad\w*)\b)?/u.test(text)
    || /\b(?:pap|positive airway pressure|presion positiva)\b.{0,140}\b(?:generally considered|generally|por lo general|en general)\b/u.test(text)
  );
  const careTeam = /\b(?:healthcare team|care team|sleep team|sleep specialist\w*|sleep professional\w*|clinician\w*|obstetric\w*|obstetra\w*|obstetricia|equipo de salud|equipo medico|equipo de atencion medica|equipo de sueno|equipos de sueno|especialista\w* del sueno|profesional\w* del sueno|profesional\w* de la salud|equipo obstetrico|equipo de obstetricia|atencion obstetrica)\b/u.test(text);
  const oversightAction = /\b(?:prescrib\w*|supervis\w*|monitore\w*|determin\w*|manejar\w*|gestion\w*|seguimiento|control\w*|consult\w*|ajust\w*|revis\w*|prescribed|prescribed|monitored|managed|follow[- ]?up|determined|reviewed|overseen|should be|must be)\b/u.test(text);
  const clinicalOversight = careTeam && oversightAction;
  const evidenceLimitation = (
    /\b(?:evidence|data|information|knowledge|research|evidencia|datos|informacion|conocimiento|investigacion|pruebas)\b.{0,100}\b(?:limited|insufficient|inconclusive|limitad\w*|insuficient\w*|no concluyente\w*|escas\w*)\b/u.test(text)
    || /\b(?:limited|insufficient|inconclusive|limitad\w*|insuficient\w*|no concluyente\w*)\b.{0,100}\b(?:evidence|data|research|evidencia|datos|investigacion)\b/u.test(text)
  ) && !/\b(?:not|no|without|sin)\b.{0,30}\b(?:limited|limitad\w*|insufficient|insuficient\w*)\b/u.test(text);
  const missing: PregnancyPolicyConcept[] = [];
  if (!generalEducation) missing.push('PREGNANCY_PAP_GENERAL_EDUCATION');
  if (!clinicalOversight) missing.push('PREGNANCY_CLINICAL_OVERSIGHT');
  if (!evidenceLimitation) missing.push('PREGNANCY_EVIDENCE_LIMITATION');
  return { allowed: missing.length === 0, generalEducation, clinicalOversight, evidenceLimitation, missing };
}

export function screenGeneratedReply(reply: string): { allowed: true } | { allowed: false; violation: SafetyViolation; policyId: string; policyClass: SafetyPolicyClass } {
  const text = reply.toLocaleLowerCase();

  const pressureSubject = /\b(?:cpap|pap|pressure|pressures|presi[oó]n|setting|settings|ajuste|ajustes)\b/i;
  const pressureDirective = /\b(?:set|increase|decrease|raise|lower|change|adjust|modify|configure|try|switch|turn|set|subir|bajar|cambiar|ajustar|aumentar|reducir|probar)\b/i;
  const pressureNumber = /\b\d+(?:\.\d+)?\s*(?:cm\s*h?2o|cmh2o)\b|\b(?:pressure|presi[oó]n|setting|ajuste)\b.{0,25}\b\d+(?:\.\d+)?\b/i;
  const comparativePressure = has(text, [
    /\b(?:higher|lower|more|less|increased|decreased|raised|lowered)\b.{0,40}\b(?:pressure|pressures|setting|settings|presi[oó]n|ajuste)\b/i,
    /\b(?:pressure|pressures|setting|settings|presi[oó]n|ajuste)\b.{0,40}\b(?:higher|lower|more|less|increased|decreased|raised|lowered)\b/i,
    /\b(?:go(?:es)?|turn(?:ed)?|move(?:s)?)\s+(?:up|down)\b.{0,25}\b(?:pressure|setting|presi[oó]n|ajuste)\b/i,
    /\b(?:pressure|pressures|setting|settings|presi[oó]n|ajuste)\b.{0,35}\b(?:go(?:es)?|turn(?:ed)?|move(?:s)?)\s+(?:up|down)\b/i,
    /\b(?:presi[oó]n|ajuste)\b.{0,25}\b(?:mayor|menor|m[aá]s|menos|aumentad[ao]|reducid[ao]|sube|baja)\b/i,
  ]);
  const personalized = /\b(?:you|your|my|for you|for me|usted|su|sus|para usted|para ti|para m[ií])\b/i.test(text);
  const recommendation = /\b(?:better|best|effective|effective|appropriate|suitable|recommended|work|help|should|would|could|may|more effective|mejor|eficaz|apropiad[ao]|recomendad[ao])\b/i.test(text);
  const clinicianAction = /\b(?:clinician|doctor|healthcare|sleep team|care team|professional|equipo de salud|equipo de sue[nñ]o|equipo de atenci[oó]n|equipo obst[eé]trico|equipo de obstetricia|profesional)\b.{0,140}\b(?:determin\w*|monitor\w*|review\w*|manage\w*|supervis\w*|adjust\w*|change\w*|set\w*|ajust\w*|cambi\w*)\b/i.test(text);
  const learnerDirective = /\b(?:you|your|my|for you|for me|usted|su|sus)\b(?!\s+(?:clinician|doctor|healthcare|sleep|care|professional|equipo|profesional)\b).{0,35}\b(?:set|increase|decrease|raise|lower|change|adjust|modify|configure|try|switch|turn|subir|bajar|cambiar|ajustar|aumentar|reducir|probar)\b/i.test(text) || /\b(?:set|increase|decrease|raise|lower|change|adjust|modify|configure|try|switch|turn|subir|bajar|cambiar|ajustar|aumentar|reducir|probar)\b.{0,35}\b(?:your|my|su|sus)\b/i.test(text);
  if (pressureSubject.test(text) && (
    pressureNumber.test(text)
    || (pressureDirective.test(text) && (!clinicianAction || learnerDirective))
    || (comparativePressure && (personalized || recommendation))
    || (comparativePressure && pressureDirective.test(text))
  )) return blocked('PAP_PRESSURE_DIRECTIVE', 'POLICY-PAP-SETTINGS', 'PAP_SETTING_DIRECTIVE');

  const universalSafetyClaim = has(text, [
    /\b(?:pap|positive airway pressure|cpap)\b.{0,120}\b(?:completely|totally|always|universally|guaranteed)\s+(?:safe|effective|appropriate)\b/i,
    /\b(?:pap|positive airway pressure|cpap)\b.{0,120}\b(?:safe|effective|appropriate|segur[ao]|apropiad[ao])\b.{0,70}\b(?:for everyone|for all|every pregnant|todas las|todos los|todas las personas|todas las mujeres|cualquier embarazo)\b/i,
    /\b(?:pap|positive airway pressure|cpap)\b.{0,120}\b(?:completamente|totalmente|siempre|universalmente)\s+(?:segur[ao]|eficaz|apropiad[ao])\b/i,
  ]);
  const explicitNonGuarantee = /\b(?:cannot|can't|not possible to|no se puede|no podemos|no es posible)\b.{0,45}\b(?:guarantee|ensure|garantizar|asegurar)\b/i.test(text);
  if (universalSafetyClaim && !explicitNonGuarantee) return blocked('UNQUALIFIED_UNIVERSAL_SAFETY_CLAIM', 'POLICY-PREGNANCY', 'UNQUALIFIED_UNIVERSAL_SAFETY_CLAIM');

  const diagnosisSubject = /\b(?:sleep apnea|obstructive sleep apnea|osa|apnea obstructiva del sue[nñ]o|apnea del sue[nñ]o|aos)\b/i;
  const diagnosisEvidence = /\b(?:your symptoms?|these symptoms?|your study|your results?|this pattern|your pattern|the pattern you(?:'ve| have) described|what you(?:'ve| have) described|your conversation|your information|su estudio|sus s[ií]ntomas?|estos s[ií]ntomas?|esto|eso)\b/i;
  const diagnosisAssertion = has(text, [
    /\b(?:you|usted|t[uú])\b.{0,60}\b(?:definitely|certainly|likely|probably|have|has|tiene|probablemente|seguramente)\b.{0,50}\b(?:sleep apnea|obstructive sleep apnea|osa|apnea obstructiva del sue[nñ]o|apnea del sue[nñ]o|aos)\b/i,
    new RegExp(`${diagnosisEvidence.source}.{0,80}\\b(?:prove|show|shows|indicate|indicates|consistent with|suggestive of|characteristic of|confirm|confirms|means|points? to|sounds? like|seems? like|compatible with|demuestran|indican|muestran|confirma|significa|parece|suena|compatible con)\\b.{0,50}${diagnosisSubject.source}`, 'i'),
    /\b(?:this|that|it)\b.{0,25}\b(?:is|confirms?|means?|es|confirma|significa)\b.{0,45}\b(?:sleep apnea|obstructive sleep apnea|osa|apnea obstructiva del sue[nñ]o|apnea del sue[nñ]o|aos)\b/i,
    /\b(?:it|this)\s+(?:sounds?|seems?)\s+like\b.{0,55}\b(?:you\s+have\s+)?(?:sleep apnea|obstructive sleep apnea|osa|apnea obstructiva del sue[nñ]o|apnea del sue[nñ]o|aos)\b/i,
    /\b(?:this|that|it)\b.{0,25}\b(?:sounds?|seems?)\b.{0,30}\b(?:consistent with|suggestive of|characteristic of|compatible with)\b.{0,45}\b(?:sleep apnea|obstructive sleep apnea|osa|apnea obstructiva del sue[nñ]o|apnea del sue[nñ]o|aos)\b/i,
  ]);
  const diagnosticBoundary = /\b(?:can(?:not|'t)|cannot|no puedo)\b.{0,45}\b(?:diagnose|determine|confirm|prove|diagnosticar|determinar|confirmar|probar)\b|\b(?:do not|does not|cannot|can't|no)\b.{0,30}\b(?:diagnose|confirm|prove|diagnostica|confirma|demuestra)\b/i.test(text);
  const positiveAfterBoundary = /\b(?:but|however|although|pero|sin embargo)\b.{0,60}\b(?:you|usted|t[uú]|sus s[ií]ntomas?)\b.{0,50}\b(?:have|has|tiene|indicate|indican|show|muestran)\b.{0,50}\b(?:sleep apnea|obstructive sleep apnea|osa|apnea del sue[nñ]o|aos)\b/i.test(text);
  if (diagnosisSubject.test(text) && diagnosisAssertion && (!diagnosticBoundary || positiveAfterBoundary)) return blocked('DIAGNOSIS_ASSERTION', 'POLICY-DIAGNOSIS', 'DIAGNOSIS_ASSERTION');

  const medicationSubject = /\b(?:medication|medicine|drug|pill|dose|medicamento|medicina|pastilla|dosis|supplement|suplemento)\b/i.test(text) || namedSleepProduct.test(text);
  const medicationAction = /\b(?:take|use|start|stop|try|choose|select|recommend|dose|dosage|switch|tome|tomar|usar|inicie|iniciar|deje|dejar|pruebe|elegir|seleccionar|recomiendo|recomendar|dosis|ingiera|ingiere|consuma|al acostarse)\b/i.test(text);
  const medicationEndorsement = /\b(?:reasonable|good|preferred|right|best|appropriate|suitable|recommended|worth trying|beneficial|benefit|may help|could help|might help|work better|choice|option|opci[oó]n|recomendad[ao]|adecuad[ao]|conviene|mejor)\b/i.test(text);
  const medicationDose = /\b\d+(?:\.\d+)?\s*(?:mg|milligrams?|miligramos?|ml|milliliters?|mililitros?)\b|\b(?:dose|dosis)\b.{0,25}\b\d+/i.test(text);
  const medicationStartStop = /\b(?:start|stop|switch|begin|dejar|iniciar|suspender|cambiar|empiece|deje)\b/i.test(text);
  const medicationBoundary = /\b(?:can't|cannot|no puedo)\b.{0,35}\b(?:recommend|choose|select|dose|take|recomendar|elegir|seleccionar|dosis|tomar)\b|\b(?:outside|fuera)\b.{0,40}\b(?:scope|alcance)\b|\b(?:discuss|review|consulte|consultar)\b.{0,45}\b(?:professional|pharmacist|profesional|farmac[eé]utico)\b/i.test(text);
  const genericMedicationRecommendation = /\b(?:i|we)\s+recommend\s+(?:using|taking|starting|stopping|trying)\b|\b(?:reasonable|good|preferred|right|razonable)\s+(?:choice|option|opci[oó]n|opcion)\b.{0,40}\b(?:sleep|insomnia|insomnio)\b|\b(?:opci[oó]n|opcion)\s+(?:razonable|buena|preferida)\b.{0,40}\b(?:sleep|insomnia|insomnio)\b/i.test(text);
  if (medicationDose || ((medicationSubject || genericMedicationRecommendation) && (medicationAction || medicationEndorsement) && !(medicationBoundary && !namedSleepProduct.test(text)))) {
    return blocked('MEDICATION_DIRECTIVE', 'POLICY-MEDICATION', medicationDose ? 'MEDICATION_DOSING' : medicationStartStop ? 'MEDICATION_START_STOP' : 'MEDICATION_RECOMMENDATION');
  }

  if (has(text, [/\byou should (?:begin|start|stop|change) (?:your )?(?:cpap |pap )?(?:treatment|therapy)\b/i, /\bdebe (?:iniciar|suspender|cambiar) (?:su )?tratamiento\b/i])) return blocked('TREATMENT_DIRECTIVE', 'POLICY-GENERAL-SCOPE', 'OTHER_PROHIBITED_TREATMENT_DIRECTIVE');
  return { allowed: true };
}

export const deterministicSafetyMessages = {
  pressure: {
    en: "PAP uses pressurized air to help support an open upper airway during sleep. I can't recommend or change a person's pressure settings; the PAP or sleep-care team should determine and review them.",
    es: 'PAP usa aire presurizado para ayudar a mantener abierta la v\u00eda respiratoria durante el sue\u00f1o. No puedo recomendar ni cambiar los ajustes de presi\u00f3n de una persona; el equipo de PAP o de sue\u00f1o debe determinarlos y revisarlos.',
  },
  diagnosis: {
    en: "OSA is a sleep-related breathing condition in which the upper airway can narrow or close during sleep. Symptoms can have more than one cause, and a sleep study may help evaluate them. I can't determine whether you have OSA from your symptoms or this conversation; a healthcare professional must assess that.",
    es: 'La AOS es una afecci\u00f3n respiratoria del sue\u00f1o en la que la v\u00eda respiratoria superior puede estrecharse o cerrarse durante el sue\u00f1o. Los s\u00edntomas pueden tener m\u00e1s de una causa y un estudio del sue\u00f1o puede ayudar a evaluarlos. No puedo determinar si tiene AOS a partir de sus s\u00edntomas o de esta conversaci\u00f3n; un profesional de salud debe evaluarlo.',
  },
  teachBackUncertainty: {
    en: "It is okay not to know yet. During obstructive sleep apnea, throat muscles relax during sleep, the airway narrows or closes, and airflow drops or stops until the brain briefly wakes the person to reopen it. Which part would you like to practice?",
    es: 'Está bien no saberlo todavía. Durante la apnea obstructiva del sueño, los músculos de la garganta se relajan, la vía respiratoria se estrecha o se cierra y el flujo de aire disminuye o se detiene hasta que el cerebro despierta brevemente a la persona para reabrirla. ¿Qué parte quiere practicar?',
  },
  surgeryPathway: {
    en: 'Surgery can be one option for some people with obstructive sleep apnea, but eligibility depends on confirming the condition, sleep-apnea severity, airway anatomy, prior treatments, and a review by the sleep-care and surgical teams. A sleep professional can review the sleep study and discuss referral, expected benefits, risks, and alternatives without assuming surgery is right for you.',
    es: 'La cirugía puede ser una opción para algunas personas con apnea obstructiva del sueño, pero la elegibilidad depende de confirmar la afección, su gravedad, la anatomía de la vía respiratoria, los tratamientos previos y una evaluación de los equipos de sueño y cirugía. Un profesional del sueño puede revisar el estudio y hablar sobre una derivación, beneficios, riesgos y alternativas sin asumir que la cirugía sea adecuada para usted.',
  },
  medication: {
    en: "Medications can affect sleep and may interact with health conditions or other medicines. I can't choose, name, dose, start, stop, or change a medication for a person; discuss options with a healthcare professional or pharmacist.",
    es: 'Los medicamentos pueden afectar el sue\u00f1o y pueden interactuar con problemas de salud u otros medicamentos. No puedo elegir, nombrar, dosificar, iniciar, suspender ni cambiar un medicamento para una persona; hable de las opciones con un profesional de salud o farmac\u00e9utico.',
  },
  pregnancy: {
    en: 'PAP is generally considered an appropriate treatment for obstructive sleep apnea during pregnancy when prescribed and monitored by the healthcare team. Pregnancy-specific evidence remains limited, so the sleep and obstetric teams should determine settings and follow-up for the individual pregnancy.',
    es: 'En general, PAP se considera un tratamiento apropiado para la apnea obstructiva del sue\u00f1o durante el embarazo cuando lo prescribe y supervisa el equipo de salud. La evidencia espec\u00edfica del embarazo sigue siendo limitada, por lo que los equipos de sue\u00f1o y obstetricia deben determinar los ajustes y el seguimiento individuales.',
  },
  personalized: {
    en: "I can explain the general science and usual care considerations, but I can't decide what treatment is right for you. Please discuss your symptoms and options with the appropriate healthcare professional.",
    es: 'Puedo explicar la ciencia general y las consideraciones habituales de atención, pero no puedo decidir qué tratamiento es adecuado para usted. Hable de sus síntomas y opciones con el profesional de salud apropiado.',
  },
  generatedFallback: {
    en: 'I can explain general sleep and health science, but I cannot make an individualized diagnosis, pressure choice, medication choice, or treatment decision. A healthcare professional can help apply general information to your situation.',
    es: 'Puedo explicar la ciencia general del sue\u00f1o y la salud, pero no puedo hacer un diagn\u00f3stico individual ni elegir presi\u00f3n, medicamento o tratamiento. Un profesional de salud puede ayudarle a aplicar la informaci\u00f3n general a su situaci\u00f3n.',
  },
} as const;
