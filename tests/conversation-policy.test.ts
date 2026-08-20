import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildRollingConversation, canonicalConversationPolicy, MAX_HISTORY_MESSAGES, MAX_TRANSCRIPT_MESSAGES, trimTranscriptForDisplay } from '../shared/conversation-policy';

const turn = (role: 'user' | 'assistant', number: number) => ({ role, content: `${role} turn ${number}` });

describe('rolling conversation policy', () => {
  it('keeps intimacy, communication, and sexual-health education in scope without requiring disclosure', () => {
    assert.match(canonicalConversationPolicy.system, /intimacy and relationship modules/);
    assert.match(canonicalConversationPolicy.system, /sexual health are in scope/);
    assert.match(canonicalConversationPolicy.system, /without requiring personal disclosure/);
  });

  it('keeps the current learner message and the most recent bounded history', () => {
    const messages = Array.from({ length: 20 }, (_, index) => turn(index % 2 ? 'assistant' : 'user', index + 1));
    const selected = buildRollingConversation([...messages, turn('user', 21)]);
    assert.equal(selected.length, MAX_HISTORY_MESSAGES + 1);
    assert.deepEqual(selected.at(-1), turn('user', 21));
    assert.deepEqual(selected[0], turn('user', 9));
  });

  it('retains the current message when total character budget forces older context out', () => {
    const selected = buildRollingConversation([
      { role: 'assistant', content: 'x'.repeat(4_790) },
      { role: 'user', content: 'latest question' },
    ]);
    assert.deepEqual(selected, [{ role: 'user', content: 'latest question' }]);
  });

  it('bounds the rendered transcript separately from provider transport history', () => {
    const messages = Array.from({ length: MAX_TRANSCRIPT_MESSAGES + 5 }, (_, index) => turn(index % 2 ? 'assistant' : 'user', index + 1));
    const transcript = trimTranscriptForDisplay(messages);
    assert.equal(transcript.length, MAX_TRANSCRIPT_MESSAGES);
    assert.deepEqual(transcript.at(-1), turn('user', MAX_TRANSCRIPT_MESSAGES + 5));
  });

  it('keeps follow-ups optional and limited to one educational question', () => {
    const policy = canonicalConversationPolicy.system;
    assert.match(policy, /at most one short, specific educational follow-up question/);
    assert.match(policy, /Do not ask a follow-up after every answer/);
    assert.match(policy, /optional followUpQuestion string/);
  });
});
