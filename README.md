# Sleep Education App

An AI-assisted, bilingual Expo learning experience for sleep-health education.

This public portfolio repository is the recruiter-facing slice of a larger product workflow. It shows how I directed requirements, curriculum structure, privacy boundaries, consent flows, state handling, evaluation criteria, and acceptance checks while using AI coding tools for implementation. I reviewed the generated technical output, corrected defects, and validated the finished behavior; this is not a claim that every line was written unaided.

## What is here

- 7 structured learning modules with 102 English curriculum screens mirrored to Spanish.
- Offline-first local progress, quiz and reflection state, narration controls, and responsive Expo web/mobile UI.
- A deliberately bounded optional AI lesson companion routed through a protected Cloudflare Worker.
- Explicit affirmative consent, reversible AI access, bounded conversation context, identifier screening, safe fallback behavior, and no client-side provider key.
- Deterministic tests for content parity, question quality, progress behavior, privacy boundaries, human-voice checks, and safety contracts.
- Synthetic safety fixtures and public-safe evidence fixtures for the Worker; no patient records, PHI, learner accounts, or private telemetry.

## Recruiter quick start

```text
npm install
npm run validate:content
npm test
npm run typecheck
npm run web
```

The optional Worker has its own README and check command:

```text
cd cloudflare-worker
npm install
npm run check
```

The default app runs without an AI provider. Local AI development requires a locally created `.dev.vars` file; never commit provider keys or deployment credentials.

## Product and safety boundary

The app presents general educational material and is not a diagnostic tool, treatment planner, clinical decision support system, or substitute for a healthcare professional. It does not collect patient identifiers, medical records, or free-text symptom histories. The AI companion cannot diagnose, prescribe, change medication or PAP settings, or replace urgent care. Users can revoke AI access from settings, and unsupported or unsafe requests fall back to a non-AI guidance path.

The curriculum is source-derived educational content. It has not been presented here as clinical validation, professional translation, patient outcomes, or deployment evidence. Clinical and translation review remain required before real-world use.

## Public asset policy

Only assets with a clear public-domain or documented Creative Commons attribution are included. Source-derived images with unresolved reuse permissions were withheld from this repository even when the lesson text references the topic. See [docs/image-sources.md](docs/image-sources.md).

## Evidence and verification

- `npm run validate:content` checks module/screen counts and English/Spanish ID parity.
- `npm test` covers deterministic product and safety contracts.
- `npm run typecheck` checks the Expo TypeScript surface.
- `cloudflare-worker/npm run check` runs Worker typecheck plus its deterministic tests.
- `screenshots/` contains representative local QA captures; they are demonstrations, not user or patient data.

## License

The source code is released under the MIT License. Third-party assets retain their own licenses and attributions. See [LICENSE](LICENSE) and [docs/image-sources.md](docs/image-sources.md).
