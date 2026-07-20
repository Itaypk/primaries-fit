# CLAUDE.md

Guidance for coding agents working in this repository. Read this before making
changes.

## What this is

**primaries.fit** — a web-based decision engine that ranks primaries candidates
by how close they are to a voter's stated preferences, transparently (every
score is explainable). Current focus: Israel, the הדמוקרטים party
(https://democrats.org.il/candidates/).

The core idea is one shared **parameter space** ("issue space"): voters,
candidates, and questions all reference the same parameters. A voter answers a
short questionnaire, which reduces them to a position vector + an importance
vector; candidates are position vectors too; the engine ranks by
importance-weighted agreement. Full rationale: [`docs/data-model.md`](docs/data-model.md).
Where the project is headed: [`docs/roadmap.md`](docs/roadmap.md).

## Commands

```bash
npm install
npm run dev        # Vite dev server
npm run build      # tsc -b (typecheck) + vite build — this is the CI gate
npm run lint       # eslint (flat config)
npm run typecheck  # tsc -b --noEmit
```

CI (`.github/workflows/ci.yml`) runs **lint + build** on every PR. Keep both
green. There is no unit-test runner wired up yet (see roadmap); until there is,
verify engine changes by scoring against known data and, for UI changes, by
driving the built app in a headless browser (see "Verifying changes").

## Architecture

Three decoupled layers over the shared parameter space. **Never collapse them.**

```
src/
  engine/         # framework-agnostic scoring. No React, no JSON text.
    types.ts      # the data model (Parameter / Candidate / Question / vectors)
    metric.ts     # ScoringStrategy — the swappable distance layer
    voter.ts      # answers -> VoterVector (position + importance)
    score.ts      # VoterVector + candidates -> ranked CandidateScore[]
    postRank.ts   # optional post-ranking steps (out of match-maths scope)
  data/           # STRUCTURAL data only (ids, kinds, positions). No prose.
    parameters.json, candidates.json, questionnaire.json, index.ts
  locales/        # ALL display text, per language (he.json, en.json)
  i18n/           # catalog types + React provider/hook (useI18n)
  view/           # engine output -> display view-models (reasons, breakdown)
  components/      # AppFrame, Header, ProgressBar, questions/*
  screens/        # WelcomeScreen, QuizScreen, ResultsScreen, CandidateScreen
  App.tsx         # state machine (screen / qIndex / answers / selection)
  theme.ts        # accent palettes + presentation defaults
```

The original Claude Design prototype is preserved under `frontend/` as a visual
reference — do not build on it; the React app supersedes it.

## Conventions that matter

- **ids are the contract.** Parameters, options, questions, and candidates are
  joined by id across data files and locale catalogs. Never reuse an id for a new
  meaning. Bump `questionnaire.version` when a change invalidates saved answers.
- **Structure vs. text.** `src/data/*.json` carries ids/numbers only. Every
  human-readable string lives in `src/locales/*.json`, resolved *by convention*:
  `param.<id>.label`, `param.<id>.poleLow`/`poleHigh`, `option.<id>`,
  `question.<id>.title`/`statement`, `candidate.<id>.name`/`tagline`/`initial`.
  If you add a data id, add its strings to **every** locale file.
- **Three parameter kinds** carry all question styles:
  `scalar` (position, `1 − |Δ|`), `valence` (higher-is-better, candidate value),
  `set` (multi-select, Jaccard). A question's topic and hint are *derived*
  (topic = primary parameter's label; hint = per-widget), not stored.
- **Valence is opt-in.** Valence parameters (honesty, experience) count for
  nothing until the voter rates their importance — some voters want *less* of one.
  Don't give them a nonzero default importance.
- **Metric is swappable.** All distance maths lives in the `ScoringStrategy` in
  `metric.ts`. To change how agreement is measured, add/adjust a strategy there —
  do not scatter formulas into the pipeline or components.
- **Post-ranking never changes scores.** Filters/re-orderings (gender balance,
  "shuffle everyone close enough") go in `postRank.ts` as pure
  `(ranked, candidates) => ranked` steps, applied after scoring so the ranking
  stays explainable. Candidate metadata they read (e.g. gender) goes on the
  `display`/meta block, never in `positions`.
- **Styling.** Global rules + the custom range input live in `src/styles.css`;
  the rest is inline styles ported from the prototype to keep visual parity.
  Accent colours are CSS variables (`--accent`, `--accent-soft`, `--accent-ink`)
  set on the app frame. The app is bilingual and **RTL/LTR-aware** — direction
  comes from the locale; don't hard-code `left`/`right`.

## Common tasks

- **Add a parameter:** add `{ id, kind }` to `parameters.json`; add its position
  to every candidate in `candidates.json`; add `param.<id>.*` (and `option.<id>`
  for sets) to every locale; reference it from a question via `targets` /
  `parameter` / `importanceFor`.
- **Add / reword a question:** edit `questionnaire.json` (structure) and
  `question.<id>.*` in the locales (text). Questions only reference parameters,
  never candidates.
- **Add a candidate:** add positions keyed by parameter id + `display` colours to
  `candidates.json`; add `candidate.<id>.*` to every locale.
- **Add a language:** add one `src/locales/<code>.json`, register it in
  `src/i18n/index.tsx` (`catalogs`, `localeDir`, `LocaleCode`).

## Verifying changes

Engine changes must keep parity with intended behaviour — score against fixed
answer sets and check the ranking. For UI changes, `npm run build` then drive
the preview in headless Chromium (pre-installed at `/opt/pw-browsers`) through
welcome → quiz → results → candidate in both languages. Prefer the `/verify`
skill when available.

## Git workflow

Develop on a feature branch and open a PR; never commit straight to `main`. CI
must pass before merge. A merged PR is finished — start follow-up work from a
fresh branch off the latest `main`, don't reopen merged history.

**Merging to `main` deploys to production.** A GitHub Actions workflow
(`.github/workflows/deploy.yml`) ships every CI-green push to `main` straight
to primaries.fit within a minute or two — there is no staging environment and
no manual promotion step. See [`deploy/README.md`](deploy/README.md) for the
VPS/Caddy setup and release mechanics.
