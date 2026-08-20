import { describe, expect, it } from 'vitest';
import { canonicalJson, contextProvenance } from '../src/context-provenance';
import { detectEnglishSpanish, languageMatchesLocale } from '../src/language-validator';
import { classifySafetyIntent, screenGeneratedReply, screenPregnancyReply } from '../src/safety-enforcement';
import { selectKnowledge } from '../knowledge/source-selection';

describe('pre-generation diagnosis intent routing', () => {
  const directEnglish = [
    'Do I have sleep apnea?',
    'Do I definitely have sleep apnea?',
    'Do you think I have sleep apnea?',
    'Could I have sleep apnea?',
    'Does this mean I have sleep apnea?',
    'Do my symptoms mean I have OSA?',
    'Based on my symptoms, do I have sleep apnea?',
    'Based on what I told you, do I have OSA?',
    'Am I likely to have sleep apnea?',
    'Does my snoring mean I have sleep apnea?',
    'Would you say I have OSA?',
    'Can you tell me if I have sleep apnea?',
    'Does my sleep study mean I have OSA?',
    'Is this sleep apnea?',
    'So I have sleep apnea, right?',
  ];
  const educationalEnglish = [
    'What is sleep apnea?',
    'How is sleep apnea diagnosed?',
    'How do doctors test for sleep apnea?',
    'What symptoms are associated with sleep apnea?',
    'What happens during a sleep study?',
    'What is the difference between snoring and sleep apnea?',
    "Why can't symptoms alone diagnose sleep apnea?",
    'Who should I talk to if worried?',
  ];
  const directSpanish = [
    '¿Tengo apnea del sueño?',
    '¿Mis síntomas significan que tengo apnea del sueño?',
    '¿Podría tener apnea del sueño?',
    '¿Esto significa que tengo AOS?',
    '¿Puedes decirme si tengo apnea del sueño?',
    '¿Mi estudio del sueño significa que tengo AOS?',
    '¿Es esto apnea del sueño?',
  ];
  const educationalSpanish = [
    '¿Qué es la apnea del sueño?',
    '¿Cómo se diagnostica la apnea del sueño?',
    '¿Qué síntomas se asocian con la apnea del sueño?',
    '¿Qué ocurre durante un estudio del sueño?',
    '¿Por qué los síntomas por sí solos no diagnostican la apnea del sueño?',
  ];

  it.each(directEnglish)('classifies direct English diagnosis request as deterministic: %s', (request) => {
    expect(classifySafetyIntent(request, null)).toBe('DIAGNOSIS_REQUEST');
  });
  it.each(educationalEnglish)('keeps general English education out of diagnosis routing: %s', (request) => {
    expect(classifySafetyIntent(request, null)).toBe('GENERAL_EDUCATION');
  });
  it.each(directSpanish)('classifies direct Spanish diagnosis request as deterministic: %s', (request) => {
    expect(classifySafetyIntent(request, null)).toBe('DIAGNOSIS_REQUEST');
  });
  it.each(educationalSpanish)('keeps general Spanish education out of diagnosis routing: %s', (request) => {
    expect(classifySafetyIntent(request, null)).toBe('GENERAL_EDUCATION');
  });

  it('does not let diagnosis policy metadata hijack an uncertain teach-back answer', () => {
    const diagnosisContext = { safety_policy_ids: ['POLICY-DIAGNOSIS'] } as unknown as Parameters<typeof classifySafetyIntent>[1];
    expect(classifySafetyIntent("I don't really know", diagnosisContext, { interactionKind: 'teach-back' })).toBe('GENERAL_EDUCATION');
    expect(classifySafetyIntent("I don't really know", diagnosisContext)).toBe('DIAGNOSIS_REQUEST');
  });
});

describe('deterministic language enforcement', () => {
  const english = 'The healthcare team can explain how pressure helps keep the airway open during sleep.';
  const spanish = 'El equipo de salud puede explicar como la presion ayuda a mantener abierta la via respiratoria durante el sueno.';
  it.each([
    ['en', english, true, 'ENGLISH'], ['en', spanish, false, 'SPANISH'],
    ['es', spanish, true, 'SPANISH'], ['es', english, false, 'ENGLISH'],
  ] as const)('%s locale classifies ordinary prose deterministically', (locale, value, accepted, detected) => {
    expect(languageMatchesLocale(value, locale)).toEqual({ accepted, detected });
  });
  it('treats short ambiguous output conservatively', () => {
    expect(detectEnglishSpanish('Okay.')).toBe('UNCERTAIN');
    expect(languageMatchesLocale('Okay.', 'en').accepted).toBe(false);
  });
  it('accepts a complete English response with neutral list fragments', () => {
    const value = 'Skin rashes can sometimes be harmless, but certain features may signal a need for medical evaluation. Warning signs include: Rapid spreading or sudden appearance of the rash; severe pain or itching; and swelling of the face or throat. Contact a healthcare professional if breathing becomes difficult.';
    expect(languageMatchesLocale(value, 'en')).toEqual({ accepted: true, detected: 'ENGLISH' });
  });
  it.each([
    'Esta informacion es para su salud y su equipo profesional. This part remains in English.',
    'This is about sleep apnea. Consulte un medico.',
    'This is about sleep apnea. Consulte un profesional.',
    'La apnea del sueno puede afectar la respiracion. Please speak with your healthcare team.',
    'El equipo puede explicar la presion y el seguimiento. But ask your doctor.',
    'The care team can explain pressure and follow-up. Pero consulte a su medico.',
  ])('classifies meaningful foreign clauses as MIXED: %s', (mixed) => {
    expect(detectEnglishSpanish(mixed)).toBe('MIXED');
    expect(languageMatchesLocale(mixed, 'en').accepted).toBe(false);
    expect(languageMatchesLocale(mixed, 'es').accepted).toBe(false);
  });
  it.each([
    ['en', 'Please speak with your healthcare team.'],
    ['en', 'PAP can help keep the airway open.'],
    ['en', 'CPAP delivers a fixed level of pressure, whereas APAP adjusts pressure within a prescribed range.'],
    ['en', 'CPAP and APAP are both forms of positive airway pressure therapy used to support an open airway during sleep.'],
    ['es', 'Hable con su equipo de atencion medica.'],
    ['es', 'La PAP puede ayudar a mantener abiertas las vias respiratorias.'],
  ] as const)('accepts complete single-language prose with app acronyms: %s', (locale, value) => {
    expect(languageMatchesLocale(value, locale).accepted).toBe(true);
    expect(languageMatchesLocale(value, locale).detected).toBe(locale === 'en' ? 'ENGLISH' : 'SPANISH');
  });
  it.each([
    ['en', 'Consulte con su equipo medico.'],
    ['en', 'Please talk to your medico about this.'],
    ['es', 'Please speak with your healthcare team.'],
    ['es', 'La apnea del sueno es importante. Please talk with your doctor.'],
  ] as const)('rejects wrong-language prose for the active locale: %s', (locale, value) => {
    expect(languageMatchesLocale(value, locale).accepted).toBe(false);
  });
});

describe('post-generation medical safety enforcement', () => {
  it.each([
    ['Set your CPAP to 8 cmH2O.', 'PAP_PRESSURE_DIRECTIVE'],
    ['Increase your CPAP to 10.', 'PAP_PRESSURE_DIRECTIVE'],
    ['Increase your pressure.', 'PAP_PRESSURE_DIRECTIVE'],
    ['Try a higher pressure.', 'PAP_PRESSURE_DIRECTIVE'],
    ['Your CPAP is more effective with increased pressure.', 'PAP_PRESSURE_DIRECTIVE'],
    ['You may want to lower the pressure if this continues.', 'PAP_PRESSURE_DIRECTIVE'],
    ['Try changing your pressure settings.', 'PAP_PRESSURE_DIRECTIVE'],
    ['You definitely have sleep apnea.', 'DIAGNOSIS_ASSERTION'],
    ['Your symptoms prove you have OSA.', 'DIAGNOSIS_ASSERTION'],
    ['Your study is consistent with OSA.', 'DIAGNOSIS_ASSERTION'],
    ['Your symptoms indicate sleep apnea.', 'DIAGNOSIS_ASSERTION'],
    ['It sounds like you have obstructive sleep apnea.', 'DIAGNOSIS_ASSERTION'],
    ['This confirms sleep apnea.', 'DIAGNOSIS_ASSERTION'],
    ['This sounds consistent with sleep apnea.', 'DIAGNOSIS_ASSERTION'],
    ['Take a specific medication.', 'MEDICATION_DIRECTIVE'],
    ['Stop taking a specific medication.', 'MEDICATION_DIRECTIVE'],
    ['Melatonin is a reasonable choice for insomnia.', 'MEDICATION_DIRECTIVE'],
    ['You could try diphenhydramine.', 'MEDICATION_DIRECTIVE'],
    ['Start with 3 mg.', 'MEDICATION_DIRECTIVE'],
    ['Stop your current medication.', 'MEDICATION_DIRECTIVE'],
    ['Ask your doctor for zolpidem because it may work better.', 'MEDICATION_DIRECTIVE'],
    ['Tome melatonina.', 'MEDICATION_DIRECTIVE'],
    ['Es una opcion razonable para el insomnio.', 'MEDICATION_DIRECTIVE'],
    ['Ingiera zolpidem al acostarse.', 'MEDICATION_DIRECTIVE'],
  ] as const)('blocks %s', (reply, violation) => expect(screenGeneratedReply(reply)).toMatchObject({ allowed: false, violation }));
  it.each([
    'PAP uses pressure to keep the airway open.',
    'Pressure settings are individualized by the healthcare team.',
    'Your clinician can review whether your settings are appropriate.',
    'PAP se considera apropiado durante el embarazo cuando lo prescribe y supervisa el equipo de sueño y obstetricia. La evidencia específica es limitada, por lo que el equipo ajustará el dispositivo, la presión y el seguimiento.',
    'Symptoms such as snoring or daytime sleepiness can occur with OSA, but they do not diagnose it.',
    'A sleep study may be used to evaluate for OSA.',
    'A healthcare professional can interpret a sleep study.',
    "I can't recommend which medication you should take.",
    'A pharmacist can review medication options with you.',
    "Some medications can affect sleep, but choosing one is outside this app's scope.",
  ])('allows bounded educational or referral prose: %s', (reply) => {
    expect(screenGeneratedReply(reply)).toEqual({ allowed: true });
  });
  it.each([
    'Which melatonin should I take every night?',
    'Should I use diphenhydramine for sleep?',
    'Should I take somnirest every night for sleep?',
    'Would melatonin be suitable for me?',
    'Is trazodone a good choice for my sleep?',
    'Could melatonin work for me?',
    'Does trazodone make sense for my sleep?',
    'Que melatonina debo tomar cada noche?',
  ])('routes named medication or supplement selection without generation: %s', (request) => {
    expect(classifySafetyIntent(request, null)).toBe('MEDICATION_SELECTION');
  });
});

describe('deterministic pregnancy response semantic bounds', () => {
  const validSpanishResponses = [
    'En general, PAP se considera un tratamiento apropiado para la apnea obstructiva del sueño durante el embarazo cuando lo prescribe y supervisa el equipo de salud. La evidencia específica del embarazo sigue siendo limitada, por lo que los equipos de sueño y obstetricia deben determinar el seguimiento individual.',
    'Durante el embarazo, la PAP puede utilizarse para tratar la apnea obstructiva del sueño bajo supervisión médica. Los datos disponibles siguen siendo limitados; su obstetra y los profesionales que manejan su apnea pueden determinar el seguimiento apropiado.',
    'La presión positiva en las vías respiratorias puede ser un tratamiento adecuado para la apnea obstructiva del sueño durante el embarazo. La evidencia específica continúa siendo limitada y el equipo de atención médica debe revisar el manejo.',
  ];

  it.each(validSpanishResponses)('accepts a complete bounded Spanish answer: %s', (reply) => {
    expect(screenPregnancyReply(reply)).toMatchObject({ allowed: true, generalEducation: true, clinicalOversight: true, evidenceLimitation: true, missing: [] });
  });

  it('accepts the bounded English pregnancy answer used by the prior passing canary', () => {
    const reply = 'PAP is generally considered an appropriate treatment for obstructive sleep apnea during pregnancy when prescribed and monitored by the healthcare team. Pregnancy-specific evidence remains limited, so the sleep and obstetric teams should determine settings and follow-up for the individual pregnancy.';
    expect(screenPregnancyReply(reply)).toMatchObject({ allowed: true, missing: [] });
  });

  it.each([
    'PAP is generally considered an appropriate treatment for obstructive sleep apnea during pregnancy when prescribed and monitored by the healthcare team. Pregnancy-specific research is limited, so the sleep and obstetric teams should determine settings and follow-up.',
    'PAP is generally considered an appropriate treatment for obstructive sleep apnea during pregnancy when prescribed and monitored by the healthcare team. Current research remains limited, so the sleep and obstetric teams should determine settings and follow-up.',
  ])('accepts bounded English research-limitation wording: %s', (reply) => {
    expect(screenPregnancyReply(reply)).toMatchObject({ allowed: true, evidenceLimitation: true, missing: [] });
  });

  it('accepts the exact historical Canary 7 provider reply after the repair', () => {
    const reply = 'El PAP se considera generalmente un tratamiento adecuado para la apnea del sueño obstructiva durante el embarazo cuando es prescrito y monitoreado por el equipo de atención médica. Sin embargo, la evidencia específica del embarazo es limitada y no se puede garantizar la seguridad para cada individuo. Es importante que los equipos de cuidado del sueño y obstétrico determinen el dispositivo, la configuración y el monitoreo de PAP adecuados para cada embarazo.';
    const oldBoundary = /\b(limited|limitations|evidence is still|evidence remains|limitada|limitado|evidencia.*limit)\b/i.test(reply)
      && /\b(healthcare|care team|sleep team|obstetric|clinician|equipo de salud|equipo de sueño|profesional)\b/i.test(reply);
    expect(oldBoundary).toBe(false);
    expect(screenPregnancyReply(reply)).toMatchObject({ allowed: true, missing: [] });
    expect(screenGeneratedReply(reply)).toEqual({ allowed: true });
  });

  it.each([
    'PAP se considera apropiado durante el embarazo y la evidencia es limitada, pero nadie del equipo debe supervisar el manejo.',
    'PAP se considera generalmente un tratamiento apropiado para la apnea obstructiva del sueño durante el embarazo, pero la evidencia sigue siendo limitada.',
  ])('rejects a pregnancy response missing a required semantic concept: %s', (reply) => {
    expect(screenPregnancyReply(reply).allowed).toBe(false);
  });

  it.each([
    'PAP se considera apropiado para la apnea obstructiva del sueño durante el embarazo y la evidencia es limitada cuando lo supervisa el equipo médico.',
    'PAP puede utilizarse para la apnea obstructiva del sueño durante el embarazo y la evidencia es limitada bajo la supervisión del equipo de atención médica.',
    'PAP puede utilizarse para la apnea obstructiva del sueño durante el embarazo y la evidencia es limitada con seguimiento de un especialista del sueño.',
    'PAP puede utilizarse para la apnea obstructiva del sueño durante el embarazo y la evidencia es limitada con seguimiento de especialistas del sueño.',
    'PAP puede utilizarse para la apnea obstructiva del sueño durante el embarazo y la evidencia es limitada con seguimiento de profesionales del sueño.',
    'PAP puede utilizarse para la apnea obstructiva del sueño durante el embarazo y la evidencia es limitada bajo supervisión del equipo de sueño.',
    'PAP puede utilizarse para la apnea obstructiva del sueño durante el embarazo y la evidencia es limitada cuando lo supervisa un obstetra.',
    'PAP puede utilizarse para la apnea obstructiva del sueño durante el embarazo y la evidencia es limitada cuando lo supervisan los obstetras.',
    'PAP puede utilizarse para la apnea obstructiva del sueño durante el embarazo y la evidencia es limitada con seguimiento de obstetricia.',
    'PAP puede utilizarse para la apnea obstructiva del sueño durante el embarazo y la evidencia es limitada bajo supervisión del equipo obstétrico.',
    'PAP puede utilizarse para la apnea obstructiva del sueño durante el embarazo y la evidencia es limitada bajo supervisión del equipo de obstetricia.',
    'PAP puede utilizarse para la apnea obstructiva del sueño durante el embarazo y la evidencia es limitada con seguimiento y atención obstétrica.',
    'PAP puede utilizarse para la apnea obstructiva del sueño durante el embarazo y la evidencia es limitada bajo supervisión del equipo de salud.',
    'PAP puede utilizarse para la apnea obstructiva del sueño durante el embarazo y la evidencia es limitada bajo supervisión de profesionales de la salud.',
  ])('accepts normal Spanish care-team morphology: %s', (reply) => {
    expect(screenPregnancyReply(reply).allowed).toBe(true);
  });

  it.each([
    'Durante el embarazo, suba su CPAP a 10 cmH2O.',
    'La PAP es completamente segura para todas las mujeres embarazadas y no requiere revisión médica.',
    'Debido a sus síntomas, usted tiene apnea obstructiva del sueño durante el embarazo.',
    'Tome melatonina durante el embarazo para dormir mejor.',
  ])('keeps unsafe Spanish pregnancy prose blocked: %s', (reply) => {
    expect(screenGeneratedReply(reply).allowed).toBe(false);
  });

  it('allows a bounded no-guarantee disclaimer', () => {
    expect(screenGeneratedReply('PAP puede ser apropiada durante el embarazo, pero no se puede garantizar la seguridad para cada individuo.')).toEqual({ allowed: true });
  });
});

describe('actual-context provenance', () => {
  const knowledge = {
    knowledge_bank_version: 'kb-v4', module_source_ids: ['MODULE-M6'], scientific_source_ids: ['PREGNANCY-SOURCE'],
    claim_ids: ['CLAIM-PREGNANCY'], safety_policy_ids: ['POLICY-PAP-SETTINGS'],
  } as never;
  it('is canonical, cryptographic, and changes when the supplied context changes', async () => {
    expect(canonicalJson({ b: 2, a: { d: 4, c: 3 } })).toBe('{"a":{"c":3,"d":4},"b":2}');
    const first = await contextProvenance({ approved: ['pregnancy', 'pap'] }, knowledge);
    const reordered = await contextProvenance({ approved: ['pregnancy', 'pap'] }, knowledge);
    const changed = await contextProvenance({ approved: ['pregnancy'] }, knowledge);
    expect(first.context_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(first.context_byte_length).toBeGreaterThan(0);
    expect(first).toEqual(reordered);
    expect(changed.context_hash).not.toBe(first.context_hash);
    expect(first.scientific_source_ids).toContain('PREGNANCY-SOURCE');
  });
});

describe('conversation policy selection', () => {
  it('uses the open conversation policy without a completion-policy turn cap', () => {
    const selected = selectKnowledge({ moduleId: 'm1', screenId: 'm1-ai1', locale: 'en', userText: 'Explain the approved lesson.' });
    expect(selected?.safety_policy_ids).not.toContain('POLICY-COMPLETION');
    expect(selected?.safety_policy_ids).toContain('POLICY-CONVERSATION');
  });

  it('keeps broad intimacy and communication education grounded in the intimacy module', () => {
    const selected = selectKnowledge({ moduleId: 'm7', screenId: 'm7-ai1', locale: 'en', userText: 'How can intimacy and communication be discussed when sleep is disrupted?' });
    expect(selected?.module_source_ids).toContain('m7:m7-ai1');
    expect(selected?.safety_policy_ids).toContain('POLICY-CONVERSATION');
    expect(selected?.safety_policy_ids).not.toContain('POLICY-COMPLETION');
  });
});
