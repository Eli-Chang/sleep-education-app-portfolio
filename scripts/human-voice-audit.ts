import { getModules } from '@/src/content';
import { ui } from '@/src/i18n';
import type { LessonScreen, SupportedLocale } from '@/src/types/content';

type TextUnit = {
  locale: SupportedLocale;
  surface: string;
  text: string;
  sourceBacked?: boolean;
};

const HIGH_RISK_PATTERNS: Record<string, RegExp> = {
  emDash: /—/g,
  cannedTransition: /\b(in this (module|lesson|activity)|as you (learn|continue)|to help you|it is important to note)\b/gi,
  genericAbstraction: /\b(comprehensive|meaningful|impactful|robust|navigate|journey|landscape|interplay|empower|foster|enhance|optimize)\b/gi,
  polishedFiller: /\b(delves? into|serves as|plays a (crucial|vital|key) role|a (crucial|vital|key) (part|aspect)|moving forward)\b/gi,
  forcedContrast: /\b(not only\b[^.?!]{0,140}\bbut also|not [^.!?]{0,100}\bbut\b)/gi,
  genericQuestion: /\b(any questions|anything else|feel free to ask)\b/gi,
};

function pushIfText(units: TextUnit[], locale: SupportedLocale, surface: string, value: unknown, sourceBacked = false): void {
  if (typeof value === 'string' && value.trim()) units.push({ locale, surface, text: value, sourceBacked });
}

function addScreenText(units: TextUnit[], locale: SupportedLocale, moduleId: string, screen: LessonScreen): void {
  const prefix = `${moduleId}/${screen.id}`;
  const sourceBacked = screen.sourceIds?.includes('cias-screenshot-recovery') ?? false;
  pushIfText(units, locale, `${prefix}.title`, screen.title, sourceBacked);
  pushIfText(units, locale, `${prefix}.narrationText`, screen.narrationText, sourceBacked);

  if (screen.type === 'content') {
    screen.paragraphs.forEach((text, index) => pushIfText(units, locale, `${prefix}.paragraphs[${index}]`, text, sourceBacked));
    screen.orderedList?.forEach((text, index) => pushIfText(units, locale, `${prefix}.orderedList[${index}]`, text, sourceBacked));
    screen.keyPoints?.forEach((text, index) => pushIfText(units, locale, `${prefix}.keyPoints[${index}]`, text, sourceBacked));
  }

  if (screen.type === 'singleChoice' || screen.type === 'multiSelect' || screen.type === 'scenario') {
    pushIfText(units, locale, `${prefix}.prompt`, screen.prompt, sourceBacked);
    screen.choices.forEach((choice, index) => pushIfText(units, locale, `${prefix}.choices[${index}]`, choice.label, sourceBacked));
    pushIfText(units, locale, `${prefix}.feedback`, screen.feedback, sourceBacked);
    pushIfText(units, locale, `${prefix}.questionFeedback.correctSummary`, screen.questionFeedback?.correctSummary, sourceBacked);
    pushIfText(units, locale, `${prefix}.questionFeedback.incorrectSummary`, screen.questionFeedback?.incorrectSummary, sourceBacked);
    pushIfText(units, locale, `${prefix}.questionFeedback.generalExplanation`, screen.questionFeedback?.generalExplanation, sourceBacked);
    Object.entries(screen.questionFeedback?.optionExplanations ?? {}).forEach(([choiceId, text]) =>
      pushIfText(units, locale, `${prefix}.questionFeedback.optionExplanations.${choiceId}`, text, sourceBacked));
    if (screen.type === 'scenario') {
      pushIfText(units, locale, `${prefix}.scenario`, screen.scenario, sourceBacked);
      Object.entries(screen.outcomes ?? {}).forEach(([choiceId, text]) =>
        pushIfText(units, locale, `${prefix}.outcomes.${choiceId}`, text, sourceBacked));
    }
  }

  if (screen.type === 'summary') {
    screen.keyPoints.forEach((text, index) => pushIfText(units, locale, `${prefix}.keyPoints[${index}]`, text, sourceBacked));
  }

  if (screen.type === 'aiActivity') {
    pushIfText(units, locale, `${prefix}.prompt`, screen.prompt, sourceBacked);
    pushIfText(units, locale, `${prefix}.placeholder`, screen.placeholder, sourceBacked);
  }
}

export function collectUnits(locale: SupportedLocale): TextUnit[] {
  const units: TextUnit[] = [];
  getModules(locale).forEach((module) => {
    pushIfText(units, locale, `${module.id}.title`, module.title);
    pushIfText(units, locale, `${module.id}.shortTitle`, module.shortTitle);
    pushIfText(units, locale, `${module.id}.description`, module.description);
    module.screens.forEach((screen) => addScreenText(units, locale, module.id, screen));
  });
  Object.entries(ui[locale].translation).forEach(([key, value]) => pushIfText(units, locale, `ui.${key}`, value));
  return units;
}

export function countMatches(units: TextUnit[]): Record<string, number> {
  return Object.fromEntries(Object.entries(HIGH_RISK_PATTERNS).map(([name, pattern]) => [
    name,
    units.reduce((total, unit) => total + (unit.text.match(pattern)?.length ?? 0), 0),
  ]));
}

function main(): void {
  const locales: SupportedLocale[] = ['en', 'es'];
  const units = locales.flatMap(collectUnits);
  const modules = Object.fromEntries(locales.map((locale) => [
    locale,
    getModules(locale).map((module) => ({
      id: module.id,
      title: module.title,
      screenCount: module.screens.length,
      screenTypes: Object.fromEntries(
        [...new Set(module.screens.map((screen) => screen.type))].map((type) => [
          type,
          module.screens.filter((screen) => screen.type === type).length,
        ]),
      ),
    })),
  ]));

  console.log(JSON.stringify({
    generatedAt: new Date().toISOString(),
    locales,
    modules,
    totalScreens: getModules('en').reduce((total, module) => total + module.screens.length, 0),
    textUnitsByLocale: Object.fromEntries(locales.map((locale) => [locale, units.filter((unit) => unit.locale === locale).length])),
    totalTextUnits: units.length,
    highRiskCounts: countMatches(units),
    flaggedExamples: units
      .filter((unit) => Object.values(HIGH_RISK_PATTERNS).some((pattern) =>
        new RegExp(pattern.source, pattern.flags.replace('g', '')).test(unit.text)))
      .slice(0, 40)
      .map(({ locale, surface, text }) => ({ locale, surface, text })),
  }, null, 2));
}

if (process.argv[1]?.toLowerCase().includes('human-voice-audit')) main();
