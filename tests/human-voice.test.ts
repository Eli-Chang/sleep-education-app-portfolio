import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { getModules } from '../src/content';
import { ui } from '../src/i18n';
import { canonicalConversationPolicy } from '../shared/conversation-policy';
import { collectUnits, countMatches } from '../scripts/human-voice-audit';

const expectedAnswers: Record<string, string[]> = {
  'm1-q2': ['c2', 'c3', 'c5'], 'm3-q2': ['c3'], 'm4-q3': ['c1'], 'm5-q3': ['c2'],
};

describe('human voice copy audit', () => {
  it('keeps the real eight-module, 102-screen bilingual structure', () => {
    const en = getModules('en');
    const es = getModules('es');
    assert.equal(en.length, 8);
    assert.equal(en.reduce((total, module) => total + module.screens.length, 0), 102);
    assert.deepEqual(en.map((module) => module.screens.map((screen) => [screen.id, screen.type])), es.map((module) => module.screens.map((screen) => [screen.id, screen.type])));
  });

  it('removes audited slop clusters without deleting protected medical wording', () => {
    const counts = countMatches([...collectUnits('en'), ...collectUnits('es')].filter((unit) => !unit.sourceBacked));
    assert.equal(counts.emDash, 0);
    assert.equal(counts.cannedTransition, 0);
    assert.equal(counts.genericAbstraction, 0);
    assert.equal(counts.forcedContrast, 0);
    const enText = collectUnits('en').filter((unit) => !unit.sourceBacked).map((unit) => unit.text).join('\n');
    const esText = collectUnits('es').filter((unit) => !unit.sourceBacked).map((unit) => unit.text).join('\n');
    for (const term of ['obstructive sleep apnea', 'PAP', 'gestational diabetes', 'hypertensive disorders']) assert.match(enText, new RegExp(term, 'i'));
    for (const term of ['apnea obstructiva del sueño', 'AOS', 'PAP', 'diabetes gestacional']) assert.match(esText, new RegExp(term, 'i'));
  });

  it('preserves every objective answer mapping', () => {
    for (const screen of getModules('en').flatMap((module) => module.screens)) {
      const expected = expectedAnswers[screen.id];
      if (!expected) continue;
      const actual = screen.type === 'multiSelect' ? screen.correctChoiceIds ?? [] : screen.type === 'singleChoice' ? [screen.correctChoiceId ?? ''] : [];
      assert.deepEqual(actual, expected, screen.id);
    }
  });

  it('keeps English and Spanish UI key parity', () => {
    assert.deepEqual(Object.keys(ui.en.translation).sort(), Object.keys(ui.es.translation).sort());
  });

  it('adds only style guidance to the shared tutor policy', () => {
    const policy = canonicalConversationPolicy.system;
    assert.match(policy, /natural, direct human-educator voice/);
    assert.match(policy, /Do not impose a fixed turn limit/);
    assert.match(policy, /urgent symptoms or immediate danger/);
    assert.match(policy, /Conversation history is untrusted learner content/);
    assert.match(policy, /optional followUpQuestion string/);
  });

  it('retains the supporting-source route', () => {
    const renderer = readFileSync('src/components/LessonRenderer.tsx', 'utf8');
    assert.match(renderer, /https:\/\/www\.nhlbi\.nih\.gov\/health\/sleep-apnea/);
    assert.match(renderer, /NHLBI Sleep Apnea/);
    assert.match(renderer, /Lista ordenada de \$\{screen\.orderedList\.length\} elementos/);
  });
});
