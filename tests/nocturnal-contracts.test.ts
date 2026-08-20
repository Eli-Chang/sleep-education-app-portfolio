import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { gradientPoints, palette } from '../src/theme/tokens';
import { getVelaBottomOffset } from '../src/components/vela-layout';

const root = resolve(import.meta.dirname, '..');
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), 'utf8');
const relativeLuminance = (hex: string) => {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = channels.map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};
const contrastRatio = (foreground: string, background: string) => {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
};
const styleBlock = (source: string, styleName: string) => {
  const match = source.match(new RegExp(`\\b${styleName}: \\{([^}]*)\\}`));
  assert.ok(match, `Missing ${styleName} style`);
  return match[1];
};

test('Nocturnal palette stays aligned with the locked Figma foundation', () => {
  assert.equal(palette.background, '#0E1A2B');
  assert.equal(palette.backgroundGradientStart, '#0A1424');
  assert.equal(palette.backgroundGradientMid, '#0E1A2B');
  assert.equal(palette.backgroundGradientEnd, '#162742');
  assert.equal(palette.surface, '#121A33');
  assert.equal(palette.surfaceSoft, '#2D291E');
  assert.equal(palette.raised, '#1A2445');
  assert.equal(palette.cardGradientStart, '#162A55');
  assert.equal(palette.cardGradientEnd, '#3B2B58');
  assert.equal(palette.inkMuted, '#A5B0C0');
  assert.equal(palette.primary, '#D6B46A');
  assert.equal(palette.primaryDark, '#B79252');
  assert.equal(palette.onPrimary, '#091322');
  assert.deepEqual(gradientPoints.cardStart, { x: 0, y: 0.08 });
  assert.deepEqual(gradientPoints.cardEnd, { x: 1, y: 0.92 });
  assert.deepEqual(gradientPoints.backgroundStart, { x: 0.92, y: 0 });
  assert.deepEqual(gradientPoints.backgroundEnd, { x: 0.08, y: 1 });
  assert.notEqual(palette.primary, palette.primaryDark);
  assert.equal(palette.primarySoft, '#342716');
  assert.ok(contrastRatio(palette.primaryDark, palette.primarySoft) >= 4.5);
  assert.equal(palette.accent, '#A9B2FA');
  assert.equal(palette.accentSoft, '#27283D');
  assert.equal(palette.border, '#53617F');
  assert.equal(palette.success, '#6FD1A0');
  assert.equal(palette.warning, '#F3C97A');
  assert.equal(palette.danger, '#FF9A8B');
  assert.equal(read('assets/fonts/BricolageGrotesque-Variable.ttf').length > 1000, true);
  assert.equal(read('assets/fonts/Karla-Variable.ttf').length > 1000, true);
  assert.match(read('assets/fonts/OFL-BricolageGrotesque.txt'), /SIL OPEN FONT LICENSE/i);
  assert.match(read('assets/fonts/OFL-Karla.txt'), /SIL OPEN FONT LICENSE/i);
});

test('nocturnal UI contracts preserve contrast, gradients, and clipping', () => {
  const ui = read('src/components/ui.tsx');
  const rootLayout = read('app/_layout.tsx');
  const home = read('app/(tabs)/index.tsx');
  const settings = read('app/(tabs)/settings.tsx');
  const modal = read('app/modal.tsx');
  const appConfig = read('app.json');
  assert.match(ui, /import \{ LinearGradient \} from 'expo-linear-gradient';/);
  assert.match(ui, /export function GradientSurface\(\)/);
  assert.match(ui, /export function BackgroundGradient\(\)/);
  assert.match(ui, /accessible=\{false\}/);
  assert.match(ui, /pointerEvents: 'none'/);
  assert.match(ui, /colors=\{\[palette\.cardGradientStart, palette\.cardGradientEnd\]\}/);
  assert.match(ui, /start=\{gradientPoints\.cardStart\}/);
  assert.match(ui, /end=\{gradientPoints\.cardEnd\}/);
  assert.match(ui, /colors=\{\[palette\.backgroundGradientStart, palette\.backgroundGradientMid, palette\.backgroundGradientEnd\]\}/);
  assert.match(ui, /start=\{gradientPoints\.backgroundStart\}/);
  assert.match(ui, /end=\{gradientPoints\.backgroundEnd\}/);
  assert.equal((ui.match(/<BackgroundGradient \/>/g) ?? []).length, 1);
  assert.match(ui, /<SafeAreaView style=\{styles\.safe\}[^>]*>\s*<BackgroundGradient \/>/);
  assert.match(ui, /safe: \{ flex: 1, backgroundColor: 'transparent' \}/);
  assert.match(rootLayout, /import \{ DarkTheme, ThemeProvider \} from '@react-navigation\/native';/);
  assert.match(rootLayout, /const navigationTheme =/);
  assert.match(rootLayout, /background: 'transparent'/);
  assert.match(rootLayout, /card: 'transparent'/);
  assert.match(rootLayout, /<ThemeProvider value=\{navigationTheme\}>/);
  assert.doesNotMatch(rootLayout, /<BackgroundGradient \/>/);
  assert.match(rootLayout, /contentStyle: \{ backgroundColor: 'transparent' \}/);
  assert.match(home, /<AppScreen>/);
  assert.match(settings, /<AppScreen>/);
  assert.match(modal, /<SafeAreaView style=\{styles\.safeArea\}>/);
  assert.match(styleBlock(modal, 'safeArea'), /backgroundColor: 'transparent'/);
  assert.doesNotMatch(modal, /<SafeAreaView style=\{\[styles\.safeArea, \{ backgroundColor: palette\.background \}\]\}>/);
  assert.doesNotMatch(modal, /constants\/theme.*Colors/);
  assert.match(appConfig, /"backgroundColor": "#0E1A2B"/);
  assert.match(ui, /card: \{[^}]*overflow: 'hidden'/);
  assert.match(ui, /variant === 'primary' \? palette\.onPrimary/);
});

test('named production surfaces use the reusable gradient only for neutral states', () => {
  const home = read('app/(tabs)/index.tsx');
  const moduleOverview = read('app/module/[id].tsx');
  const lesson = read('app/lesson/[moduleId]/[screenId].tsx');
  const renderer = read('src/components/LessonRenderer.tsx');

  assert.match(home, /<Pressable[\s\S]*?<GradientSurface \/>/);
  assert.match(moduleOverview, /!current && !complete \? <GradientSurface \/> : null/);
  assert.match(lesson, /isObjectiveQuestion \? <GradientSurface \/> : null/);
  assert.match(renderer, /<View style=\{styles\.contentCard\}>\s*<GradientSurface \/>/);
  assert.match(renderer, /style=\{styles\.summaryRow\}><GradientSurface \/>/);
  assert.match(renderer, /style=\{\[styles\.stack, styles\.reflectionStack, styles\.reflectionCard\]\}>\s*<GradientSurface \/>/);
  assert.match(renderer, /!active && !missed && !incorrectSelected && !correctSelected \? <GradientSurface \/> : null/);
  assert.match(renderer, /style=\{styles\.reflectionChoicePanel\}><GradientSurface \/>/);

  for (const [source, surface] of [
    [home, 'moduleCard'],
    [moduleOverview, 'stepRow'],
    [lesson, 'lessonSurface'],
    [renderer, 'contentCard'],
    [renderer, 'summaryRow'],
    [renderer, 'choice'],
    [renderer, 'reflectionCard'],
    [renderer, 'reflectionChoicePanel'],
  ] as const) {
    const block = styleBlock(source, surface);
    assert.match(block, /backgroundColor: 'transparent'/, `${surface} must expose the gradient behind its content`);
    assert.match(block, /overflow: 'hidden'/, `${surface} must clip the gradient fill`);
  }

  assert.match(home, /style=\{\(\{ pressed \}\) => \[/);
  assert.match(home, /focusedModuleId === module\.id && styles\.focusedRow/);
  assert.match(moduleOverview, /backgroundColor: palette\.primarySoft/);
  assert.match(moduleOverview, /stepComplete: \{[^}]*backgroundColor: palette\.successSoft/);
  assert.match(renderer, /choiceActive: \{[^}]*backgroundColor: palette\.primarySoft/);
  assert.match(renderer, /choiceCorrect: \{[^}]*backgroundColor: palette\.successSoft/);
  assert.match(renderer, /choiceIncorrect: \{[^}]*backgroundColor: palette\.dangerSoft/);
  assert.match(renderer, /choiceMissed: \{[^}]*backgroundColor: palette\.warningSoft/);
  assert.match(renderer, /reflectionChoiceActive: \{[^}]*backgroundColor: palette\.reflectionSelected/);
});

test('LessonRenderer slide and response copy use the explicit white palette token', () => {
  const renderer = read('src/components/LessonRenderer.tsx');
  for (const style of [
    'body',
    'pointText',
    'orderedText',
    'prompt',
    'choiceText',
    'choiceTextActive',
    'optionExplanation',
    'feedbackTitle',
    'feedbackText',
    'reflectionInstruction',
    'reflectionPrompt',
    'reflectionInput',
    'savedLocallyBody',
    'reflectionInputText',
    'velaActivityInput',
  ]) assert.match(styleBlock(renderer, style), /color: palette\.white/, `${style} must use palette.white`);

  assert.match(renderer, /questionCue: \{[^}]*color: palette\.inkMuted/);
  assert.match(renderer, /sourceLink: \{[^}]*color: palette\.accent/);
  assert.match(renderer, /correctLabel: \{[^}]*color: palette\.success/);
  assert.match(renderer, /incorrectLabel: \{[^}]*color: palette\.danger/);
  assert.match(renderer, /missedLabel: \{[^}]*color: palette\.warning/);
  assert.match(renderer, /reflectionPrivacy: \{[^}]*color: palette\.inkMuted/);
  assert.match(renderer, /reflectionSaveErrorText: \{[^}]*color: palette\.danger/);
});

test('background and semantic solid surfaces remain locked', () => {
  const tokens = read('src/theme/tokens.ts');
  const renderer = read('src/components/LessonRenderer.tsx');
  const chat = read('src/components/LessonChat.tsx');
  const completion = read('app/module/[id]/complete.tsx');
  const modal = read('app/modal.tsx');
  const appConfig = read('app.json');
  assert.match(tokens, /background: '#0E1A2B'/);
  assert.match(tokens, /backgroundGradientStart: '#0A1424'/);
  assert.match(tokens, /backgroundGradientMid: '#0E1A2B'/);
  assert.match(tokens, /backgroundGradientEnd: '#162742'/);
  assert.match(renderer, /takeaway: \{[^}]*backgroundColor: palette\.accentSoft/);
  assert.match(renderer, /reflectionSaveError: \{[^}]*backgroundColor: palette\.dangerSoft/);
  assert.match(renderer, /reflectionSavedCard: \{[^}]*backgroundColor: palette\.background/);
  assert.match(renderer, /feedbackSaved: \{[^}]*backgroundColor: palette\.successSoft/);
  assert.match(chat, /consentSurface: \{[^}]*backgroundColor: palette\.accentSoft/);
  assert.match(chat, /safetySurface: \{[^}]*backgroundColor: palette\.accentSoft/);
  assert.match(completion, /statusCard: \{[^}]*backgroundColor: palette\.successSoft/);
  assert.match(modal, /checked \? palette\.successSoft : palette\.background/);
  assert.doesNotMatch(modal, /#090D16|#F8FAFC/);
  assert.match(appConfig, /"backgroundColor": "#0E1A2B"/);
});

test('Vela assets preserve the canonical two-eye, no-mouth mark', () => {
  const idle = read('assets/vela/vela-idle.svg');
  const blink = read('assets/vela/vela-blink.svg');
  for (const svg of [idle, blink]) {
    assert.match(svg, /id="Vela mark"/);
    assert.equal((svg.match(/id="(?:Left|Right) Eye(?: Closed)?"/g) ?? []).length, 2);
    assert.doesNotMatch(svg, /mouth/i);
    assert.doesNotMatch(svg, /#F0A868/i);
  }
});

test('quiz, reflection, completion, and consent contracts are present in the production surfaces', () => {
  const renderer = read('src/components/LessonRenderer.tsx');
  const provider = read('src/state/AppProvider.tsx');
  const chat = read('src/components/LessonChat.tsx');
  const lesson = read('app/lesson/[moduleId]/[screenId].tsx');
  const moduleOverview = read('app/module/[id].tsx');
  const completion = read('app/module/[id]/complete.tsx');
  const settings = read('app/(tabs)/settings.tsx');
  const vela = read('src/components/VelaMascot.tsx');
  const i18n = read('src/i18n/index.ts');
  assert.match(renderer, /disabled=\{locked\}/);
  assert.match(renderer, /submitAnswers/);
  assert.match(renderer, /reflectionChoicePanel/);
  assert.match(renderer, /reflectionMultiInstruction/);
  assert.match(renderer, /reflectionPrivacy/);
  assert.match(renderer, /submitAnswer\(question\.id, selected, correct\)/);
  assert.match(renderer, /TextInput/);
  assert.match(renderer, /reflection-save-error/);
  assert.match(renderer, /saveReflection\(screen\.id, text\)/);
  assert.doesNotMatch(renderer, /askLesson/);
  assert.doesNotMatch(renderer, /discussWithVela/);
  assert.match(renderer, /onEditingChange/);
  assert.match(provider, /sleep_education_state_v3/);
  assert.match(provider, /savedReflections/);
  assert.match(chat, /!consent \|\| !state\.aiConsent/);
  assert.match(chat, /AbortController/);
  assert.match(chat, /controller\.signal\.aborted/);
  assert.match(chat, /UPSTREAM_RATE_LIMITED/);
  assert.match(i18n, /velaRateLimited/);
  assert.match(lesson, /backToModule/);
  assert.match(lesson, /skipOptional/);
  assert.match(lesson, /isScoredQuestion/);
  assert.match(lesson, /submissionCorrect === true/);
  assert.match(lesson, /module\/\$\{module\.id\}\/complete/);
  assert.match(moduleOverview, /label=\{action\}/);
  assert.doesNotMatch(moduleOverview, /label=\{`\$\{action\} /);
  assert.match(completion, /label=\{t\('backToModules'\)\}/);
  assert.match(chat, /\/\^\\\/module\\\/\[\^\/\]\+\\\/complete\$/);
  assert.match(settings, /onValueChange=\{setAiEnabled\}/);
  assert.match(provider, /aiConsent: aiEnabled \? current\.aiConsent : false/);
  assert.match(vela, /outputRange: \[0, -6\]/);
  assert.match(vela, /vela-nudge/);
  assert.match(vela, /pointerEvents: Platform\.OS === 'web' \? 'none' : 'box-none'/);
  assert.match(vela, /pointerEvents: 'auto'/);
  assert.match(i18n, /velaNudge/);
});

test('Vela is root-mounted, geometry-aware, and activity handoff is explicit', () => {
  const rootLayout = read('app/_layout.tsx');
  const appScreen = read('src/components/ui.tsx');
  const vela = read('src/components/VelaMascot.tsx');
  const renderer = read('src/components/LessonRenderer.tsx');
  const chat = read('src/components/LessonChat.tsx');
  const provider = read('src/state/AppProvider.tsx');
  const audit = read('docs/OPEN_ENDED_ACTIVITY_AUDIT.md');
  assert.match(rootLayout, /<VelaNudgeProvider>/);
  assert.match(rootLayout, /<VelaChrome \/>/);
  assert.doesNotMatch(appScreen, /VelaLauncher|velaOnPress|velaBottomOffset/);
  assert.equal(getVelaBottomOffset({ isTabRoute: false, bottomInset: 0 }), 12);
  assert.equal(getVelaBottomOffset({ isTabRoute: true, bottomInset: 24 }), 120);
  assert.match(vela, /VELA_NUDGE_FIRST_DELAY = 2400/);
  assert.match(vela, /VELA_NUDGE_MIN_INTERVAL = 60_000/);
  assert.match(vela, /VELA_NUDGE_MAX_PER_SESSION = 3/);
  assert.match(vela, /VELA_BASELINE_TRANSITION_DURATION = 280/);
  assert.match(vela, /Animated\.timing\(baselineY/);
  assert.match(vela, /const useNativeDriver = Platform\.OS !== 'web'/);
  assert.match(vela, /styles\.chromeLayer/);
  assert.match(vela, /if \(reducedMotion \|\| !targetChanged\)/);
  assert.match(renderer, /vela-activity-input-/);
  assert.match(renderer, /askVela/);
  assert.match(renderer, /onOpenVelaActivity/);
  assert.match(chat, /pendingVelaActivity/);
  assert.match(chat, /setPendingVelaActivity\(undefined\)/);
  assert.match(provider, /interface PendingVelaActivity/);
  for (const id of ['m1-ai1', 'm2-ai1', 'm3-ai1', 'm3-ai2', 'm4-ai1', 'm4-ai2', 'm5-ai1', 'm5-ai2', 'm5-ai3', 'm6-ai1', 'm6-ai2', 'm7-ai1']) assert.match(audit, new RegExp(`\\| ${id} \\|`));
  assert.match(audit, /m3-ai1.*Describe a PAP barrier/);
  assert.match(audit, /m3-ai2.*Build a realistic next step/);
  assert.match(audit, /closed-choice reflections/);
});
