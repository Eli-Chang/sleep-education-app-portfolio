# Curriculum structure

The repository ships **8 modules and 102 English screens**, each with a Spanish counterpart that has the same screen IDs, order, and types (`npm run validate:content` enforces this).

| # | ID | Module | Screens |
| --- | --- | --- | --- |
| 1 | `m1` | Intro to Sleep Apnea | 11 |
| 2 | `m2` | How Does Sleep Apnea Impact My Partner? | 10 |
| 3 | `m3` | OSA Outcomes and Motivation | 11 |
| 4 | `m4` | Sleep Apnea and Health of Your Pregnancy and Baby | 13 |
| 5 | `m5` | Healthy Sleep Hygiene, Part 1: Routine and Light | 13 |
| 6 | `m5b` | Healthy Sleep Hygiene, Part 2: Environment and Daily Habits | 20 |
| 7 | `m6` | Pregnancy Comorbidities and PAP | 14 |
| 8 | `m7` | Intimacy | 10 |

## The sleep-hygiene split

Healthy Sleep Hygiene used to be one 33-screen module. It is now two modules, divided where the flow moves from routine and timing to the bedroom and daily habits (Part 2 starts at screen `m5-06`). No screen was added, removed, reworded, or reordered; only the module boundary is new. The two new titles and descriptions, in English and Spanish, were written for this change and have not been reviewed by a clinician or a translator.

Saved progress is migrated (curriculum version 4 to 5, `src/state/curriculum-migration.ts`). Screen IDs are unchanged, so answers, attempts, reflections, and completed screens carry over. A finished single module marks both parts complete; otherwise a part is complete only when all of its screens are; a saved Part 2 position and the current module move to `m5b`. `tests/content-and-progress.test.ts` covers these cases.

## What is not here

A private research build of the app has two further modules about starting and troubleshooting PAP therapy. Their source material is not cleared for public release, so they are not in this repository and nothing here should be read as a ten-module curriculum. The public module count is 8.

## Review status

The lesson text is source-derived educational material. It has not been clinically validated here, and the Spanish text is drafted, not professionally translated. See [clinical-content-boundary.md](clinical-content-boundary.md).
