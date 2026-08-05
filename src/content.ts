export type Locale = 'en' | 'es';

export type Choice = { id: string; label: string };

export type LessonScreen = {
  id: string;
  type: 'content' | 'singleChoice';
  title: string;
  paragraphs: string[];
  prompt?: string;
  choices?: Choice[];
  correctChoiceId?: string;
  feedback?: string;
};

export type EducationModule = {
  id: string;
  locale: Locale;
  title: string;
  synthetic: true;
  screens: LessonScreen[];
};

const publicNotice = 'Demonstration content created for the Sleep Education App Portfolio. Not clinical guidance.';
const spanishPublicNotice = 'Contenido de demostración creado para Sleep Education App Portfolio. No es orientación clínica.';

export const englishModules: EducationModule[] = [
  {
    id: 'portfolio-demo-01', locale: 'en', title: 'A Small Sleep-Planning Experiment', synthetic: true,
    screens: [
      { id: 'portfolio-demo-01-s01', type: 'content', title: 'Choose one small step', paragraphs: [publicNotice, 'A simple plan is easier to remember when it names one action, one time, and one way to notice what happened. This demonstration invites reflection rather than prescribing care.'] },
      { id: 'portfolio-demo-01-s02', type: 'singleChoice', title: 'Check your understanding', paragraphs: [publicNotice], prompt: 'Which option is easiest to observe over a few evenings?', choices: [{ id: 'a', label: 'Choose one small action and note whether it was practical.' }, { id: 'b', label: 'Change every part of the evening at once without a plan.' }], correctChoiceId: 'a', feedback: 'The demonstration favors one observable step so a learner can reflect on it.' },
      { id: 'portfolio-demo-01-s03', type: 'content', title: 'Explain it in your own words', paragraphs: [publicNotice, 'A teach-back response can help a learner notice what they understood and what they want to ask a qualified professional.'] }
    ]
  }
];

export const spanishModules: EducationModule[] = [
  {
    id: 'portfolio-demo-01', locale: 'es', title: 'Un pequeño experimento para planificar el sueño', synthetic: true,
    screens: [
      { id: 'portfolio-demo-01-s01', type: 'content', title: 'Elige un paso pequeño', paragraphs: [spanishPublicNotice, 'Un plan sencillo es más fácil de recordar cuando nombra una acción, un momento y una forma de observar lo ocurrido. Esta demostración invita a reflexionar, no prescribe atención médica.'] },
      { id: 'portfolio-demo-01-s02', type: 'singleChoice', title: 'Comprueba lo que entendiste', paragraphs: [spanishPublicNotice], prompt: '¿Qué opción es más fácil de observar durante algunas noches?', choices: [{ id: 'a', label: 'Elige una acción pequeña y observa si fue práctica.' }, { id: 'b', label: 'Cambia cada parte de la noche a la vez sin un plan.' }], correctChoiceId: 'a', feedback: 'La demostración favorece un paso observable para que la persona pueda reflexionar.' },
      { id: 'portfolio-demo-01-s03', type: 'content', title: 'Explícalo con tus propias palabras', paragraphs: [spanishPublicNotice, 'Una respuesta de comprobación puede ayudar a notar lo que se entendió y lo que se quiere preguntar a un profesional cualificado.'] }
    ]
  }
];

export { publicNotice, spanishPublicNotice };
