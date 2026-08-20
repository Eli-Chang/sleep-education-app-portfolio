export const unsupportedFallback = {
  en:'I can explain general sleep and health science, including concepts beyond this lesson. I cannot make an individualized diagnosis or treatment decision, but a healthcare professional can help apply general information to your situation.',
  es:'Puedo explicar ciencia general sobre el sueño y la salud, incluso conceptos que van más allá de esta lección. No puedo hacer un diagnóstico individual ni decidir un tratamiento, pero un profesional puede ayudar a aplicar la información general a su situación.',
} as const;
export const noMoreDetailFallback = {
  en:'I can continue explaining general sleep and health science, including related topics beyond this lesson. I cannot make an individualized diagnosis or treatment decision.',
  es:'Puedo seguir explicando ciencia general sobre el sueño y la salud, incluso temas relacionados que van más allá de esta lección. No puedo hacer un diagnóstico individual ni decidir un tratamiento.',
} as const;

export const approvedPapCategories = [
  'nasal congestion', 'dryness', 'mask discomfort', 'mask leak', 'tubing or equipment',
  'airflow discomfort', 'anxiety or claustrophobia', 'reflux', 'partner or bedroom concern',
  'uncertain benefit', 'other or unclear',
] as const;

export const approvedContent = {
  'm1-01':{en:'OSA repeatedly narrows or closes the upper airway during sleep. Airflow is reduced or stops, the body responds so breathing restarts, and events can repeat and disturb sleep. PAP uses pressurized air through a mask to support an open airway; it is not automatically oxygen.',es:'La AOS estrecha o cierra repetidamente la vía respiratoria durante el sueño. El flujo disminuye o se detiene, el cuerpo reinicia la respiración y los eventos pueden alterar el sueño. PAP usa aire presurizado para mantener abierta la vía; no es automáticamente oxígeno.'},
  'm2-01':{en:'OSA may disturb a partner through snoring, pauses, gasping, worry, and lost sleep. Effective PAP may reduce obstructive breathing and shared-sleep disruption, but it cannot guarantee relationship improvement. Support should be blame-free.',es:'La AOS puede afectar a la pareja con ronquidos, pausas, jadeos, preocupación y sueño perdido. PAP eficaz puede reducir la obstrucción, pero no garantiza mejorar la relación. El apoyo debe evitar la culpa.'},
  'm3-01':{en:'OSA treatment reduces obstructive breathing, but PAP barriers are common. Useful categories include congestion, dryness, discomfort, leak, tubing, airflow, anxiety, reflux, partner concerns, uncertain benefit, and unclear concerns. Do not change pressure or medication without the appropriate team.',es:'El tratamiento reduce la respiración obstructiva, pero las barreras de PAP son comunes. Incluyen congestión, sequedad, molestias, fuga, tubos, flujo, ansiedad, reflujo y preocupaciones de pareja. No cambie presión ni medicamentos sin el equipo apropiado.'},
  'm4-01':{en:'Pregnancy can affect sleep and breathing. OSA is associated with gestational diabetes and hypertensive disorders, but association is not individual prediction, sole cause, or guarantee. PAP directly treats obstructive breathing, not prenatal conditions.',es:'El embarazo puede afectar sueño y respiración. La AOS se asocia con diabetes gestacional y trastornos hipertensivos, pero una asociación no predice un resultado individual ni demuestra causa única. PAP trata la obstrucción, no las condiciones prenatales.'},
  'm5-01':{en:'Sleep hygiene supports habits and environment: wake timing, wind-down, light, bedroom comfort, caffeine awareness, meal comfort, activity, and intentional naps. It does not cure OSA and may not be enough for persistent insomnia or medical symptoms.',es:'La higiene del sueño apoya hábitos y ambiente: horario, rutina, luz, comodidad, cafeína, comidas, actividad y siestas. No cura AOS y quizá no baste para insomnio persistente o síntomas médicos.'},
  'm6-01':{en:'Pregnancy symptoms and other concerns can make PAP difficult. Describe timing, sensations, congestion, dryness, leak, reflux, anxiety, and equipment. Equipment questions may go to the PAP team; medication and pregnancy-safety questions go to the appropriate healthcare professional.',es:'Los síntomas del embarazo pueden dificultar PAP. Describa tiempo, sensaciones, congestión, sequedad, fuga, reflujo, ansiedad y equipo. El equipo de PAP trata equipo; medicamentos y seguridad pertenecen al profesional apropiado.'},
  'm7-01':{en:'Intimacy includes emotional closeness, trust, affection, communication, touch, and sexual connection. OSA and PAP may affect energy, shared sleep, comfort, emotions, or sexual health, but experiences differ. Personal disclosure is optional.',es:'La intimidad incluye cercanía emocional, confianza, afecto, comunicación, contacto y conexión sexual. AOS y PAP pueden afectar energía, sueño, comodidad, emociones o salud sexual, pero las experiencias varían. Divulgar información es opcional.'},
  'pap-barriers':{en:'Approved categories: nasal congestion, dryness, mask discomfort, mask leak, tubing or equipment, airflow discomfort, anxiety or claustrophobia, reflux, partner or bedroom concern, uncertain benefit, and other or unclear. Ask at most one clarification question. Never diagnose, select medication, recommend pressure, determine pregnancy safety, or guarantee outcomes.',es:'Categorías aprobadas: congestión nasal, sequedad, molestia o fuga de mascarilla, tubos o equipo, flujo, ansiedad o claustrofobia, reflujo, pareja o dormitorio, beneficio incierto y otro o poco claro. Nunca diagnostique, elija medicamentos, recomiende presión, determine seguridad del embarazo ni garantice resultados.'},
  'action-plan':{en:'Plans may use only non-medical actions: specify a realistic habit, timing, expected barrier, backup plan, observation to record, or question for a care team. Never promise sleep improvement, recommend medication, or change PAP settings.',es:'Los planes solo usan acciones no médicas: hábito realista, momento, barrera, plan alternativo, observación o pregunta para el equipo. Nunca prometen mejorar el sueño, recomiendan medicamentos ni cambian PAP.'},
} as const;

const prohibited=['diagnosis','medication selection','PAP pressure change','individual pregnancy risk','guaranteed outcome','clinical approval'];
export const teachBackRubrics = {
  'm1-osa-teach-back':{contextId:'m1-01',requiredConcepts:['upper airway narrows or closes during sleep','airflow is reduced or stops','body or brain responds so breathing resumes','events may repeat and disturb sleep'],optionalConcepts:['oxygen may decrease','person may not remember waking','snoring or gasping may occur'],alternateWording:['blocked airway','breathing pauses'],misconceptions:['lungs permanently stop','person chooses not to breathe','OSA is insomnia','OSA is caused by dreaming','PAP is oxygen'],prohibitedClaims:prohibited},
  'm2-partner-teach-back':{contextId:'m2-01',requiredConcepts:['one plausible partner effect','one possible PAP benefit'],optionalConcepts:['disrupted sleep','worry','fatigue','reduced snoring'],alternateWording:['shared sleep'],misconceptions:['PAP guarantees relationship improvement','partner should punish PAP use','partner should change settings','OSA is partner fault'],prohibitedClaims:prohibited},
  'm4-association-teach-back':{contextId:'m4-01',requiredConcepts:['association is a group pattern','not every individual has the outcome','does not prove sole cause','treatment does not guarantee prevention'],optionalConcepts:['individual care varies'],alternateWording:['risk is not destiny'],misconceptions:['OSA guarantees preeclampsia','OSA guarantees gestational diabetes','PAP guarantees complication-free pregnancy','app calculates personal risk'],prohibitedClaims:prohibited},
  'm5-sleep-hygiene-teach-back':{contextId:'m5-01',requiredConcepts:['sleep hygiene supports habits and environment','OSA needs appropriate treatment','persistent insomnia may need more than tips','medical symptoms may need evaluation'],optionalConcepts:['realistic routines'],alternateWording:['healthy sleep habits'],misconceptions:['sleep hygiene cures OSA','tips treat every insomnia case'],prohibitedClaims:prohibited},
} as const;

export const activityCatalog = {
  'm3-pap-barrier':{contextId:'pap-barriers',task:'pap-barrier'},
  'm6-pap-barrier':{contextId:'pap-barriers',task:'pap-barrier'},
  'm3-pap-action-plan':{contextId:'action-plan',task:'action-plan'},
  'm5-sleep-action-plan':{contextId:'action-plan',task:'action-plan'},
  'm5-bedtime-timeline':{contextId:'action-plan',task:'action-plan'},
  'm4-pregnancy-question':{contextId:'m4-01',task:'lesson-question'},
  'm6-discussion-summary':{contextId:'m6-01',task:'lesson-question'},
  'm7-intimacy-question':{contextId:'m7-01',task:'lesson-question'},
} as const;

export const urgentFixedMessage={
  en:'Call 911 or your local emergency number now. Chest pain with severe shortness of breath can be a medical emergency. This app cannot assess the cause or replace emergency care.',
  es:'Llame al 911 o al número local de emergencias ahora. El dolor de pecho junto con dificultad grave para respirar puede ser una emergencia médica. Esta aplicación no puede evaluar la causa ni reemplazar la atención de emergencia.',
} as const;
