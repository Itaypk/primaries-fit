# primaries.fit

A web-based decision engine that helps undecided voters find primaries
candidates closest to their own preferences — transparently, so every ranking
is explainable.

This phase focuses on Israel, on **הדמוקרטים** (a left-leaning party). Candidate
information: https://democrats.org.il/candidates/

## How it works

Voters, candidates, and questions all live in one shared **parameter space**.
A voter answers a short questionnaire, which reduces them to a position vector
and an importance vector; candidates are position vectors too; the engine ranks
candidates by importance-weighted agreement. See
[`docs/data-model.md`](docs/data-model.md) for the full model.

## Status

The **data model** and a **production-grade app scaffold** are in place, running
on placeholder content (the prototype's sample candidates and demo questions).
The next phase replaces placeholders with the real parameters, questionnaire,
and candidate database. See [`docs/roadmap.md`](docs/roadmap.md).

## Project map

```
src/engine/    scoring: types, swappable metric, voter/score, post-ranking
src/data/      structural data (ids, kinds, positions) — no prose
src/locales/   all display text, per language (he, en)
src/i18n/      catalog types + React provider/hook
src/view/      engine output -> display view-models
src/components/, src/screens/, src/App.tsx    the UI (state machine + screens)
docs/          data-model.md (the model), roadmap.md (what's next)
frontend/      original Claude Design prototype, kept for reference
```

Working in this repo as an agent? Start with [`CLAUDE.md`](CLAUDE.md).

## Tech

- **Vite + React + TypeScript**, no backend — all data is static JSON loaded at
  startup.
- **Structural data** in [`src/data`](src/data); all display text in per-locale
  catalogs in [`src/locales`](src/locales) (Hebrew + English, RTL/LTR aware).
- **Engine** in [`src/engine`](src/engine): the distance maths sits behind a
  swappable `ScoringStrategy` (`metric.ts`); post-ranking steps (e.g. shuffle,
  gender balance) live in `postRank.ts` and never touch the match maths.

## Develop

```bash
npm install
npm run dev        # start the dev server
npm run build      # typecheck + production build
npm run lint       # eslint
```

CI (`.github/workflows/ci.yml`) runs lint + build on every pull request.

## Design reference

The original hi-fi prototype from Claude Design is preserved under
[`frontend/`](frontend) for reference. The production app recreates it in React.
