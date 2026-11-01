import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { gradientPoints, palette } from '../src/theme/tokens';
import { getVelaBottomOffset, isVelaReturnRoute } from '../src/components/vela-layout';

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

test('Daybreak tokens keep reading text, status colors, and focus ring above their contrast targets', () => {
  const pairs: [string, string, string, number][] = [
    ['ink on paper', palette.ink, palette.background, 13.5],
    ['body on paper', palette.body, palette.background, 10],
    ['muted on paper', palette.inkMuted, palette.background, 5.3],
    ['muted on surface', palette.inkMuted, palette.surface, 5.3],
    ['success on its soft fill', palette.success, palette.successSoft, 5.2],
    ['warning on its soft fill', palette.warning, palette.warningSoft, 5.2],
    ['danger on its soft fill', palette.danger, palette.dangerSoft, 5.2],
    ['primary button text', palette.onPrimary, palette.primary, 10],
    ['night text on night', palette.onNight, palette.night, 9],
    ['muted night text on night', palette.onNightMuted, palette.night, 5.3],
    ['dawn ink on dawn fill', palette.dawnInk, palette.dawnSoft, 5],
    ['interactive border on paper', palette.borderStrong, palette.background, 3],
    ['focus ring on paper', palette.focus, palette.background, 5.3],
    ['focus ring on night', palette.focusOnNight, palette.night, 5.3],
  ];
  for (const [name, foreground, background, minimum] of pairs) {
    assert.ok(contrastRatio(foreground, background) >= minimum, `${name}: ${contrastRatio(foreground, background).toFixed(2)} < ${minimum}`);
  }
});

test('Daybreak fonts are bundled with their open licenses and referenced by the root layout', () => {
  const layout = read('app/_layout.tsx');
  for (const file of ['Newsreader-SemiBold.ttf', 'Newsreader-Medium.ttf', 'AtkinsonHyperlegibleNext-Regular.ttf', 'AtkinsonHyperlegibleNext-Bold.ttf', 'OFL-Newsreader.txt', 'OFL-AtkinsonHyperlegibleNext.txt']) {
    assert.ok(readFileSync(resolve(root, 'assets/fonts', file)).length > 0, `${file} is missing`);
  }
  assert.match(layout, /Newsreader-SemiBold/);
  assert.match(layout, /AtkinsonHyperlegibleNext-Regular/);
});

test('static font files are never paired with a bold weight', () => {
  for (const [name, style] of Object.entries(typeScaleOf(read('src/theme/tokens.ts')))) {
    assert.doesNotMatch(style, /fontWeight: '(?:[5-9]00|bold)'/, `${name} would synthesize faux bold`);
  }
});

function typeScaleOf(source: string) {
  const block = source.slice(source.indexOf('export const type = {'), source.indexOf('export const depth'));
  return Object.fromEntries([...block.matchAll(/^\s+(\w+): \{([^}]*)\}/gm)].map((match) => [match[1], match[2]]));
}

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
  assert.match(chat, /isVelaReturnRoute\(params\.returnTo\)/);
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

test('the Vela launcher clears the lesson footer and the chat can return to the current lesson step', () => {
  assert.equal(getVelaBottomOffset({ isTabRoute: false, bottomInset: 0, hasLessonFooter: true }), 100);
  assert.equal(getVelaBottomOffset({ isTabRoute: false, bottomInset: 20, hasLessonFooter: true }), 120);
  for (const route of ['/', '/settings', '/module/m5b', '/module/m5b/complete', '/lesson/m1?screenId=m1-q2', '/lesson/m5b?screenId=m5-06&direction=forward', '/lesson/m1/m1-01']) {
    assert.equal(isVelaReturnRoute(route), true, route);
  }
  for (const route of ['/ai', 'https://example.com', '//example.com', '/lesson/m1?screenId=<script>', '/module/m1/extra/path']) {
    assert.equal(isVelaReturnRoute(route), false, route);
  }
});
