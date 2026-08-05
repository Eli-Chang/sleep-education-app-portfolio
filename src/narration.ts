import type { LessonScreen } from './content.js';

export type NarrationCue = { title: string; text: string; locale: 'en' | 'es' };

export function createNarrationCue(screen: LessonScreen, locale: 'en' | 'es'): NarrationCue {
  return { title: screen.title, text: screen.paragraphs.join(' '), locale };
}
