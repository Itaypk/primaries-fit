# primaries.fit — data model proposal

> Status: **implemented.** Structural data lives in
> [`src/data`](../src/data) ([`parameters.json`](../src/data/parameters.json),
> [`candidates.json`](../src/data/candidates.json),
> [`questionnaire.json`](../src/data/questionnaire.json)); display text lives in
> per-locale catalogs [`src/locales`](../src/locales). The engine —
> [`types.ts`](../src/engine/types.ts), the swappable metric
> [`metric.ts`](../src/engine/metric.ts), [`voter.ts`](../src/engine/voter.ts),
> [`score.ts`](../src/engine/score.ts), and post-ranking
> [`postRank.ts`](../src/engine/postRank.ts) — reproduces the Claude Design
> prototype's rankings exactly (verified).

## Goal

A **decision engine** that ranks primaries candidates by closeness to a voter's
stated preferences, transparently (every score is explainable), and flexibly
enough to grow — more parameters, reworded questions, new candidates, and
non-ranking preferences ("balance the list by gender", "shuffle everyone close
enough") — without rewrites.

## The core idea: one shared coordinate system

Voters, candidates, and questions are three different things, so we give them
**one shared vocabulary** — a set of **parameters** (the "issue space"). Then:

- A **candidate** is a *position vector* over the parameters.
- A **voter** is reduced (by answering questions) to a *position vector* + an
  *importance vector* over the same parameters.
- A **question** is elicitation: it declares which parameter(s) its answer moves
  and by how much. Questions reference parameters; **they never reference
  candidates.**

```
            parameters  (the coordinate system)
             ▲        ▲
   defines   │        │   targets
  positions  │        │
        candidates   questions ──produce──▶ voter vector
                                                  │
                     rankCandidates(voter, candidates) ──▶ ranked list
                                                  │
                              post-ranking (filters / re-orderings)
```

### Why not the prototype's shape?

In the prototype, each candidate's stances are keyed **by question id**
(`st: { economy: 28, security: 48, ... }`) plus two loose attributes. That
couples the candidate database to the questionnaire: you cannot reword, split,
merge, or reorder a question without editing all five (eventually hundreds of)
candidate records. The parameter layer breaks that coupling — candidates are
keyed by **parameter id**, and the questionnaire is free to change.

## Parameters

Every parameter has one of three **kinds**, which is what makes a single vector
model absorb all four of the prototype's question styles:

| Kind      | Voter holds        | Candidate holds     | Agreement                     | Prototype origin        |
|-----------|--------------------|---------------------|-------------------------------|-------------------------|
| `scalar`  | value in `[0,1]`   | value in `[0,1]`    | `1 − |voter − candidate|`     | `axis` sliders + `bool` |
| `valence` | *(nothing)*        | value in `[0,1]`    | `candidate` (higher is better)| `honesty`, `experience` |
| `set`     | subset of options  | subset of options   | Jaccard `|∩| / |∪|`           | `champion` multi-select |

- **scalar** = "how close are we." Continuous axes and yes/no statements are the
  same thing — yes/no just snaps to the ends (0 / 1). Each has two labelled
  `poles` for display.
- **valence** = "more is universally better, weighted by how much I care." No
  voter position; the voter only sets *importance* via a rating question. These
  count for nothing until the voter opts in.
- **set** = "how much do our priorities overlap." Kept as one set-similarity
  parameter rather than exploded into per-topic binaries, which both preserves
  the prototype's maths and avoids inflating scores with 0-0 "agreements".

The strawman ships 10 parameters (7 scalar, 2 valence, 1 set) — a faithful
lift of the prototype's issue space. Finalising the real parameter list is the
next phase.

## Questions (the elicitation layer)

A question chooses a **widget** (presentation) and declares its **effect**:

- `slider` / `segmented` / `boolean` → write a **scalar position** via
  `targets: [{ parameter, weight? }]`.
- `multiselect` → write a **set** answer via `parameter`.
- `importance` → a 1–5 rating that sets the **importance weight** of one or more
  parameters via `importanceFor`. `rating → 0.5 + (rating−1)/4`, i.e. `[0.5,1.5]`.

### The "weight vector per parameter" you asked for

`targets` is a sparse map of parameter → weight, so **one answer can load onto
several parameters at once** — the requirement that questions carry a vector of
weights. Common case is a single target with weight 1. A negative weight inverts
the axis. When multiple questions load the same scalar parameter, the voter's
position is the weight-weighted mean and accumulated `|weight|` feeds importance.
v1 questions are all 1:1; the machinery is there for later nuance (e.g. one
statement that loads 0.7 on `judiciary_balance` and 0.3 on `ideology`).

## Scoring

Importance-weighted mean of per-parameter agreement, over answered parameters:

```
score = Σ wᵢ · agreementᵢ  /  Σ wᵢ        (wᵢ > 0, parameter answered)
```

Defaults: `scalar`/`set` importance = 1; `valence` importance = 0 until a rating
turns it on. Unanswered parameters are **skipped**, never counted as
disagreement. Output is `[0,1]`, shown as a percentage. See
[`src/engine`](../src/engine) — `buildVoterVector` → `rankCandidates`. The
distance maths is isolated in a swappable `ScoringStrategy`
([`metric.ts`](../src/engine/metric.ts)); the default is `weightedManhattan`.

## Post-ranking (out of ranking scope, by design)

Preferences that aren't about *closeness* — "equal number of men and women",
"show everyone close enough in random order" — run **after** ranking as pure,
composable steps: `(ranked, candidates) => ranked`. They reshape the list but
never touch the match maths, so the ranking stays explainable. `postRank.ts` ships
`shuffleAboveThreshold` as a worked example; gender balance etc. slot in the same
way (they'll read candidate metadata like `gender`, added to the `display`/meta
block, never to `positions`). Keeping these separate is what lets us add them
freely without disturbing the engine.

## Representation & storage

- **No backend.** Everything is static JSON loaded at startup: `parameters.json`,
  `candidates.json`, `questionnaire.json`, plus per-locale catalogs. It's
  read-only reference data, cache-friendly, diff-reviewable, and trivially
  hostable. A backend only becomes worthwhile if we later want server-side
  analytics or editor tooling — nothing in this model blocks that.
- **Localisation** uses the **catalog** model: structural data files carry ids
  only, and all text lives in `src/locales/<lang>.json`, resolved by convention
  (`param.<id>.label`, `question.<id>.title`, `candidate.<id>.name`, …). Adding a
  language is one new catalog file; the data never changes.
- **Normalisation:** everything is `[0,1]` internally (sliders emit `0..100` at
  the UI and are divided down). One range, one distance metric, no per-kind
  scale juggling.
- **Stability:** `id`s are the contract. Never reuse a parameter/option id for a
  new meaning; bump `questionnaire.version` when a change invalidates saved
  answers.

## What this unlocks for later phases

- Rewrite/reorder/add questions freely (they only reference parameters).
- Grow the candidate DB independently (keyed by parameters).
- Add parameters without touching existing candidates (missing = skipped).
- Add post-ranking preferences without touching the engine.
- Swap the distance metric in one place if we ever want weighted-Euclidean etc.

## Resolved decisions

1. **Distance metric** — weighted-Manhattan agreement (`1 − |Δ|`), kept for its
   legibility in the "why this match" breakdown, but placed **behind a swappable
   `ScoringStrategy`** ([`metric.ts`](../src/engine/metric.ts)) so we can iterate
   on it (weighted-Euclidean, asymmetric penalties, non-linear importance) without
   touching the pipeline or the UI.
2. **Valence baseline** — **opt-in only.** A valence trait counts for nothing
   until the voter rates its importance, because some voters actively prefer
   *less* of one (e.g. experience, when they want fresh ideas).
3. **Localisation** — **catalog** model (see Representation & storage above).
