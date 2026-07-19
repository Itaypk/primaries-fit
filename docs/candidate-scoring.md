# Candidate scoring methodology — Step 2

> Status: **in progress.** Produces two artifacts: candidate position vectors
> ([`src/data/candidates.json`](../src/data/candidates.json)) and a parallel
> **evidence sidecar** ([`src/data/evidence.json`](../src/data/evidence.json))
> carrying confidence, rationale, and sources per position. The engine never
> reads evidence.json — it exists for transparency, review, and the "why this
> match" breakdown later.

## Why a sidecar

`candidates.json` stays pure structure (ids + numbers, per CLAUDE.md), so the
engine input is unchanged. Everything a human needs to trust or contest a
position — how confident we are, why, and the source — lives beside it in
`evidence.json`, keyed the same way. They join on `candidateId` + `parameterId`.

### evidence.json shape

```jsonc
{
  "<candidateId>": {
    "<parameterId>": {
      "value": 0.9,                 // scalar/boolean in [0,1], or string[] for the set
      "confidence": "high",         // high | medium | low
      "rationale": "One or two sentences, in English, citing the basis.",
      "sources": ["https://…", "https://…"]
    }
  }
}
```

`candidates.json[value]` is copied from `evidence[value]` — the sidecar is the
source of truth, the data file is the engine-facing projection.

## Position scale anchors

Every scalar is `[0,1]`, low pole → high pole (see
[`parameters.md`](parameters.md)). Anchors keep scorers consistent:

| axis | 0.0 | 0.5 | 1.0 |
|------|-----|-----|-----|
| `conflict` | security/deterrence, skeptical of negotiations | conditional/pragmatic | active two-state, negotiate now |
| `separation_annexation` | **disagree** (0) | — | **agree** (1) — boolean, ends occupation / evacuates |
| `economy` | free-market, deregulate | mixed | strong welfare state, unions, redistribution |
| `religion_state` | preserve religious status quo | incremental reform | full institutional separation |
| `shared_society` | Jewish-national priority | civic equality in principle | full Jewish–Arab partnership, Arab parties in coalition |
| `positioning` | keep the party firmly on the left | balance | tack to the center for broad appeal |
| `climate` | not a stated priority | supportive but secondary | a central, signature cause |
| `experience` (valence) | no public office/leadership record | some public/organizational role | senior/sustained parliamentary or executive record |

## Confidence rubric

- **high** — an explicit public statement, vote, or sustained record *directly*
  on this axis.
- **medium** — inferred from adjacent statements, a clear factional signal, or a
  single indirect source.
- **low** — little/no public record on this axis; the value defaults to the
  **party prior** below and should be treated as a weak guess.

**Never fabricate.** If evidence is absent, return `low` + the prior — do not
invent a specific stance for a real person.

## Party prior (low-confidence fallback)

The הדמוקרטים center of gravity, used only when a candidate has no signal on an
axis: `conflict 0.6`, `separation_annexation` (no default — omit rather than
guess a binary), `economy 0.65`, `religion_state 0.75`, `shared_society 0.6`,
`positioning 0.5`, `climate 0.45`. `experience` is always assessed from the
factual record (roles held), never the prior.

## Process

1. **Roster + ids.** Clean each candidate's real full name (the scrape truncates
   some), assign a stable `firstname_lastname` slug id.
2. **Draft (Haiku).** One sub-agent per candidate, given: the candidate's
   name/bio/links, the axis anchors, the confidence rubric, and web search. It
   returns strict JSON (value + confidence + rationale + sources per axis),
   forced to `low`+prior when evidence is thin.
3. **Verify (stronger pass).** Spot-check every `high`-confidence claim and every
   extreme value against the cited source; downgrade or correct anything
   unsupported. Human review of the resulting ranking is the Step 2 gate.
4. **Assemble.** Project values into `candidates.json`, write `evidence.json`,
   add `candidate.<id>.*` to both locales, build, and drive the app.

## Pilot

First pass covers ~12 higher-profile candidates (real public records, so the
pipeline is checkable against ground truth) before scaling to all 51.
