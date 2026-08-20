# Optional AI safety boundary

The AI companion is off by default and is not required to use the curriculum.

- The client sends requests only after an affirmative consent action.
- Provider credentials stay on the Worker; no provider key is bundled in the client.
- The client screens likely identifiers and bounds request size and rolling context.
- The Worker uses a fixed response policy and bounded lesson/evidence context.
- The assistant does not diagnose, prescribe, change medication or PAP settings, or provide emergency care.
- Users can revoke access; unavailable, unsafe, or unsupported requests use a non-AI fallback.
- Local development secrets belong in ignored `.dev.vars`; the committed example contains placeholders only.

These controls are engineering boundaries and testable contracts, not clinical validation.
