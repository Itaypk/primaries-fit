# Roadmap

Where primaries.fit has been and where it's going. This is a living document —
update it as phases complete or priorities shift.

## ✅ Phase 1 — Data model (done)

Decided on the vector-space model: one shared parameter space that decouples
voters, candidates, and questions. Three parameter kinds (`scalar`, `valence`,
`set`), importance-weighted agreement scoring, and a post-ranking stage for
non-ranking preferences. Verified it reproduces the original prototype exactly.
See [`data-model.md`](data-model.md).

## ✅ Phase 2 — Production-grade scaffold (done)

Turned the Claude Design prototype into a maintainable app:

- Vite + React + TypeScript, component breakdown, ESLint, GitHub Actions CI.
- Engine extracted to `src/engine` with a swappable `ScoringStrategy`.
- Structural data (`src/data`) separated from per-locale text catalogs
  (`src/locales`); Hebrew + English, RTL/LTR aware.
- Post-ranking scaffolding (`postRank.ts`) with a worked example.

Everything to date is **placeholder content** mirroring the prototype's five
sample candidates and eleven demo questions.

## ▶ Phase 3 — Real content (next)

Replace placeholders with the actual model of the הדמוקרטים primary. This is the
current priority.

1. **Finalize the parameters.** Decide the real issue space — which axes,
   which valence traits, which flagship-issue set — and word the poles/labels
   carefully. This is a product + domain decision; the schema already supports it.
2. **Author the questionnaire.** Write the real questions that elicit voter
   positions and importance, mapped onto the finalized parameters. Consider
   question count vs. drop-off (the UI advertises "~3 min").
3. **Build the candidate database.** Encode each real candidate as a position
   vector, sourced from https://democrats.org.il/candidates/ and public record.
   Needs a defensible, documented methodology for placing candidates on each
   axis (positions are claims about real people — sourcing and transparency
   matter).

**Open questions to resolve during Phase 3:**
- How are candidate positions sourced and justified? (public statements, voting
  records, questionnaires to candidates?) Document the methodology.
- Do we need per-parameter confidence, or citations surfaced in the breakdown?
- Neutral wording review of questions and pole labels.

## ▶ Phase 4 — Generalize to many primaries

Turn the single-event app into a platform that hosts many primaries (current and
past) while keeping one engine and one additive schema. Full brief, contracts,
and phasing in [`multi-event.md`](multi-event.md): each primary becomes a
self-contained **event** (own parameters, questionnaire, candidates, evidence,
metadata, results), lazily loaded; client-side routing enables event selection
and past-primary deep-links; a build-time data validator and an in-app review
mode raise data quality; plus a Q&A / FAQ surface. No backend.

## Backlog — post-ranking preferences

Out of ranking scope by design; each is a pure `postRank.ts` step (see
[`data-model.md`](data-model.md)).

- **Composition balance** — e.g. "an equal number of men and women." Requires
  candidate metadata (gender, etc.) on the `display`/meta block, never in
  `positions`.
- **Intuition mode** — "show everyone close enough to my worldview, in random
  order." `shuffleAboveThreshold` already exists; needs a UI entry point and a
  sensible threshold.

## Backlog — platform & UX

- **Result persistence / sharing** — encode answers in a URL so results are
  shareable and resumable (no backend needed).
- **Testing** — wire a unit-test runner (e.g. Vitest) for the engine, and a
  headless end-to-end smoke test in CI. The engine is pure and highly testable.
- **Accessibility** — keyboard nav, focus states, ARIA on the custom widgets,
  colour-contrast pass; the current styles are ported verbatim from a visual mock.
- **Deployment** — static hosting + a deploy workflow (the build is a static
  bundle).
- **Analytics / feedback** — optional, privacy-respecting; would be the first
  reason to introduce any backend.
- **More languages** — the catalog model makes this one file per language (e.g.
  Arabic, also RTL).

## Non-goals (for now)

- A backend / database. The model is deliberately static-JSON; revisit only if
  analytics or a candidate-data editor demands it.
- Changing the distance metric away from weighted-Manhattan — kept for
  legibility, but isolated behind `ScoringStrategy` if we ever want to.
