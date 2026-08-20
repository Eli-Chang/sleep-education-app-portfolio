import { describe, expect, it } from 'vitest';
import { evaluationDiagnosticsAuthorized } from '../src/secure-evaluation';

const capability = 'server-only-evaluation-capability-0123456789';
const request = (headers: Record<string, string>) => new Request('https://worker.test/v1/lesson-chat', { headers });

describe('secure evaluation diagnostics authorization', () => {
  it.each([
    ['disabled despite forged headers', { EVALUATION_DIAGNOSTICS_ENABLED: 'false', EVALUATION_DIAGNOSTICS_TOKEN: capability }, { 'X-Evaluation-Run': 'synthetic-live', 'X-Evaluation-Diagnostics-Token': capability }],
    ['public run header only', { EVALUATION_DIAGNOSTICS_ENABLED: 'true', EVALUATION_DIAGNOSTICS_TOKEN: capability }, { 'X-Evaluation-Run': 'synthetic-live' }],
    ['wrong capability', { EVALUATION_DIAGNOSTICS_ENABLED: 'true', EVALUATION_DIAGNOSTICS_TOKEN: capability }, { 'X-Evaluation-Run': 'synthetic-live', 'X-Evaluation-Diagnostics-Token': 'wrong-capability-that-is-still-long-enough' }],
    ['capability without approved path marker', { EVALUATION_DIAGNOSTICS_ENABLED: 'true', EVALUATION_DIAGNOSTICS_TOKEN: capability }, { 'X-Evaluation-Diagnostics-Token': capability }],
  ] as const)('fails closed for %s', async (_name, env, headers) => {
    await expect(evaluationDiagnosticsAuthorized(request(headers), env)).resolves.toBe(false);
  });

  it('allows the server-only capability only on the approved synthetic path', async () => {
    await expect(evaluationDiagnosticsAuthorized(request({
      'X-Evaluation-Run': 'synthetic-live', 'X-Evaluation-Diagnostics-Token': capability,
    }), { EVALUATION_DIAGNOSTICS_ENABLED: 'true', EVALUATION_DIAGNOSTICS_TOKEN: capability })).resolves.toBe(true);
  });
});
