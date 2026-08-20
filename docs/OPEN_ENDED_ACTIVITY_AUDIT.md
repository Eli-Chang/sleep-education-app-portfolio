# Open-Ended Curriculum Activity Audit

This audit covers every authored English curriculum screen that asks the learner to write, explain, describe, organize, or plan in free text. A closed-choice reflection is not included because it does not create a free-text draft or an AI transmission path.

Current type meanings:

- A — educational/content or a closed-choice response; no free-text response is transmitted.
- B — local personal reflection; free text is saved on this device only.
- C — explicit Vela activity; free text is sent to Vela/AI only after consent and an explicit send action.

| Module | Screen ID | English title / prompt | Current type | Intended type | Textbox | Ask Vela | Transmission |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M1 Intro to Sleep Apnea | m1-ai1 | Explain it in your own words — In your own words, what happens during obstructive sleep apnea? | aiActivity stub; prompt only | C — teach-back with Vela | Required to ask; optional activity completion | Required | Vela/AI only after consent and explicit Send |
| M2 Partner Impact | m2-ai1 | Shared-sleep teach-back — Describe one way OSA could affect a partner and one way PAP might help. | aiActivity stub; prompt only | C — teach-back with Vela | Required to ask; optional activity completion | Required | Vela/AI only after consent and explicit Send |
| M3 Outcomes & Motivation | m3-ai1 | Describe a PAP barrier — What makes PAP hardest for you right now? | aiActivity stub; prompt only | C — barrier description with Vela | Required to ask; optional activity completion | Required | Vela/AI only after consent and explicit Send |
| M3 Outcomes & Motivation | m3-ai2 | Build a realistic next step — What is one PAP or sleep-related change you would like to make? | aiActivity stub; prompt only | C — action plan with Vela | Required to ask; optional activity completion | Required | Vela/AI only after consent and explicit Send |
| M4 Pregnancy & Baby | m4-ai1 | Association teach-back — Explain the difference between an association and a guarantee. | aiActivity stub; prompt only | C — teach-back with Vela | Required to ask; optional activity completion | Required | Vela/AI only after consent and explicit Send |
| M4 Pregnancy & Baby | m4-ai2 | Prepare a care-team question — What would you like to understand better about sleep apnea and pregnancy? | aiActivity stub; prompt only | C — question organizer with Vela | Required to ask; optional activity completion | Required | Vela/AI only after consent and explicit Send |
| M5 Sleep Hygiene | m5-ai1 | Build a bedtime timeline — What usually happens during the hour before you try to sleep? | aiActivity stub; prompt only | C — timeline activity with Vela | Required to ask; optional activity completion | Required | Vela/AI only after consent and explicit Send |
| M5 Sleep Hygiene | m5-ai2 | Make one sleep-habit plan — Choose one sleep habit you would like to work on. | aiActivity stub; prompt only | C — action plan with Vela | Required to ask; optional activity completion | Required | Vela/AI only after consent and explicit Send |
| M5 Sleep Hygiene | m5-ai3 | Sleep-hygiene teach-back — Why is sleep hygiene helpful but not a treatment for every sleep problem? | aiActivity stub; prompt only | C — teach-back with Vela | Required to ask; optional activity completion | Required | Vela/AI only after consent and explicit Send |
| M6 PAP Barriers | m6-ai1 | Describe a PAP barrier — Describe what happens when PAP becomes difficult to use. | aiActivity stub; prompt only | C — barrier description with Vela | Required to ask; optional activity completion | Required | Vela/AI only after consent and explicit Send |
| M6 PAP Barriers | m6-ai2 | Build a discussion summary — What would you like your PAP or healthcare team to understand about this problem? | aiActivity stub; prompt only | C — question organizer with Vela | Required to ask; optional activity completion | Required | Vela/AI only after consent and explicit Send |
| M7 Intimacy | m7-ai1 | Organize an optional question — Write a question you may want to ask a healthcare professional. | aiActivity stub; prompt only | C — optional question organizer with Vela | Optional response; required to ask if used | Required if used | Vela/AI only after consent and explicit Send |

Implementation decision:

- All twelve `aiActivity` screens are type C. Their lesson card now has a multiline textbox, privacy/send explanation, and a primary `Ask Vela` / `Preguntar a Vela` action. The action hands the draft to the existing Vela conversation surface; consent is shown before any request, and the chat composer preserves the draft through offline or request errors.
- No production English `type: 'reflection'` free-text screens are currently authored. The existing `m1-r1`, `m2-r1`, and `m7-r1` screens are closed-choice reflections and remain local, ungraded responses. They have no `Ask Vela` CTA and do not inject their saved response into ordinary Vela chat.
- Ordinary content, knowledge checks, and closed-choice reflections remain type A. The global Vela launcher is available independently and does not auto-submit or auto-inject lesson responses.
