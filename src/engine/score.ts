/**
 * Scoring pipeline: voter vector + candidates -> ranked, explainable matches.
 *
 *   buildVoterVector ─▶ VoterVector ─▶ rankCandidates ─▶ CandidateScore[]
 *
 * The distance maths lives entirely in the injected `ScoringStrategy`
 * (see metric.ts); this file only orchestrates. A separate, optional
 * post-ranking stage reshapes the final list (see postRank.ts) without touching
 * the match maths.
 */

import { defaultStrategy, type ScoringStrategy } from "./metric";
import { defaultImportance } from "./voter";
import type {
  Candidate,
  CandidateScore,
  Parameter,
  TopicScore,
  VoterVector,
} from "./types";

/** Per-parameter agreement in [0,1], or null if the voter has no answer for it. */
function agreementFor(
  param: Parameter,
  voter: VoterVector,
  candidate: Candidate,
  strategy: ScoringStrategy,
): number | null {
  const cv = candidate.positions[param.id];
  const vv = voter.positions[param.id];

  switch (param.kind) {
    case "scalar":
      if (typeof vv !== "number" || typeof cv !== "number") return null;
      return strategy.scalarAgreement(vv, cv);
    case "valence":
      if (typeof cv !== "number") return null;
      return strategy.valenceAgreement(cv);
    case "set":
      if (!Array.isArray(vv) || vv.length === 0) return null;
      return strategy.setAgreement(vv, Array.isArray(cv) ? cv : []);
  }
}

export function scoreCandidate(
  candidate: Candidate,
  voter: VoterVector,
  parameters: Parameter[],
  strategy: ScoringStrategy = defaultStrategy,
): CandidateScore {
  const perParameter: TopicScore[] = [];
  const parts: Array<{ agreement: number; weight: number }> = [];

  for (const p of parameters) {
    const weight = voter.importance[p.id] ?? defaultImportance(p.kind);
    const agreement = agreementFor(p, voter, candidate, strategy);
    perParameter.push({ parameterId: p.id, agreement, importance: weight });
    if (agreement !== null && weight > 0) parts.push({ agreement, weight });
  }

  return {
    candidateId: candidate.id,
    score: strategy.aggregate(parts),
    perParameter,
  };
}

/** Rank every candidate best-first. */
export function rankCandidates(
  candidates: Candidate[],
  voter: VoterVector,
  parameters: Parameter[],
  strategy: ScoringStrategy = defaultStrategy,
): CandidateScore[] {
  return candidates
    .map((c) => scoreCandidate(c, voter, parameters, strategy))
    .sort((a, b) => b.score - a.score);
}
