import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const root = process.cwd();
const registry = readFileSync(join(root, 'src', 'content', 'image-registry.ts'), 'utf8');
const assetPaths = [...registry.matchAll(/require\('\.\.\/\.\.\/(assets\/curriculum\/[^']+)'\)/g)].map((match) => match[1]);
const entries = [...registry.matchAll(/\{ id: '([^']+)'.+?altText: \{ en: '([^']+)', es: '([^']+)' \}.+?decorative: (true|false).+?attribution: '([^']+)' \}/g)];

test('curriculum registry has a focused set of bundled assets', () => {
  assert.ok(assetPaths.length >= 12 && assetPaths.length <= 20);
  assert.equal(new Set(assetPaths).size, assetPaths.length);
  for (const path of assetPaths) assert.ok(existsSync(join(root, path)), `missing ${path}`);
});

test('every registry entry has bilingual alt classification and attribution', () => {
  assert.equal(entries.length, assetPaths.length);
  for (const [, id, en, es, decorative, attribution] of entries) {
    assert.ok(en.trim().length > 3, `${id} missing English alt`);
    assert.ok(es.trim().length > 3, `${id} missing Spanish alt`);
    assert.match(decorative, /^(true|false)$/);
    assert.match(attribution, /(OpenMoji|Wikimedia Commons|user-provided)/i);
  }
});

test('license registry documents every asset id and accepted licenses', () => {
  const doc = readFileSync(join(root, 'docs', 'IMAGE_SOURCE_REGISTRY.md'), 'utf8');
  for (const [, id] of entries) assert.ok(doc.includes(`| ${id} |`), `${id} absent from source registry`);
  assert.match(doc, /CC BY-SA 4\.0/);
  assert.match(doc, /Public domain/);
});

test('motion system includes reduced-motion handling', () => {
  const hook = readFileSync(join(root, 'src', 'hooks', 'useReducedMotion.ts'), 'utf8');
  const ui = readFileSync(join(root, 'src', 'components', 'ui.tsx'), 'utf8');
  assert.match(hook, /isReduceMotionEnabled/);
  assert.match(ui, /reducedMotion/);
});
