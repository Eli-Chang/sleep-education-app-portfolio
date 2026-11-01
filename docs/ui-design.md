# Interface design

The interface was redesigned in October 2026 as a presentation-only change. Lesson text, answer keys, progress logic, the AI boundary, and the Worker were not edited for visual reasons.

## Direction

- **Reading surface first.** Warm, low-glare paper (`#F4F0E8`) with near-black ink for lesson text. Diagrams sit in white media bands instead of bright blocks on a dark page.
- **Night-to-dawn identity, used sparingly.** The home and module screens open with a deep indigo header with a faint star field (`src/components/NightSky.tsx`, decorative and hidden from assistive technology). One warm dawn accent marks the learner's current place.
- **Type.** Newsreader for headings and Atkinson Hyperlegible Next for body text and controls. Atkinson Hyperlegible Next was designed for low-vision legibility. Both fonts are SIL OFL 1.1; the license texts are in `assets/fonts/`.
- **Learning path.** The home screen lists modules as a numbered path with an icon and a text label for each status, plus per-module progress.
- **Thumb-reachable controls.** Previous and Next sit in a fixed bottom bar, Listen sits in the top bar, and lesson progress is one segment per step.
- **Language switch on the home screen.** An English/Español pill switches language without a trip to Settings. It stops narration first, the same as the Settings control.

## Accessibility measures

- Status is never color-only. Results and module states use an icon and a text label.
- Visible focus ring on every control (3 px, with a light variant on the night header).
- Touch targets are at least 44 px. `scripts/audit-ui-a11y.mjs` checks target size, accessible names, horizontal overflow, and keyboard focus at 320 px and 390 px widths in both languages.
- Reduced motion is honored for press feedback, lesson transitions, and the completion reveal, from either the system setting or the in-app switch.
- Contrast of the main token pairs is asserted in `tests/ui-contracts.test.ts` (for example ink on paper is about 14:1, muted text on paper about 5.4:1).

## What this does not show

These checks are automated and desktop-browser based. No screen-reader session with a person who uses one, no physical-device test, and no usability study with real learners has been done.

## Regenerating screenshots

With `npm run web` serving on port 19009 (the Playwright default), run `node scripts/capture-screenshots.mjs`. Progress shown in the images is a synthetic seed written to `localStorage` by the script.
