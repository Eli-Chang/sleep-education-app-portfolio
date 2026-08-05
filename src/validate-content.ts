import type { EducationModule } from './content.js';

const notices = {
  en: 'Demonstration content created for the Sleep Education App Portfolio. Not clinical guidance.',
  es: 'Contenido de demostración creado para Sleep Education App Portfolio. No es orientación clínica.'
} as const;

export function validateBilingualContent(english: EducationModule[], spanish: EducationModule[]): string[] {
  const errors: string[] = [];
  if (!english.length || english.length !== spanish.length) errors.push('English and Spanish module counts must match and be nonzero.');
  for (let index = 0; index < Math.min(english.length, spanish.length); index += 1) {
    const enModule = english[index];
    const esModule = spanish[index];
    if (enModule.id !== esModule.id) errors.push(`Module IDs differ at index ${index}.`);
    if (enModule.locale !== 'en') errors.push(`${enModule.id} must be marked en.`);
    if (esModule.locale !== 'es') errors.push(`${esModule.id} must be marked es.`);
    const enModuleIds = enModule.screens.map((screen) => screen.id);
    const esModuleIds = esModule.screens.map((screen) => screen.id);
    if (enModuleIds.length !== esModuleIds.length || enModuleIds.some((id, screenIndex) => id !== esModuleIds[screenIndex])) errors.push(`Screen IDs differ for module ${enModule.id}.`);
  }
  const enScreens = english.flatMap((module) => module.screens);
  const esScreens = spanish.flatMap((module) => module.screens);
  const enIds = enScreens.map((screen) => screen.id);
  const esIds = esScreens.map((screen) => screen.id);
  if (new Set(enIds).size !== enIds.length || new Set(esIds).size !== esIds.length) errors.push('Screen IDs must be unique within each locale.');
  if (enIds.length !== esIds.length || enIds.some((id, index) => id !== esIds[index])) errors.push('English and Spanish screen IDs must match in order.');
  for (const module of [...english, ...spanish]) {
    const notice = notices[module.locale];
    if (!module.synthetic) errors.push(`${module.id} is not marked synthetic.`);
    for (const screen of module.screens) {
      if (!screen.title.trim() || !screen.paragraphs.length) errors.push(`${screen.id} is incomplete.`);
      if (!screen.paragraphs.some((paragraph) => paragraph.includes(notice))) errors.push(`${screen.id} is missing the demonstration notice.`);
      if (screen.type === 'singleChoice' && (!screen.choices?.length || !screen.correctChoiceId || !screen.choices.some((choice) => choice.id === screen.correctChoiceId))) errors.push(`${screen.id} has an invalid knowledge check.`);
    }
  }
  return errors;
}
