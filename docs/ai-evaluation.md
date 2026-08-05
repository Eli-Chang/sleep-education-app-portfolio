# AI Evaluation Plan

This public slice evaluates the request boundary rather than model quality:

1. No requester call occurs without explicit consent.
2. Empty or overlong learner input returns a local validation result.
3. A permitted request uses the bounded demonstration endpoint and minimum example payload.
4. A service failure returns a non-diagnostic local fallback.
5. Lesson access remains available after missing consent or service failure.

A real deployment would need an approved evaluation set, safety review, language review, refusal tests, latency checks, and human oversight. No model, credential, provider, or private evaluation data is included here.
