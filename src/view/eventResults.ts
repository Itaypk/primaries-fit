/**
 * View-model for a past event's actual outcome. Turns `EventResults` (the raw
 * vote order and the final seated list) into the two-column display the
 * "what actually happened" panel renders — with the divergence between vote
 * rank and seat made explicit, and each divergence's `reason` id resolved to
 * prose. No scoring happens here; results are UI-only metadata on the event.
 *
 * `raw` and `final` are deliberately distinct: reserved seats, regional/minority
 * quotas and coalition agreements reshape the seated list, so a candidate's seat
 * need not equal their vote rank. Keeping both is what makes the outcome
 * explainable (see docs/multi-event.md).
 */
import type { EventResults } from "../engine/types";
import type { Translator } from "../i18n";

/** One row in the vote-order (raw) column. */
export interface RawRow {
  candidateId: string;
  name: string;
  rank: number;
  votes?: number;
}

/** One row in the seated (final) column. */
export interface FinalRow {
  candidateId: string;
  name: string;
  seat: number;
  /** The candidate's rank in the vote order, when they appear in `raw`. A seated
   *  entry that isn't in the vote order at all (e.g. the party chair heading the
   *  list) has none. */
  rawRank?: number;
  /** True when a primary candidate's seat was reshaped away from pure vote order
   *  — a recorded `reason` on someone who did stand in the vote. The list head
   *  (chair) carries a reason but no vote rank, so it is not counted as "moved". */
  moved: boolean;
  /** Divergence explanation, resolved to prose; "" when none was recorded. */
  reason: string;
}

export interface EventResultsVM {
  raw: RawRow[];
  final: FinalRow[];
  /** True when at least one seat diverges from the vote order. */
  hasDivergence: boolean;
}

/**
 * Build the outcome view-model, or `null` when the event carries no usable
 * results (absent, or both lists empty) — the caller renders nothing then.
 */
export function buildEventResults(
  results: EventResults | undefined,
  t: Translator,
): EventResultsVM | null {
  if (!results) return null;

  const raw: RawRow[] = [...(results.raw ?? [])]
    .sort((a, b) => a.rank - b.rank)
    .map((r) => ({
      candidateId: r.candidateId,
      name: t.candidateName(r.candidateId),
      rank: r.rank,
      votes: r.votes,
    }));

  const rankByCandidate = new Map(raw.map((r) => [r.candidateId, r.rank]));

  const final: FinalRow[] = [...(results.final ?? [])]
    .sort((a, b) => a.seat - b.seat)
    .map((f) => {
      const rawRank = rankByCandidate.get(f.candidateId);
      return {
        candidateId: f.candidateId,
        name: t.candidateName(f.candidateId),
        seat: f.seat,
        rawRank,
        // A reshaped placement is one carrying a reason for a candidate who did
        // stand in the vote. Absolute seat != rank is expected for everyone once
        // a non-standing head tops the list, so the reason — not the number — is
        // the signal for what actually diverged.
        moved: Boolean(f.reason) && rawRank !== undefined,
        reason: f.reason ? t.resultReason(f.reason) : "",
      };
    });

  if (raw.length === 0 && final.length === 0) return null;

  return { raw, final, hasDivergence: final.some((f) => f.moved) };
}

/**
 * How the voter's own top match landed in the real outcome — the single fact
 * behind the "how your ranking compares" line on a past event's results.
 * Returns `null` when the event has no vote order or the match isn't in it.
 */
export function outcomeRankOf(
  candidateId: string | undefined,
  results: EventResults | undefined,
): number | null {
  if (!candidateId || !results?.raw) return null;
  return results.raw.find((r) => r.candidateId === candidateId)?.rank ?? null;
}
