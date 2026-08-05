# Architecture

This organization-neutral portfolio edition is a platform-neutral TypeScript reference implementation for a bilingual healthcare-education interface.

```mermaid
flowchart TD
  Screen[Lesson screen] --> Module[Locale module]
  Module --> Validator[Parity and synthetic-content validator]
  Screen --> Navigation[Next-screen navigation]
  Screen --> Progress[Local progress contract]
  Screen --> Narration[Narration cue contract]
  Screen --> Check[Local knowledge check]
  Screen --> Consent{Explicit teach-back consent}
  Consent -- no --> Fallback[Offline-safe local fallback]
  Consent -- yes --> Boundary[Bounded injected requester]
  Boundary --> Endpoint[Optional server endpoint]
```

The public slice keeps content bundled, progress immutable, and optional network behavior behind an explicit consent boundary. Storage, speech, and server adapters are intentionally represented by small contracts so the core behavior remains deterministic and inspectable.
