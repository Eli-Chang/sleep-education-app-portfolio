# Verification record

Run on 2026-11-01 on Windows 11, Node.js 24, desktop Chrome, against the commit that contains this file's parent change.

| Check | Command | Result |
| --- | --- | --- |
| Content structure and EN/ES parity | `npm run validate:content` | Passed: 8 modules, 102 screens, matching English/Spanish IDs |
| Unit and contract tests | `npm test` | 47 tests: 45 passed, 0 failed, 2 skipped (live AI smoke tests that need a configured Worker URL) |
| TypeScript | `npm run typecheck` | No errors |
| Worker | `cd cloudflare-worker && npm run check` | Typecheck clean; 5 files, 225 tests passed |
| Browser tests | `npm run test:e2e` | 23 passed. Includes click-through completion of all 8 modules in English and in Spanish, the sleep-hygiene progress migration, reduced-motion deep links, narration behavior (voice, language, stop on leave/complete/language change, missing voice), reflection contract, and Spanish translated-title parity |
| Accessibility audit | `npm run audit:a11y` | 36 route/width/language combinations (320 and 390 px, EN and ES), 344 interactive elements: 0 unnamed, 0 under 44 px, 0 horizontal overflow |
| Secret scan | `gitleaks dir .` | No leaks found |
| Dependency audit | `npm audit --omit=dev` | 44 advisories (1 critical, 13 high), all in transitive Expo tooling packages. Dependencies were not changed in this update and the advisories are not resolved |

## Not verified

Screen-reader use by a person, physical iOS/Android devices, audible Spanish narration, native narration, clinical accuracy, translation quality, and the optional AI companion against a live provider.

## Known quirk

React Native Web logs a deprecation warning ("props.pointerEvents is deprecated") during the browser tests. It does not affect behavior.
