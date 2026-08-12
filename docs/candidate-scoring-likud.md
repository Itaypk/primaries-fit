# Candidate scoring methodology — likud-2026 (Step 2/3)

> Status: **in progress, phased.** Sibling document to
> [`candidate-scoring.md`](candidate-scoring.md) (written for the הדמוקרטים
> event); this one carries the axis anchors, confidence rubric, and party-prior
> fallback specific to `likud-2026`. Produces the same two artifacts —
> [`src/data/events/likud-2026/candidates.json`](../src/data/events/likud-2026/candidates.json)
> (`positions`) and the parallel evidence sidecar
> [`src/data/events/likud-2026/evidence.json`](../src/data/events/likud-2026/evidence.json)
> (confidence, rationale, sources). The engine never reads `evidence.json`; it
> exists for transparency and review. See
> [`parameters-likud-2026.md`](parameters-likud-2026.md) for how the axes below
> were chosen.

## Position scale anchors

Every scalar is `[0,1]`, low pole → high pole.

| axis | 0.0 | 0.5 | 1.0 |
|---|---|---|---|
| `gaza_posture` | preserve the ceasefire & deal framework | conditional — hold the ceasefire, resume force if violated | renew decisive military action now |
| `haredi_draft` | preserve the arrangement with the haredi parties | gradual, negotiated increase in enlistment | broad, enforced enlistment now |
| `judicial_reform_pace` | pause / negotiated compromise | continue at the current, careful pace | complete the overhaul now |
| `sovereignty` | wait for the diplomatic window (defer to the US/normalization track) | prepare the groundwork, no formal declaration yet | apply sovereignty now |
| `economy` | government intervention on cost of living (subsidies, price controls) | targeted/mixed intervention | free market, competition, deregulation |
| `oct7_inquiry` | government-appointed inquiry, after the war chapter closes | open to an independent element, with reservations | independent state commission now |
| `jewish_identity` | national-liberal, live-and-let-live | moderate support for Jewish content, not mandated | strengthen Jewish identity in education & public sphere |
| `independence` | full backing of the leadership line | generally supportive, occasionally vocal | independent voice inside the party, public breaks with leadership |
| `experience` (valence) | no ministerial/parliamentary record | first-term MK / limited record | senior, sustained ministerial or Knesset record |

`flagship` (set) has no anchors — it's the candidate's own stated campaign
priorities, drawn from their public platform/messaging, not inferred.

## Confidence rubric

Same three tiers as the הדמוקרטים methodology:

- **high** — an explicit public statement, Knesset vote, or sustained record
  *directly* on this axis.
- **medium** — inferred from adjacent statements, a clear factional signal
  (e.g. named in the fault-line analysis), or a single indirect source.
- **low** — little/no public record found on this axis; the value defaults to
  the **party prior** below and must be treated as a weak placeholder, not a
  claim about the individual.

**Never fabricate.** A specific stance is never invented for a real person. No
signal → `low` + the prior, always with a rationale saying so.

## Party prior (low-confidence fallback)

The Likud membership's approximate center of gravity per axis, per the Step-1
member survey and issue-space analysis
([`parameters-likud-2026.md`](parameters-likud-2026.md)). These are *not*
predictions about any individual candidate — they exist only so that an
un-researched candidate defaults to a documented, party-wide estimate instead
of a fabricated personal position, and they carry `low` confidence everywhere
they're used.

| axis | prior | why |
|---|---|---|
| `gaza_posture` | 0.6 | survey's #1 issue skews toward continuing the campaign; kept short of the extreme since the ceasefire itself is settled policy |
| `haredi_draft` | 0.5 | the live rupture line (Edelstein/Illouz left over it) — genuinely split, no defensible lean |
| `judicial_reform_pace` | 0.6 | survey #2, broad support for continuing but intensity varies |
| `sovereignty` | 0.55 | survey #4, real support tempered by the diplomatic-timing camp |
| `economy` | 0.55 | historically the free-market party, but survey #3 (cost of living) shows real pull toward intervention |
| `oct7_inquiry` | 0.3 | the coalition has not authorized an independent commission; institutional lean toward the government-appointed route |
| `jewish_identity` | 0.55 | survey #5, modest lean toward strengthening identity content |
| `independence` | 0.35 | eight leader-reserved picks and loyalty as an explicit survey item both pull toward backing the line |
| `experience` | *(no prior — see below)* | factual, not attitudinal |

`experience` is never defaulted to a prior: it's assessed from the public
record (current MK, past minister, first-time candidate, municipal/communal
role, etc.). When that record can't be found even at low confidence, default
to `0.5` (assume an unremarkable, unverified record) rather than `0` — `0`
asserts "no record," which is itself a claim that needs a source.

`flagship` has no prior; an un-researched candidate ships with no flagship
tags rather than a guessed one (Jaccard treats an empty set as no signal, not
a penalty).

## Process (phased, given the 17 Aug primary and 92-candidate roster)

1. **Baseline pass (fast, no research).** Every candidate gets the party prior
   on every scalar axis, `experience: 0.5`, empty `flagship`, all at `low`
   confidence with a rationale pointing at this document. This is what ships
   first — it's honest (documented, party-wide, clearly low-confidence) rather
   than blank, and it unblocks real scoring immediately.
2. **Pilot research batch.** The ~20-25 candidates named in the Step-1
   fault-line analysis (ministers and prominent MKs with an actual public
   record to check) get real per-axis research: public statements, Knesset
   votes, interviews, committee roles. Confidence moves to `medium`/`high`
   only where a cited source supports it; anything still thin stays at the
   prior.
3. **Verify.** Every `high`-confidence claim and every value that lands at an
   extreme (near 0 or 1) gets its cited source checked before being written.
4. **Scale later.** The remaining national-list and all district-slate
   candidates stay on the baseline prior until there's time for another
   research pass — tracked as follow-up, not blocking this event from
   shipping before the primary.
