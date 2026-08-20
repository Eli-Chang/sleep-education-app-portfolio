import { describe, expect, it } from 'vitest';
import { parseProviderContent, parseProviderEnvelope, withProviderHttpFailure } from '../src/provider-contract';

const parse = (content: string) => parseProviderContent(content, { captureContent: true });

describe('Groq JSON Object Mode provider contract', () => {
  it('accepts a valid minimal reply object', () => {
    const result = parse('{"reply":"The approved lesson explains this concept."}');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.candidate).toEqual({ reply: 'The approved lesson explains this concept.' });
  });

  it('trims surrounding JSON and reply whitespace', () => {
    const result = parse('  {"reply":"  Explain the approved lesson.  "}  ');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.candidate.reply).toBe('Explain the approved lesson.');
  });

  it('accepts one optional follow-up question and rejects client-controlled deterministic fields', () => {
    const followUp = parse('{"reply":"Approved explanation.","followUpQuestion":"Want me to explain what AHI measures?"}');
    expect(followUp.ok).toBe(true);
    const optional = parse('{"reply":"Approved explanation.","understandingStatus":"developing"}');
    expect(optional.ok).toBe(false);
    const deterministic = parse('{"reply":"Approved explanation.","conversationComplete":true,"source_ids":["CLAIM"]}');
    expect(deterministic.ok).toBe(false);
    if (!deterministic.ok) expect(deterministic.diagnostic.worker_validation_error_code).toBe('PROVIDER_RESPONSE_SCHEMA');
  });

  it('rejects missing reply, wrong reply type, fenced JSON, prose, and empty content', () => {
    for (const [content, code] of [
      ['{}', 'PROVIDER_RESPONSE_SCHEMA'],
      ['{"reply":42}', 'PROVIDER_RESPONSE_SCHEMA'],
      ['```json\n{"reply":"Approved explanation."}\n```', 'PROVIDER_INVALID_JSON'],
      ['Approved explanation.', 'PROVIDER_INVALID_JSON'],
      ['', 'PROVIDER_CONTENT_EMPTY'],
    ] as const) {
      const result = parse(content);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.diagnostic.worker_validation_error_code).toBe(code);
    }
  });

  it('rejects missing choices and truncated provider content with exact paths', () => {
    const missing = parseProviderEnvelope({}, { captureContent: true });
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.diagnostic.worker_validation_error_path).toBe('choices[0].message.content');
      expect(missing.diagnostic.worker_validation_error_code).toBe('PROVIDER_CONTENT_MISSING');
    }
    const truncated = parse('{"reply":"unterminated}');
    expect(truncated.ok).toBe(false);
    if (!truncated.ok) expect(truncated.diagnostic.provider_json_parse_status).toBe('invalid_json');
  });

  it('accepts deterministic Worker fields being absent from the provider object', () => {
    const result = parse('{"reply":"Safe educational response."}');
    expect(result.ok).toBe(true);
  });

  it('normalizes token usage and prompt-cache fields from an authorized provider envelope', () => {
    const result = parseProviderEnvelope({
      choices: [{ message: { content: '{"reply":"Approved explanation."}' } }],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 24,
        total_tokens: 124,
        prompt_tokens_details: { cached_tokens: 60 },
        completion_tokens_details: { reasoning_tokens: 8 },
      },
    }, { promptCache: { stable_prefix_hash: 'a'.repeat(64), stable_prefix_byte_length: 32, stable_prefix_message_count: 1, variable_context_message_index: 1 } });
    expect(result.ok).toBe(true);
    expect(result.diagnostic.provider_usage).toEqual({ prompt_tokens: 100, cached_prompt_tokens: 60, uncached_prompt_tokens: 40, completion_tokens: 24, reasoning_tokens: 8, total_tokens: 124, cache_hit_percentage: 60 });
    expect(result.diagnostic.prompt_cache?.stable_prefix_hash).toBe('a'.repeat(64));
  });

  it('sanitizes captured content and does not retain authorization material', () => {
    const result = parse('{"reply":"Bearer secret-value; GROQ_API_KEY=hidden-value"}');
    expect(result.ok).toBe(true);
    expect(result.diagnostic.sanitized_provider_content).not.toContain('secret-value');
    expect(result.diagnostic.sanitized_provider_content).not.toContain('hidden-value');
  });

  it('redacts quoted keys, Groq tokens, Cloudflare values, and environment dumps', () => {
    const secretShapes = [
      'Authorization: Bearer authorization-secret-value',
      '"GROQ_API_KEY": "gsk_1234567890abcdefghijklmnopqrstuvwxyz"',
      "'evaluation_diagnostics_token'='evaluation-capability-secret-value'",
      'CLOUDFLARE_API_TOKEN=cloudflare-secret-token-value',
      'ENV={API_KEY: generic-secret-value, CF_API_TOKEN: another-secret-value}',
    ].join('\n');
    const result = parse(JSON.stringify({ reply: secretShapes }));
    expect(result.ok).toBe(true);
    const captured = result.diagnostic.sanitized_provider_content ?? '';
    for (const secret of [
      'authorization-secret-value',
      'gsk_1234567890abcdefghijklmnopqrstuvwxyz',
      'evaluation-capability-secret-value',
      'cloudflare-secret-token-value',
      'generic-secret-value',
      'another-secret-value',
    ]) expect(captured).not.toContain(secret);
  });

  it('captures an authorized redacted provider HTTP error body without exposing it publicly', () => {
    const diagnostic = withProviderHttpFailure('{"error":{"message":"invalid request; Bearer secret-value"}}', {
      captureContent: true,
      providerHttpStatus: 400,
      sensitiveValues: ['secret-value'],
    });
    expect(diagnostic.worker_validation_error_code).toBe('PROVIDER_HTTP_ERROR');
    expect(diagnostic.provider_http_status).toBe(400);
    expect(diagnostic.sanitized_provider_content).toContain('invalid request');
    expect(diagnostic.sanitized_provider_content).not.toContain('secret-value');
    expect(withProviderHttpFailure('provider error', { captureContent: false, providerHttpStatus: 400 }).sanitized_provider_content).toBeNull();
  });
});
