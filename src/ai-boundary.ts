export type AiResult = { kind: 'consent_required' | 'success' | 'unavailable'; message?: string };
export type Requester = (endpoint: string, body: Record<string, unknown>) => Promise<{ message: string }>;
export const MAX_LEARNER_TEXT_LENGTH = 500;

export async function requestTeachBack(consent: boolean, learnerText: string, request: Requester): Promise<AiResult> {
  if (!consent) return { kind: 'consent_required' };
  const normalizedText = learnerText.trim();
  if (!normalizedText) return { kind: 'unavailable', message: 'A response is needed before feedback can be requested.' };
  if (normalizedText.length > MAX_LEARNER_TEXT_LENGTH) return { kind: 'unavailable', message: 'The response is too long for this demonstration boundary.' };
  try {
    const result = await request('/v1/teach-back', { learnerText: normalizedText });
    return { kind: 'success', message: result.message };
  } catch {
    return { kind: 'unavailable', message: 'Feedback is unavailable; the lesson remains available.' };
  }
}
