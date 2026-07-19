# Parameter space — הדמוקרטים 2026 primary

> Status: **approved (Step 1).** This is the finalized issue space for v1, which
> is deliberately **tailored to this one primary** (הדמוקרטים, 20 July 2026), not
> general-purpose. Structural ids live in
> [`src/data/parameters.json`](../src/data/parameters.json) and
> [`questionnaire.json`](../src/data/questionnaire.json); all text lives in
> [`src/locales`](../src/locales). Candidate positions + evidence are Step 2.

## How these were chosen

Backtracking from three inputs: (1) the party's own platform (a Labor+Meretz
merger under Yair Golan — social-democratic, Zionist-liberal, "responsible
separation", checks & balances, equal draft burden), (2) the 51 declared
candidates and what they emphasize, and (3) the standard Israeli baseline
(security, economy, religion & state).

A parameter earns a slot only if it discriminates **within this party** — big
national axes that are near-consensus here (opposition to the judicial overhaul,
"defeat Hamas", democracy vs. Netanyahu) are poor rankers and were kept out of
the scalar axes. The sharpest internal fault line is Golan's own dilemma: **stay
true to the Meretz left vs. tack to the center** — which is itself a parameter
(`positioning`).

## The parameters (9)

### Scalar axes (voter + candidate both hold a position; agreement = `1 − |Δ|`)

| id | Pole low (0) | Pole high (1) | Why it discriminates here |
|----|--------------|---------------|---------------------------|
| `conflict` | Security & deterrence first | Diplomacy & two states | ex-generals (e.g. Shalian) vs. peace activists (Oppenheimer, Mossi Raz) |
| `separation_annexation` | Keep the status quo | End the occupation, evacuate | asked as **agree/disagree** — occupation is a binary stance, not a smooth axis |
| `economy` | Free market | Social-democratic / welfare | Labor socio-economic wing (Lazimi) vs. liberals |
| `religion_state` | Preserve the status quo | Full separation | mostly pro-separation; degree + religious pluralism (Kariv) varies |
| `shared_society` | Jewish-national character first | Full Jewish–Arab civic equality | Arab/Druze candidates + Meretz wing vs. center |
| `positioning` | Stay true to the left | Move to the center | the defining Golan-era intra-party tension |
| `climate` | Not a top priority | A central cause | Meretz green wing; lets climate-focused candidates earn climate-focused voters |

### Valence (higher is better, but counts only if the voter rates its importance)

| id | Meaning | Note |
|----|---------|------|
| `experience` | Parliamentary / senior public record | Factual, low-controversy. Its inverse ("fresh outsider") is served by a voter simply *not* weighting it. |

### Set — "which issues should your candidate champion?" (Jaccard overlap)

`flagship` options: `cost_of_living`, `religion_and_state`, `civil_rights`,
`womens_minority_rep`, `democracy_integrity`, `jewish_arab_equality`,
`climate_env`.

These are broadly-shared party goals; voters differ mainly on **priority
order**, which is exactly what set-overlap measures (not position).

## Deliberately dropped or flagged

- **`honesty`** (was a valence trait) — dropped. Scoring real, named living
  people low on "honesty" is defamation-adjacent and low-signal.
- **checks-and-balances / governance** as a scalar — dropped (near-consensus
  here). Survives as the `democracy_integrity` flagship option, where it
  discriminates by *priority*.
- **equal draft burden** as its own axis — folded into `religion_state` + a
  flagship framing; standalone it is near-consensus in this party.
- **`separation_annexation`** — kept, but **watch for merge**: if scoring shows
  candidates who are dovish on `conflict` are uniformly dovish here too, the two
  axes double-count one worldview and should be merged.

## Questionnaire (14 questions)

7 position questions (one per scalar axis), 6 importance questions
(`conflict`, `economy`, `religion_state`, `shared_society`, `climate`,
`experience`), and 1 multiselect (`flagship`). `separation_annexation` is a
boolean (agree/disagree). Bump `questionnaire.version` on any change that
invalidates saved answers — it is at **2** because the parameter set changed
from the v1 placeholder.
