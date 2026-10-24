# Test plan and results

Commands (all run from `codeorbit/`): `npm run typecheck` · `npm run lint` · `npm test` · `npm run build`.

## Automated (Vitest, jsdom) — 8 files
| File | Covers |
|---|---|
| `curriculum.test.ts` | stable unique IDs/order; prerequisite edges valid, acyclic, not a chain; every topic has lesson/quiz/challenge; quiz shape; previews have no topics |
| `orbit.geometry.test.ts` | upper arch (apex mid, ends lower, monotone), symmetric, deterministic, in-bounds at 9 widths, even arc spacing, mode selection (desktop `arch`, phones `carousel`), mode monotone in width, no label collisions in `arch`, edge paths |
| `validators.test.ts` | every challenge: solution passes, starter fails, empty input safe; partial/edge cases per challenge; invalid selector safe; determinism |
| `quiz.test.ts` | select/check/skip/finish/retry/navigation/score/pass/perfect; session sanitising |
| `storage.test.ts` | save/load round-trip, invalid JSON, non-object JSON, newer version, v0 migration, partial repair, unavailable storage, quota failure, clear |
| `progress.test.ts` | status rules, best score, mastery vs solution reveal, sticky completion, recommendations, hints, drafts, notes, bookmarks, error dedupe, reset |
| `preview.test.tsx` | `sandbox=""`, no allow-scripts/allow-same-origin, learner markup absent from parent DOM, CSP before content, source scan for innerHTML/dangerouslySetInnerHTML/document.write |
| `app.test.tsx` | first-run, previews, Orbit render/sync/keyboard/stable positions/edges/carousel/restore, lesson notes+bookmark persistence, full quiz + resume, practice run/check/hints/solution/focus/reset/mobile tabs, progress & review empty/populated, corrupt/unavailable storage, a11y landmarks |

## Browser (headless Chromium via puppeteer-core, production build, web security ON)
Scripts live outside the repo (`/home/claude/browser/*.mjs`, not shipped). 41 checks covering: first run; arch apex/ends/order/touch size; strip⇄arch sync incl. first & last; no jitter on strip scroll; keyboard; lesson note persistence; quiz feedback; **sandbox attack** (script, `onerror`, form, popup link) — parent title/window untouched, script not executed in frame, `SecurityError` reading frame from parent, browser console confirms script + remote-image blocks; incomplete check; hints; confirmed solution reveal; focus mode in/out with draft intact; completion + reload + Resume; reduced motion; focus ring; mobile carousel/tap/tabs. Run 4× for stability. Page-level horizontal overflow checked on 8 routes × 6 viewports (1440, 1280, 1024, 768, 390, 360): none.

## Not done / limits
- Visual inspection was via screenshots of the main routes (1440, 390 and 768 Orbit; 1440 Practice and Home reviewed by eye). Other screenshots were generated but not each individually reviewed.
- No real touch-device or screen-reader testing; no cross-browser testing (Chromium only).
- No automated colour-contrast tool run; contrast values in `DESIGN.md` are calculated by hand.
