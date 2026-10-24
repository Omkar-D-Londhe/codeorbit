# CodeOrbit — Assessment Compliance Matrix

**Status:** PENDING REVIEW — no assessment requirement has been
verified yet.

## Purpose and rules

This document maps every mandatory concept from the original Frontend
Design and Testing Lab assessment documents to a CodeOrbit feature,
source file, and verification evidence.

Hard rules:

- **Do not invent assessment questions.** Every row must derive from
  the actual original assignment wording, not from assumption.
- **Do not claim compliance has been verified** until a human has
  checked the row against the original document and evidence exists.
- The original assessment PDFs are **not currently in this
  workspace**; until they are supplied and read, every mapping below
  is a hypothesis drawn from the blueprint's planning table (§19), not
  a verified requirement.
- If the professor explicitly requires a particular library or
  framework, that requirement overrides the proposed stack (see
  `docs/DECISIONS.md` D-002).

Status values: `pending-review` · `in-progress` · `verified` ·
`not-required`.

## Review queue — source documents

| # | Source document | In workspace? | Reviewed? | Notes |
|---|-----------------|---------------|-----------|-------|
| S-1 | Frontend Design Lab assessment (PDF) | ❌ No | ❌ No | Referenced by blueprint §19; must be supplied. Screenshots in the PDF mean text extraction alone is insufficient — all visible pages must be inspected. |
| S-2 | Testing Lab assessment (PDF) | ❌ No | ❌ No | Same as above. |

## Candidate concept areas (unverified)

The rows below come from the blueprint §19 planning table. **Each is a
candidate mapping only.** Fill "Assessment reference" from the original
documents before treating any row as a requirement.

| ID | Candidate concept area (from blueprint) | Proposed CodeOrbit mapping | Assessment reference | Relevant files (after implementation) | Verification method | Status |
|----|------------------------------------------|----------------------------|----------------------|----------------------------------------|---------------------|--------|
| C-01 | HTML document structure and semantic elements | Shared page shell; lesson content; challenge examples | *pending — not an actual question yet* | pending | pending | pending-review |
| C-02 | Headings, paragraphs, lists, links, images | Curriculum lessons and live examples | *pending — not an actual question yet* | pending | pending | pending-review |
| C-03 | Tables and structured data | Lesson examples and data-oriented challenges | *pending — not an actual question yet* | pending | pending | pending-review |
| C-04 | CSS selectors, properties, spacing, borders, colours, typography | Full custom design system and responsive components | *pending — not an actual question yet* | pending | pending | pending-review |
| C-05 | Layout and positioning | Dashboard, stable upward-opening celestial Learning Orbit (topic strip + arc), split-screen workspace, focus mode, mastery map, cards | *pending — not an actual question yet* | pending | pending | pending-review |
| C-06 | Flexbox/grid or required layout techniques | Responsive application shell and page layouts | *pending — not an actual question yet* | pending | pending | pending-review |
| C-07 | Forms and form controls | Search, notes, preferences, quiz forms, practice inputs | *pending — not an actual question yet* | pending | pending | pending-review |
| C-08 | Validation and feedback | Quiz validation, input validation, challenge requirement checker | *pending — not an actual question yet* | pending | pending | pending-review |
| C-09 | JavaScript event handling | Topic selection; bidirectional strip/map range synchronisation; tabs; editor actions; buttons | *pending — not an actual question yet* | pending | pending | pending-review |
| C-10 | DOM or dynamic rendering | Live preview, quiz results, topic content, progress UI | *pending — not an actual question yet* | pending | pending | pending-review |
| C-11 | Conditional behaviour | Hints, completion states, recommendations, filters | *pending — not an actual question yet* | pending | pending | pending-review |
| C-12 | Arrays and objects / structured data | Technology, topic, lesson, quiz, challenge definitions | *pending — not an actual question yet* | pending | pending | pending-review |
| C-13 | Reusable functions and components | React components and shared utilities | *pending — not an actual question yet* | pending | pending | pending-review |
| C-14 | Browser persistence | Resume, drafts, notes, bookmarks, settings, progress | *pending — not an actual question yet* | pending | pending | pending-review |
| C-15 | Keyboard interaction | Shortcuts, accessible controls, topic navigation | *pending — not an actual question yet* | pending | pending | pending-review |
| C-16 | Animation and transitions | Stable Orbit selection/pan and edge-fade transitions; restrained star-to-star interaction feedback; cards and progress feedback; reduced-motion equivalents | *pending — not an actual question yet* | pending | pending | pending-review |
| C-17 | Responsive design | Desktop/tablet arc; compact mobile constellation where legible; carousel fallback preserving order/state; split-screen to mobile tabs/stack | *pending — not an actual question yet* | pending | pending | pending-review |

## Documentation alignment note (2026-10-22)

The blueprint and design handoff have been expanded with detailed celestial Learning Orbit requirements. The proposed mappings in C-05, C-09, C-16, and C-17 reflect that current product baseline, but **their assessment status remains `pending-review`**. This wording is not evidence that any such feature is required by the professor, nor that it has been implemented. Claude/user must compare every row against the actual original assignment files and add/remove rows according to the real rubric. The two original source documents remain outstanding in this workspace at the time of this update.

## How to complete a row (for whoever reviews the originals)

1. Open the original assessment document and locate the exact
   question/section wording, including any requirements visible only
   in screenshots.
2. Replace the "Assessment reference" placeholder with the file name
   and question number/section, quoted precisely.
3. If the assessment mandates a specific library or framework, record
   the conflict in `docs/DECISIONS.md` and update the proposed stack.
4. Only mark `verified` when a working feature exists, its evidence
   (test, screenshot, or demo step) is recorded, and a human has
   confirmed the match.
5. Add new rows for any mandatory concept missing from the table
   above; the blueprint's list is explicitly not exhaustive.

## Summary

- Total rows: 17 candidate concept areas
- Verified: 0
- Pending review: 17
- Source documents outstanding: 2
