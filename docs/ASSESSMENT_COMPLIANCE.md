# Assessment compliance — evidence-based status

**Nothing in this file is marked verified.** The original assessment *requirement* documents were not supplied.

## Source review
| # | Source | In workspace? | Reviewed? | Finding |
|---|---|---|---|---|
| S-1 | Frontend Design Lab assessment (question sheet) | ❌ | — | Not provided. |
| S-2 | Testing Lab assessment (question sheet) | ❌ | — | Not provided. |
| S-3 | `now.zip` → 41 PDFs `24MIC0135_FE_Lab_Assess_*` / `Frontend Lab *` (course **CSI3029 Front End Design and Testing (Lab)**) | ✅ | Partially (OCR of cover pages) | These are **completed lab submissions** (name, reg. no., screenshots of results), not requirement text. They are image-only PDFs; OCR cover text confirms the course code and that submissions are screenshots of working pages (e.g. Assessment 29 shows a mouse-event box). They contain no marking criteria, so they cannot verify any requirement. |

**Blocker recorded:** without S-1/S-2, no assessment row can be verified. Unaffected work continued. Please supply the question sheets (or confirm which required techniques/libraries apply) to complete this matrix.

## Candidate mapping (hypotheses — status `pending-review`)
| Concept (blueprint §19) | Where CodeOrbit demonstrates it | Implementation evidence |
|---|---|---|
| Semantic HTML structure | Shell, pages (`Shell.tsx`, landmarks, headings) | `app.test.tsx` “skip link, landmarks and a single h1” |
| Forms, validation, feedback | Quiz, notes, editor, challenge checker | `quiz.test.ts`, `validators.test.ts` |
| Event handling / DOM rendering | Orbit selection sync, tabs, editor actions, live preview | `app.test.tsx` Orbit + practice suites; `e2e` browser run |
| Layout & responsive design | Grid/flex shell, orbit modes, split → tabs | screenshots at 1440/1280/1024/768/390/360; geometry tests |
| Persistence | Versioned localStorage, resume | `storage.test.ts`, reload tests |
| Keyboard interaction | Roving tabindex, arrows/Home/End | `app.test.tsx` keyboard test; browser run |
| Animation/transitions | Short, interaction-driven; reduced-motion | CSS + browser check |
| Testing (Testing Lab) | Unit + component + browser journey | `docs/TEST_PLAN.md` |
All rows: **pending-review** (requires original wording).
