import type { EducationModule, LessonScreen } from '@/src/types/content';
import { ciasSpanishTranslations, type CiasSpanishTranslation } from './cias-translations';

export interface SpanishScreenDraft {
  title: string;
  body: string[];
  keyPoints?: string[];
  placeholder?: string;
}

function translateCiasScreen(screen: LessonScreen, translation: CiasSpanishTranslation): LessonScreen {
  const translated = {
    ...screen,
    title: translation.title,
    translationStatus: 'translated_from_approved_english' as const,
    translationProvenance: 'approved-english-curriculum' as const,
    bilingualReviewStatus: 'not_reviewed' as const,
  };
  if (screen.type === 'content') {
    if (!translation.paragraphs) throw new Error(`Missing Spanish paragraphs for ${screen.id}`);
    return {
      ...translated,
      type: 'content',
      paragraphs: translation.paragraphs,
      narrationText: translation.paragraphs.join(' '),
      orderedList: undefined,
      keyPoints: undefined,
      sourceVisibleLabels: translation.sourceVisibleLabels ?? [],
    };
  }
  if (screen.type === 'summary') {
    if (!translation.keyPoints) throw new Error(`Missing Spanish summary for ${screen.id}`);
    return {
      ...translated,
      type: 'summary',
      keyPoints: translation.keyPoints,
      narrationText: translation.keyPoints.join(' '),
      sourceVisibleLabels: translation.sourceVisibleLabels ?? [],
    };
  }
  if (screen.type === 'singleChoice' || screen.type === 'multiSelect') {
    if (!translation.prompt || !translation.choices || translation.choices.length !== screen.choices.length) {
      throw new Error(`Incomplete Spanish question translation for ${screen.id}`);
    }
    return {
      ...translated,
      type: screen.type,
      prompt: translation.prompt,
      instructions: translation.instructions,
      contextParagraphs: translation.contextParagraphs ?? [],
      choices: screen.choices.map((choice, index) => ({ ...choice, label: translation.choices![index] })),
      narrationText: [translation.prompt, translation.instructions, ...(translation.contextParagraphs ?? []), ...translation.choices].filter(Boolean).join(' '),
      questionFeedback: screen.questionFeedback,
      feedback: screen.feedback,
    };
  }
  if (screen.type === 'reflection') {
    if (!translation.prompt) throw new Error(`Missing Spanish reflection prompt for ${screen.id}`);
    return {
      ...translated,
      type: 'reflection',
      prompt: translation.prompt,
      instructions: translation.instructions,
      contextParagraphs: translation.contextParagraphs ?? [],
      narrationText: [translation.prompt, translation.instructions, ...(translation.contextParagraphs ?? [])].filter(Boolean).join(' '),
    };
  }
  throw new Error(`Unexpected CIAS source screen type for ${screen.id}`);
}

export function draftSpanishModule(
  base: EducationModule,
  meta: Pick<EducationModule, 'title' | 'shortTitle' | 'description'>,
  drafts: Record<string, SpanishScreenDraft>,
): EducationModule {
  const screens = base.screens.map((screen): LessonScreen => {
    const draft = drafts[screen.id];
    if (screen.sourceIds?.includes('cias-screenshot-recovery')) {
      const translation = ciasSpanishTranslations[screen.id];
      if (!translation) throw new Error(`Missing approved-English Spanish translation for ${screen.id}`);
      return translateCiasScreen(screen, translation);
    }
    if (!draft) throw new Error(`Missing Spanish draft for ${screen.id}`);
    const review = { translationStatus: 'machine_drafted' as const, bilingualReviewStatus: 'not_reviewed' as const };
    if (screen.type === 'content') return { ...screen, ...review, title:draft.title, narrationText:[...draft.body, ...(draft.keyPoints ?? [])].join(' '), paragraphs: draft.body, orderedList: screen.id === 'm1-03' ? ['Los músculos alrededor de la garganta se relajan.', 'La vía respiratoria superior se bloquea parcial o completamente.', 'El flujo de aire disminuye o se detiene brevemente.', 'El cerebro y el cuerpo responden para que la respiración pueda reiniciarse.', 'El sueño puede interrumpirse, aunque no recuerde haberse despertado.'] : undefined, keyPoints: draft.keyPoints };
    if (screen.type === 'summary') return { ...screen, ...review, title:draft.title, narrationText:draft.body.join(' '), keyPoints: draft.body };
    if (screen.type === 'aiActivity') return { ...screen, ...review, title:draft.title, narrationText:draft.body.join(' '), prompt: draft.body[0], placeholder: draft.placeholder ?? screen.placeholder };
    // Narrate only what is on screen (title and prompt), matching the English reflection narration.
    if (screen.type === 'reflection') return { ...screen, ...review, title:draft.title, narrationText:[draft.title, draft.body[0]].join(' '), prompt: draft.body[0] };
    if (screen.type === 'scenario') return { ...screen, ...review, title:draft.title, narrationText:draft.body.join(' '), scenario: draft.body[0], prompt: draft.body[1] ?? screen.prompt };
    const generalExplanation = draft.body[screen.choices.length + 1] ?? 'Revise la explicación y vuelva a intentarlo cuando quiera.';
    const isReflection = screen.questionKind === 'reflection';
    return {
      // Narrate the prompt and choices only, as in English. The explanation follows the body's choices
      // and is shown (and spoken) only after the learner answers, so reading it first would give the answer away.
      ...screen, ...review, title:draft.title, narrationText:draft.body.slice(0, screen.choices.length + 1).join(' '),
      prompt: draft.body[0],
      instructions: screen.instructions,
      choices: screen.choices.map((choice, index) => ({ ...choice, label: draft.body[index + 1] ?? choice.label })),
      questionFeedback: isReflection
        ? { generalExplanation }
        : { ...screen.questionFeedback, correctSummary: 'Correcto.', incorrectSummary: 'Aún no.', generalExplanation },
      feedback: isReflection ? generalExplanation : undefined,
    };
  });
  return {
    ...base, ...meta, screens,
    translationStatus: screens.some((screen) => screen.translationStatus === 'translated_from_approved_english') ? 'translated_from_approved_english' : 'machine_drafted',
    translationProvenance: screens.some((screen) => screen.translationProvenance === 'approved-english-curriculum') ? 'approved-english-curriculum' : 'existing-app-spanish-draft',
    bilingualReviewStatus: 'not_reviewed', clinicalReviewStatus: base.clinicalReviewStatus,
  };
}
