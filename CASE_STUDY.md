# Case Study: Sleep Education App Portfolio

## Problem

People learning about obstructive sleep apnea and PAP therapy may need short, clear, bilingual information that remains usable across device constraints and intermittent connectivity. A public portfolio also needs a strict boundary between software demonstration and clinical guidance.

The product-domain scope is OSA/PAP education design, while this public checkout uses a deliberately generic sleep-planning lesson. The lesson demonstrates navigation, parity, consent, teach-back, and fallback behavior; it does not provide OSA/PAP instructions.

## Intended user need

The demonstration models a learner moving through concise educational screens, checking understanding, saving progress, optionally preparing a teach-back response, and receiving a local fallback when network support is unavailable.

## Constraints

- All lesson text and interface copy had to be newly written, synthetic, medically conservative, and clearly labeled as demonstration content.
- The edition must not include patient data, research data, clinical records, private source documents, institutional identity, or unclear-rights assets.
- The public project must be organization-neutral and make no affiliation or endorsement claim.
- AI support must be opt-in and must not make a request before consent.
- English and Spanish content must preserve matching stable identifiers.
- The implementation must be small enough to run deterministically from a clean checkout.

## My responsibilities

For this portfolio edition, I independently implemented the domain contracts, synthetic bilingual content, progress and navigation logic, narration contract, knowledge-check behavior, consent-gated teach-back boundary, fallback handling, tests, and demonstration UI. I do not claim to have created or clinically validated any material outside this public edition.

## Product requirements

1. Learners can navigate a small bundled demonstration lesson without an account or network.
2. English and Spanish versions retain matching module and screen identifiers.
3. A knowledge check returns a deterministic demonstration result.
4. Progress can be serialized and restored locally by an adapter outside this slice.
5. A narration cue can be passed to a platform speech adapter.
6. Teach-back support is optional, bounded, and consent-gated.
7. Failure or missing consent preserves lesson access through a local fallback.
8. Every lesson screen is marked synthetic and states that it is not clinical guidance.

## Technical architecture

The public edition is a platform-neutral TypeScript reference implementation. Bundled content feeds navigation and validation. Progress transitions are immutable and have explicit serialization/restoration contracts. Narration is represented by a small adapter-ready cue. Knowledge checks are evaluated locally. The teach-back boundary accepts an injected request function only after consent and applies input limits before delegation.

## AI teach-back design

The boundary demonstrates a safe request sequence: check consent, trim and bound learner text, call a narrowly named endpoint through an injected requester, and return a non-diagnostic fallback when the request fails. The tests use a request spy and do not contact a network.

## Consent and privacy controls

The no-consent path returns `consent_required` without invoking the requester. The repository contains no account system, analytics, credentials, health records, remote lesson service, or user identifiers. These are demonstration controls, not a production privacy certification.

## Bilingual feature-parity testing

The validator checks nonempty English and Spanish modules, matching module identifiers, matching ordered screen identifiers, locale markers, synthetic markers, and the exact locale-specific demonstration notice on every screen. Automated parity does not replace professional translation review.

## Accessibility

The content and UI preview use short headings, readable contrast, explicit status text, and a responsive layout. A production implementation would add screen-reader labels, dynamic type, focus order, touch-target checks, reduced-motion handling, and device-level accessibility testing.

## Testing and failure states

Tests cover parity failures, missing notices, immutable progress, duplicate-safe completion percentages, navigation, progress restoration, narration cues, knowledge-check results, consent rejection, bounded input, successful injected delegation, and service failure fallback.

## Design iterations

The public design was reduced to a neutral visual system with a compact module card, progress state, optional-support boundary, and explicit demonstration notice. The iteration focused on making the safety boundary and synthetic status visible at a glance.

## Tradeoffs

The small scope omits a full native shell and real content review pipeline, but it makes the software contracts easy to inspect and keeps the public tree free of sensitive or unclear-rights material. A static screenshot is less interactive than a full app, but it is deterministic and safe to review.

## Limitations

This repository does not claim clinical effectiveness, patient use, deployment, institutional review, real-world outcomes, medical advice, or production readiness. Professional translation, accessibility, clinical, security, and asset review would be required for any real healthcare product.

## What I learned

Privacy and consent are product requirements, not documentation afterthoughts. Bilingual parity is a testable invariant, synthetic labeling belongs in the data model, and a small explicit failure path can communicate more reliably than a broad unverified feature claim.

## What I would improve next

I would add a public-safe native shell, device-level accessibility and visual regression tests, a reviewed translation workflow, and a documented dependency and asset-attribution process while preserving the organization-neutral boundary.
