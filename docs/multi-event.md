# primaries.fit — multi-event generalization

> Status: **in progress.** This document is the implementation brief for turning
> primaries.fit from a single, now-past race (the הדמוקרטים 2026 primary) into a
> reusable platform that hosts many primaries — current and past — while keeping
> **one engine and one schema**. It defines the requirements, the data contracts,
> and the delivery phases. It intentionally stops short of line-level design;
> each phase is scoped to be independently shippable and CI-green.
>
> **Progress:** Phases 0–5 shipped (guardrails; event unit + loader; routing +
> chooser; past-primary results & provenance; reviewer tooling; editorial pages
> + shareable results). Two follow-ups are tracked, not blocking: the optional
> `scripts/` authoring helpers (Phase 4, deferred until a data-entry workflow
> needs them) and **crawler-visible per-event link previews**, which need
> build-time prerendered OG shells — runtime OG tags ship now, the prerender step
> is noted in [`roadmap.md`](roadmap.md). Per-phase status is on each heading.
>
> Related: [`data-model.md`](data-model.md) (the vector-space model, unchanged),
> [`candidate-scoring.md`](candidate-scoring.md) (the evidence sidecar and
> sourcing methodology), [`roadmap.md`](roadmap.md).

## Why

The current app was built in a rush around one event, and that assumption is
**structural, not a config toggle**:

- [`src/data/index.ts`](../src/data/index.ts) exports flat singletons
  (`parameters`, `candidates`, `questionnaire`, `evidence`, `dataUpdated`)
  **bundled into the JS at build time**. [`Dataset`](../src/engine/types.ts)
  holds exactly one `questionnaire`.
- [`src/App.tsx`](../src/App.tsx) imports those singletons directly — there is
  no `eventId` anywhere in state, loading, or navigation.
- [`src/persistence.ts`](../src/persistence.ts) uses one fixed localStorage key
  (`"primaries-fit:progress"`), versioned only by `questionnaire.version`; two
  events would collide.
- **There is no routing at all** (only `react` + `react-dom`); no URL encodes an
  event, candidate, locale, or result.
- Event-specific copy is diffused into the shared locale catalogs
  ([`src/locales/*.json`](../src/locales) — `app.name`, `ui.*`) and hard-coded in
  [`index.html`](../index.html) (title, OG tags, canonical URL).
- Data quality is **unenforced**: JSON is `as`-cast to types with no runtime
  validation, no validator script, and no tests. The evidence sidecar
  ([`src/data/evidence.json`](../src/data/evidence.json)) and the manual
  methodology in [`candidate-scoring.md`](candidate-scoring.md) exist, but
  nothing verifies them.

## Goals

1. **An event is the atomic unit.** Each primary carries *all* its data —
   parameters, questionnaire, candidates, evidence, metadata, and (for past
   races) results — under its own id.
2. **Users can browse and take current *and* past primaries.** A past event is
   viewable, and its questionnaire remains answerable ("explore this race").
3. **One engine, one schema — forever.** No versioned engines and no parallel
   schema implementations. Schema evolution is **additive and backward
   compatible**; the engine already tolerates missing positions and unknown ids,
   and we lean on that instead of forking.
4. **Human reviewers get real tooling** to verify data correctness — an
   automated validator in CI plus an in-app review view.
5. **Editorial surface**: a Q&A / FAQ page and a fuller About.

The locale set (Hebrew + English, RTL/LTR) and the Israel focus **do not change**.

## Non-goals

- **No backend or database.** Data stays static JSON, hosted on the existing
  Caddy static host (see [`deploy/README.md`](../deploy/README.md)). A per-event
  fetch is still a static file request.
- **No parallel engine/schema versions.** `questionnaire.version` stays as the
  *saved-answer cache-buster within one event*, nothing more.
- **No metric change** — weighted-Manhattan stays, isolated behind
  `ScoringStrategy` in [`metric.ts`](../src/engine/metric.ts).

## Key decisions (settled)

| Decision | Choice | Rationale |
|---|---|---|
| Data delivery | **Lazy per-event fetch** — each event is a folder of static JSON, loaded on demand | The archive of past primaries must not bloat the initial bundle; still no backend |
| Navigation | **Introduce client-side routing now** | Foundation for event selection, past-primary deep-links, SEO, and shareable results |
| Reviewer tooling | **Build-time validator (CI gate) + in-app review mode** | Automated checks catch a class of errors; the review view supports human judgement |

---

## The one rule that keeps this sane: additive schema, single engine

Every schema change **must** be backward compatible so that a single engine
build can score every event — old and new — without branching on a version:

- **Missing positions are already skipped**, never counted against a candidate
  ([`score.ts`](../src/engine/score.ts)); a new parameter simply doesn't score
  for events that predate it.
- **Unknown ids are already silently ignored** in
  [`voter.ts`](../src/engine/voter.ts); an event referencing a parameter another
  event lacks is a non-issue because ids are event-scoped.
- New fields are **optional**. If the engine ever needs to distinguish "absent"
  from "zero", add explicit empty-value handling in the engine — do **not**
  introduce a second scoring path.

Reviewer checklist for any future schema PR: *is this additive? does an event
that omits the new field still score correctly? did I avoid a version branch in
the engine?*

---

## Contracts

### The `Event` type (extends, does not replace, `Dataset`)

`Dataset` already bundles `parameters` + `candidates` + `questionnaire`. We wrap
it with metadata and optional results. Text is resolved by id from locale
catalogs exactly as today.

```ts
// src/engine/types.ts (additions)

type EventStatus = "upcoming" | "open" | "past";

interface EventMeta {
  id: string;               // globally unique event id, e.g. "hademokratim-2026"
  party: string;            // party id; display label lives in locales
  date: string;             // primary date, ISO (YYYY-MM-DD)
  status: EventStatus;
  dataUpdated: string;      // ISO date positions were last researched (was meta.json)
  methodology?: string;     // id resolved to locale prose, or an external URL
}

// Present only for past events. `raw` and `final` are deliberately distinct:
// the seated outcome is not vote-order alone — reserved seats, regional/minority
// quotas, and coalition agreements reshape it. Keeping both is what makes the
// result explainable.
interface EventResults {
  raw?:   Array<{ candidateId: string; votes?: number; rank: number }>;
  final?: Array<{ candidateId: string; seat: number; reason?: string }>; // reason id -> locale prose
}

interface Event extends Dataset {
  meta: EventMeta;
  results?: EventResults;
}
```

The **engine consumes the same `Dataset` shape it always has** — `meta` and
`results` are read by the view/UI layers only, never by scoring.

### Event registry (the chooser index)

A small top-level file lets the app render a chooser without loading any full
event:

```jsonc
// src/data/events/index.json
{
  "events": [
    { "id": "hademokratim-2026", "party": "hademokratim", "date": "2026-07-20", "status": "past" }
    // ...future events appended here
  ]
}
```

### Data loader contract

[`src/data/index.ts`](../src/data/index.ts) stops exporting singletons and
exposes:

```ts
listEvents(): EventSummary[];              // from events/index.json, sync, cheap
loadEvent(id: string): Promise<Event>;     // fetches that event's JSON folder
```

Helpers that are today module globals (`parametersById`, `candidatesById`,
`evidenceFor`) become **functions of a loaded `Event`**, not ambient state.
Implementation: Vite `import.meta.glob` with lazy dynamic imports, or `fetch`
from `public/events/<id>/`. Loading states are the caller's responsibility.

### On-disk layout

```
src/data/events/
  index.json                       # the registry above
  hademokratim-2026/
    parameters.json                # (moved from src/data/parameters.json)
    questionnaire.json
    candidates.json
    evidence.json
    meta.json                      # folds into EventMeta
    results.json                   # new; optional (past events)
    locales/
      he.json                      # event-specific copy (name, tagline, param/candidate strings)
      en.json
```

Shared chrome strings (generic UI, FAQ, About) stay in
[`src/locales/*.json`](../src/locales); **event-specific** copy moves into the
event's `locales/` fragment and is layered on top of the shared catalog by
[`src/i18n`](../src/i18n). No prose ever enters the structural JSON.

### Routing contract

Introduce a router (recommend `react-router` for SEO of past events). Routes:

```
/                          event chooser (or a featured current event)
/e/:eventId                welcome
/e/:eventId/quiz
/e/:eventId/results        (Phase 5: ?a=<encoded answers> for shareable results)
/e/:eventId/browse
/e/:eventId/c/:candidateId
/e/:eventId/review         unlisted reviewer view (Phase 4)
/about
/faq
```

### Persistence contract

The localStorage key becomes **event-namespaced**:
`primaries-fit:progress:<eventId>`, still versioned by that event's
`questionnaire.version`. Progress on different events no longer collides; a
version bump within an event still discards that event's stale answers.

---

## Delivery phases

Ordered so each lands green. **0 → 1 → 2** are the critical path; **3, 4, 5**
parallelize once the event boundary exists.

### Phase 0 — Guardrails first ✅ shipped

Land the safety net before the refactor.

- **Build-time validator** — `scripts/validate-data.ts` (zod schemas mirroring
  [`types.ts`](../src/engine/types.ts)), run via a new `npm run validate` and
  wired into [`ci.yml`](../.github/workflows/ci.yml) before `build`. It must fail
  on: positions outside `[0,1]`; parameter/option/candidate ids referenced but
  not defined; `set` values not in the parameter's `options`; an evidence-sidecar
  `value` disagreeing with the candidate's projected `positions`; and any data id
  missing its string in **any** locale catalog.
- **Engine tests (Vitest)** — cover `score`, `metric`, `voter`, `postRank` with a
  fixed-answers → known-ranking fixture, plus empty/partial-answer cases that
  lock in the tolerance the multi-event schema relies on. Add `npm test` to CI.

**Acceptance:** CI runs lint + validate + test + build; a deliberately corrupt
data value fails the build; engine tests reproduce today's ranking.

### Phase 1 — Event as a first-class unit (data + loader) ✅ shipped

No UI-flow change yet.

- Add `Event` / `EventMeta` / `EventResults` to [`types.ts`](../src/engine/types.ts).
- Move the current data into `src/data/events/hademokratim-2026/` and add
  `events/index.json`.
- Rewrite [`src/data/index.ts`](../src/data/index.ts) to the `listEvents` /
  `loadEvent` contract; convert the id-index helpers to functions of a loaded
  event.

**Acceptance:** the app loads the one event through `loadEvent` and behaves
identically; validator passes on the relocated files.

### Phase 2 — Routing + event-aware shell ✅ shipped

- Add the router and the routes above.
- Thread `eventId` through [`App.tsx`](../src/App.tsx); the state machine reads a
  loaded `Event` instead of singletons. Add an **EventChooser** screen listing
  current + past primaries from the registry with status badges.
- Namespace [`persistence.ts`](../src/persistence.ts) per event.
- Split event-specific copy out of the shared catalog into the event's
  `locales/` fragment; de-hardcode [`index.html`](../index.html) title/OG.

**Acceptance:** two events (see verification) can be taken independently in both
languages with no cross-contamination of answers, copy, or routing.

### Phase 3 — Past-primary results & viewing ✅ shipped

- New view-model (`src/view/eventResults.ts`) rendering **raw vs. final** side by
  side, with `reason` prose explaining each divergence (reserved seats, quotas,
  agreements). Shown when `meta.status === "past"`.
- A past event's quiz already works after Phase 2; add a "this primary already
  happened (date) — you're exploring it" banner driven by `meta.status`, and
  optionally "how your match compares to the actual result".
- Surface per-event `dataUpdated` / `methodology`, replacing the single global
  `dataAsOf` string.

### Phase 4 — Reviewer / data-quality tooling (in-app) 🚧 in progress

- **In-app review mode** at `/e/:eventId/review` (unlisted): reads the loaded
  event's `evidence.json` and renders every candidate × parameter with value,
  **confidence**, rationale, and clickable sources in one scannable grid;
  flags `low`-confidence and `limitedRecord` entries and any position lacking a
  source. Pure read of existing data — no auth, no backend.
  → **Done:** `src/view/review.ts` (matrix view-model) + `ReviewScreen`, routed
  at `/e/:eventId/review`, with a per-cell colour by confidence, a `!` marker on
  any stated position with no source, a limited-record tag, summary tallies, and
  an "issues only" filter. The route is unlisted (reachable by URL, linked from
  nowhere).
- **Optional authoring helpers** (`scripts/`): a CSV↔JSON round-trip for a
  candidate matrix and a "what changed since last `dataUpdated`" diff report.
  Defer if capacity is tight — the validator + review view already cover
  correctness; these are authoring ergonomics.
  → **Deferred** (not built): the validator + review view cover correctness;
  these are authoring ergonomics to pick up if a data-entry workflow needs them.

### Phase 5 — Editorial pages & sharing polish ✅ shipped

- **Q&A / FAQ** and an expanded **About** (how ranking works, how positions are
  sourced — a reader-friendly take on [`candidate-scoring.md`](candidate-scoring.md),
  privacy, neutrality). Static routes; content in the shared catalog.
  → **Done:** `/about` (`AboutScreen`) and `/faq` (`FaqScreen`) top-level routes,
  content in the shared `ui.about.page` / `ui.faq` catalog (both locales), linked
  from the chooser, the welcome footer, and each other.
- **Shareable results**: encode answers in the URL
  (`/e/:eventId/results?a=…`) so a ranking is resumable and shareable — now
  meaningful because routing exists. Per-event OG tags so a shared link previews
  the right primary.
  → **Done:** `src/share.ts` encodes/decodes answers as URL-safe base64; the
  results share button copies a `?a=` link; a cold load of that link seeds the
  session and renders the ranking. Per-event title + OG tags are set at runtime
  (`src/meta.ts`). **Caveat:** runtime OG doesn't reach JS-less link-unfurling
  crawlers; crawler-visible per-event previews need build-time prerendered
  shells — tracked in [`roadmap.md`](roadmap.md).

---

## Verification

- **Every phase keeps CI green.** After Phase 0 the gate is
  `lint + validate + test + build`.
- **Engine parity**: Vitest fixtures reproduce the current הדמוקרטים ranking
  before and after the Phase 1 refactor — no score may change.
- **Validator negative test**: introduce a bad value (out-of-range position,
  dangling id, sidecar mismatch, missing locale string), confirm the build fails,
  revert.
- **Two-event smoke test**: clone the existing event under a second id, then
  drive the built app in headless Chromium (`/opt/pw-browsers`) through
  chooser → event A quiz → results → candidate, then event B, in both he/en —
  confirming persistence, routing, and copy are correctly namespaced.
- **Past-event path**: mark the seeded second event `status: "past"` with sample
  `raw` ≠ `final` results; confirm the divergence view and the "already happened"
  banner render.

## Open questions for the team

- **Event id scheme** — `<party>-<year>` (e.g. `hademokratim-2026`) vs. a
  slug; affects URLs and file paths.
- **Chooser default** — does `/` show a chooser, or redirect to the current
  featured event with the archive one click away?
- **Results data source** — where do `raw` and `final` come from per race, and
  who verifies the divergence reasons?
- **Review-mode access** — unlisted URL only, or a soft gate? (No backend means
  no real auth; the data is public-derived regardless.)
