/**
 * Post-ranking — optional reshaping of the ranked list. Out of ranking scope
 * by design: these run *after* the match maths and never change scores, so the
 * ranking stays explainable. Preferences that aren't about closeness live here
 * ("balance the list by gender", "shuffle everyone close enough").
 *
 * Each step is a pure `(ranked, candidates) => ranked`; compose with
 * `applyPostRanking`.
 */

import type { Candidate, CandidateScore } from "./types";

export type PostRankStep = (
  ranked: CandidateScore[],
  candidates: Candidate[],
) => CandidateScore[];

export function applyPostRanking(
  ranked: CandidateScore[],
  candidates: Candidate[],
  steps: PostRankStep[],
): CandidateScore[] {
  return steps.reduce((acc, step) => step(acc, candidates), ranked);
}

/**
 * "Show me everyone close enough to my worldview, in random order." Keeps
 * candidates at/above `threshold` and shuffles them (intuition-driven mode).
 */
export function shuffleAboveThreshold(
  threshold: number,
  rng: () => number = Math.random,
): PostRankStep {
  return (ranked) => {
    const kept = ranked.filter((c) => c.score >= threshold);
    for (let i = kept.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [kept[i], kept[j]] = [kept[j], kept[i]];
    }
    return kept;
  };
}
