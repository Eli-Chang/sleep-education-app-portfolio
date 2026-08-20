import { englishModules } from './en';
import { spanishModules } from './es';
import type { SupportedLocale } from '@/src/types/content';

export const modulesByLocale = { en: englishModules, es: spanishModules } as const;
export const getModules = (locale: SupportedLocale) => modulesByLocale[locale] ?? englishModules;
export const getModule = (locale: SupportedLocale, id: string) =>
  getModules(locale).find((module) => module.id === id);
