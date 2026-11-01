import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (relativePath: string) => readFileSync(resolve(root, relativePath), 'utf8');

test('lesson navigation leaves directional transitions to the lesson surface', () => {
  const layout = read('app/_layout.tsx');
  const lesson = read('app/lesson/[moduleId]/[screenId].tsx');
  const stableRoute = read('app/lesson/[moduleId]/index.tsx');

  assert.match(layout, /<Stack\.Screen name="lesson\/\[moduleId\]\/index" options=\{\{ animation: 'slide_from_right' \}\} \/>/);
  assert.match(layout, /<Stack\.Screen name="lesson\/\[moduleId\]\/\[screenId\]" options=\{\{ animation: 'none' \}\} \/>/);
  assert.match(stableRoute, /export \{ default \} from '\.\/\[screenId\]';/);
  assert.match(lesson, /router\.setParams\(\{ screenId: targetId, direction: move \}\)/);
  assert.match(lesson, /const legacyLessonHref = !isStableLessonRoute && screenId/);
  assert.match(lesson, /<Redirect href=\{legacyLessonHref\} \/>/);
  assert.match(lesson, /const outgoingOffset = direction === 'backward' \? lessonWidth : -lessonWidth;/);
  assert.match(lesson, /const incomingOffset = direction === 'backward' \? -lessonWidth : lessonWidth;/);
  assert.doesNotMatch(lesson, /opacity:\s*transition/);
  assert.match(lesson, /scrollKey=\{requestedScreenId \?\? displayedScreenId\}/);
});

test('module exit actions use stack dismissal/back behavior', () => {
  const module = read('app/module/[id].tsx');
  const complete = read('app/module/[id]/complete.tsx');

  assert.match(module, /router\.canDismiss\(\)\) router\.dismissTo\('\/' as Href\)/);
  assert.match(complete, /router\.canDismiss\(\) \? router\.dismissTo\(/);
  assert.match(complete, /router\.dismissTo\('\/' as Href\)/);
});
