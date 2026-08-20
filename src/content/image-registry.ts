export interface CurriculumImageAsset {
  id: string;
  moduleId: string;
  lessonIds: string[];
  source: number;
  aspectRatio: number;
  altText: { en: string; es: string };
  decorative: boolean;
  attribution: string;
}

export const curriculumImages: CurriculumImageAsset[] = [
  { id: 'cpap-open-airway', moduleId: 'm1', lessonIds: ['m1-01'], source: require('../../assets/curriculum/module-1/cpap-open-airway.svg'), aspectRatio: 6 / 7, altText: { en: 'Side-view diagram showing positive airway pressure helping hold the throat airway open.', es: 'Diagrama lateral que muestra cómo la presión positiva ayuda a mantener abierta la vía respiratoria de la garganta.' }, decorative: false, attribution: 'Michael Brenner / Wikimedia Commons, public domain' },
  { id: 'conversation', moduleId: 'm2', lessonIds: ['m2-01', 'm2-02', 'm2-03'], source: require('../../assets/curriculum/module-2/openmoji-1F4AC.svg'), aspectRatio: 1, altText: { en: 'Speech bubble representing a supportive conversation.', es: 'Burbuja de diálogo que representa una conversación de apoyo.' }, decorative: false, attribution: 'OpenMoji, CC BY-SA 4.0' },
  { id: 'person-in-bed', moduleId: 'm2', lessonIds: ['m2-04', 'm2-05'], source: require('../../assets/curriculum/module-2/openmoji-1F6CC.svg'), aspectRatio: 1, altText: { en: 'Person resting in bed.', es: 'Persona descansando en la cama.' }, decorative: true, attribution: 'OpenMoji, CC BY-SA 4.0' },
  { id: 'alarm-plan', moduleId: 'm3', lessonIds: ['m3-01', 'm3-02', 'm3-03'], source: require('../../assets/curriculum/module-3/openmoji-23F0.svg'), aspectRatio: 1, altText: { en: 'Alarm clock representing a specific time-based plan.', es: 'Reloj despertador que representa un plan específico con horario.' }, decorative: false, attribution: 'OpenMoji, CC BY-SA 4.0' },
  { id: 'handshake-support', moduleId: 'm3', lessonIds: ['m3-04', 'm3-05'], source: require('../../assets/curriculum/module-3/openmoji-1F91D.svg'), aspectRatio: 1, altText: { en: 'Handshake representing practical support and shared planning.', es: 'Apretón de manos que representa apoyo práctico y planificación compartida.' }, decorative: false, attribution: 'OpenMoji, CC BY-SA 4.0' },
  { id: 'prenatal-care', moduleId: 'm4', lessonIds: ['m4-01', 'm4-02', 'm4-03'], source: require('../../assets/curriculum/module-4/openmoji-1F930.svg'), aspectRatio: 1, altText: { en: 'Pregnant person representing prenatal sleep education.', es: 'Persona embarazada que representa la educación prenatal sobre el sueño.' }, decorative: false, attribution: 'OpenMoji, CC BY-SA 4.0' },
  { id: 'sleep-bedroom', moduleId: 'm5', lessonIds: ['m5-01', 'm5-02'], source: require('../../assets/curriculum/module-5/openmoji-1F6CF.svg'), aspectRatio: 1, altText: { en: 'Bed representing a sleep-friendly bedroom.', es: 'Cama que representa un dormitorio favorable para el sueño.' }, decorative: false, attribution: 'OpenMoji, CC BY-SA 4.0' },
  { id: 'morning-light', moduleId: 'm5', lessonIds: ['m5-03', 'm5-04'], source: require('../../assets/curriculum/module-5/openmoji-2600.svg'), aspectRatio: 1, altText: { en: 'Sun representing daytime light and the sleep-wake cycle.', es: 'Sol que representa la luz diurna y el ciclo de sueño y vigilia.' }, decorative: false, attribution: 'OpenMoji, CC BY-SA 4.0' },
  { id: 'caffeine-timing', moduleId: 'm5', lessonIds: ['m5-05', 'm5-06'], source: require('../../assets/curriculum/module-5/openmoji-2615.svg'), aspectRatio: 1, altText: { en: 'Cup representing caffeine timing.', es: 'Taza que representa el horario de consumo de cafeína.' }, decorative: false, attribution: 'OpenMoji, CC BY-SA 4.0' },
  { id: 'daytime-activity', moduleId: 'm5', lessonIds: ['m5-07', 'm5-08'], source: require('../../assets/curriculum/module-5/openmoji-1F6B6.svg'), aspectRatio: 1, altText: { en: 'Person walking to represent daytime activity.', es: 'Persona caminando para representar la actividad diurna.' }, decorative: false, attribution: 'OpenMoji, CC BY-SA 4.0' },
  { id: 'cpap-patient', moduleId: 'm6', lessonIds: ['m6-01', 'm6-02', 'm6-03'], source: require('../../assets/curriculum/module-6/cpap-patient.png'), aspectRatio: 1280 / 819, altText: { en: 'Illustration of a person sleeping while wearing a PAP mask connected to a bedside device.', es: 'Ilustración de una persona durmiendo con una mascarilla PAP conectada a un equipo junto a la cama.' }, decorative: false, attribution: 'MyUpchar / Wikimedia Commons, CC BY-SA 4.0' },
  { id: 'care-team', moduleId: 'm6', lessonIds: ['m6-04', 'm6-05'], source: require('../../assets/curriculum/module-6/openmoji-1F3E5.svg'), aspectRatio: 1, altText: { en: 'Healthcare building representing medical-team support.', es: 'Edificio de atención médica que representa el apoyo del equipo médico.' }, decorative: false, attribution: 'OpenMoji, CC BY-SA 4.0' },
  { id: 'shared-closeness', moduleId: 'm7', lessonIds: ['m7-01', 'm7-02', 'm7-03'], source: require('../../assets/curriculum/module-7/openmoji-1FAC2.svg'), aspectRatio: 1, altText: { en: 'Two people embracing to represent warmth and emotional closeness.', es: 'Dos personas abrazándose para representar calidez y cercanía emocional.' }, decorative: false, attribution: 'OpenMoji, CC BY-SA 4.0' },
];

export const imageForLesson = (lessonId: string) => curriculumImages.find((asset) => asset.lessonIds.includes(lessonId));
export const imagesForLesson = (lessonId: string) => curriculumImages.filter((asset) => asset.lessonIds.includes(lessonId));
export const imageForModule = (moduleId: string) => curriculumImages.find((asset) => asset.moduleId === moduleId);
