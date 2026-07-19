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
