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
 * "Balance the list by gender." Zips the two gender groups together —
 * best woman, best man, second-best woman, … — the same alternating mechanism
 * Israeli parties use to build a balanced list.
 *
 * Scores are untouched: this only reorders, so every candidate still carries
 * the match the maths gave them. Whichever group is larger has its remainder
 * appended in score order once the other runs out, and candidates with no
 * recorded gender go last rather than being dropped or guessed at.
 *
 * The higher-scoring group leads, so the voter's own best match stays at the
 * top of a balanced list too.
 */
export function balanceByGender(): PostRankStep {
  return (ranked, candidates) => {
    const genderOf = new Map(
      candidates.map((c) => [c.id, c.display?.gender]),
    );

    const women = ranked.filter((c) => genderOf.get(c.candidateId) === "f");
    const men = ranked.filter((c) => genderOf.get(c.candidateId) === "m");
    const unknown = ranked.filter((c) => genderOf.get(c.candidateId) == null);

    const leadIsWomen = (women[0]?.score ?? -Infinity) >= (men[0]?.score ?? -Infinity);
    const [first, second] = leadIsWomen ? [women, men] : [men, women];

    const zipped: CandidateScore[] = [];
    for (let i = 0; i < Math.max(first.length, second.length); i++) {
      if (i < first.length) zipped.push(first[i]);
      if (i < second.length) zipped.push(second[i]);
    }
    return [...zipped, ...unknown];
  };
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
