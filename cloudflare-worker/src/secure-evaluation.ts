const encoder = new TextEncoder();

async function digest(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

async function constantTimeEqual(left: string, right: string): Promise<boolean> {
  const [leftDigest, rightDigest] = await Promise.all([digest(left), digest(right)]);
  let mismatch = left.length === right.length ? 0 : 1;
  for (let index = 0; index < leftDigest.length; index += 1) mismatch |= leftDigest[index] ^ rightDigest[index];
  return mismatch === 0;
}

export async function evaluationDiagnosticsAuthorized(
  request: Request,
  env: { EVALUATION_DIAGNOSTICS_ENABLED?: string; EVALUATION_DIAGNOSTICS_TOKEN?: string },
): Promise<boolean> {
  const configured = env.EVALUATION_DIAGNOSTICS_TOKEN ?? '';
  const supplied = request.headers.get('X-Evaluation-Diagnostics-Token') ?? '';
  if (env.EVALUATION_DIAGNOSTICS_ENABLED !== 'true') return false;
  if (request.headers.get('X-Evaluation-Run') !== 'synthetic-live') return false;
  if (configured.length < 32 || supplied.length < 32) return false;
  return constantTimeEqual(supplied, configured);
}
