import assert from 'node:assert/strict';
import test from 'node:test';
import { module01 } from '@/src/content/en/modules/module-01';
import { questionQualityIssues } from '@/src/utils/question-quality';

test('OSA objective questions pass lightweight quality checks', () => {
  assert.deepEqual(questionQualityIssues(module01.screens), []);
});

test('quality check detects duplicate options', () => {
  const screen = module01.screens.find((item) => item.id === 'm1-q1');
  assert.ok(screen && (screen.type === 'singleChoice' || screen.type === 'multiSelect'));
  const original = screen.choices;
  screen.choices = [{ id: 'c1', label: 'same' }, { id: 'c2', label: 'same' }, { id: 'c3', label: 'short' }, { id: 'c4', label: 'short' }];
  const issues = questionQualityIssues([screen]);
  screen.choices = original;
  assert.ok(issues.some((issue) => issue.issue === 'duplicate choices'));
});
