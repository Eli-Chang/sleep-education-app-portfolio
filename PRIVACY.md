# Privacy and Safety

This public edition contains no patient data, research data, account data, analytics identifiers, credentials, contact records, or remote content.

The domain model stores only synthetic screen identifiers, module identifiers, language choice, and progress state. A production storage adapter is outside this reference slice and would require a separate privacy review.

Teach-back support is opt-in. Before consent, the client returns `consent_required` without invoking its injected requester. After consent, the boundary trims and limits demonstration text before delegation. Service failure returns a local non-diagnostic fallback and preserves lesson access.

This repository is educational software architecture, not medical advice or evidence of clinical effectiveness.
