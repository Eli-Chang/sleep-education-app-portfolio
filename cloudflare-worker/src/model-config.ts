import modelPolicy from '../../config/groq-model.json';

export const modelConfig = {
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  defaultModel: modelPolicy.primary,
  fallbackModels: [modelPolicy.fallback],
  timeoutMs: 10_000,
  maxCompletionTokens: 300,
  temperature: 0.35,
  includeReasoning: modelPolicy.include_reasoning,
  reasoningEffort: modelPolicy.reasoning_effort,
  allowedModels: [modelPolicy.primary, modelPolicy.fallback],
} as const;
