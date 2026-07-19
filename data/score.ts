/**
 * Reference scoring pipeline for primaries.fit.
 *
 * Pure functions, no framework, no side effects. This is the executable spec of
 * the data model — the production app can reuse it verbatim. Two stages:
 *
 *   answers ──buildVoterVector──▶ VoterVector ──rankCandidates──▶ CandidateScore[]
 *
 * Then an OPTIONAL post-ranking stage (filters / re-orderings) that operates on
 * the already-ranked list — gender balance, "shuffle everyone above a
 * threshold", etc. Post-ranking never changes the match maths; it only reshapes
 * the final list, keeping the ranking explainable.
 */

import type {
  Answers,
  Candidate,
  CandidateScore,
  ImportanceQuestion,
  Parameter,
  PositionQuestion,
  Questionnaire,
  SetParameter,
  TopicScore,
  VoterVector,
} from "./schema";

/** Maps a 1..5 importance rating to a weight in [0.5, 1.5]. */
export function importanceWeight(rating: number): number {
  return 0.5 + (rating - 1) / 4;
}

/** Default importance for a parameter when no importance question sets it. */
function defaultImportance(kind: Parameter["kind"]): number {
  // Scalar & set parameters count fully by default; valence parameters only
  // count once the voter opts in via an importance question.
  return kind === "valence" ? 0 : 1;
}

/**
 * Reduce raw answers to the parameter space: a position vector + an importance
 * vector. This is the whole point of the questionnaire layer.
 */
export function buildVoterVector(
  answers: Answers,
  questionnaire: Questionnaire,
  parameters: Parameter[]
): VoterVector {
  const byId = new Map(parameters.map((p) => [p.id, p]));
  const positions: VoterVector["positions"] = {};
  const importance: VoterVector["importance"] = {};

  // Accumulators for scalar params that several questions may load onto.
  const posNum: Record<string, number> = {};
  const posDen: Record<string, number> = {};

  // Seed defaults.
  for (const p of parameters) importance[p.id] = defaultImportance(p.kind);

  for (const q of questionnaire.questions) {
    const raw = answers[q.id];

    if (q.widget === "importance") {
      if (typeof raw !== "number") continue;
      const w = importanceWeight(raw);
      for (const pid of (q as ImportanceQuestion).importanceFor) importance[pid] = w;
      continue;
    }

    if (q.widget === "multiselect") {
      if (Array.isArray(raw)) positions[(q as any).parameter] = raw;
      continue;
    }

    // slider / segmented / boolean -> scalar contribution in [0,1].
    let a: number | null = null;
    if (q.widget === "boolean") a = raw === true ? 1 : raw === false ? 0 : null;
    else if (typeof raw === "number") a = raw / 100; // sliders emit 0..100
    if (a === null) continue;

    for (const target of (q as PositionQuestion).targets) {
      const weight = target.weight ?? 1;
      // Signed weight lets one answer invert an axis; contribution is centred.
      const contrib = weight >= 0 ? a : 1 - a;
      const m = Math.abs(weight);
      posNum[target.parameter] = (posNum[target.parameter] ?? 0) + m * contrib;
      posDen[target.parameter] = (posDen[target.parameter] ?? 0) + m;
    }
  }

  // Collapse accumulated scalar contributions into final positions.
  for (const pid of Object.keys(posDen)) {
    if (posDen[pid] > 0 && byId.get(pid)?.kind !== "set") {
      positions[pid] = posNum[pid] / posDen[pid];
    }
  }

  return { positions, importance };
}

/** Jaccard similarity of two sets of option ids. */
function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const B = new Set(b);
  let inter = 0;
  for (const x of new Set(a)) if (B.has(x)) inter++;
  const union = new Set([...a, ...b]).size;
  return union ? inter / union : 0;
}

/**
 * Per-parameter agreement in [0,1], or null if the voter has no answer for it.
 */
function agreementFor(
  param: Parameter,
  voter: VoterVector,
  candidate: Candidate
): number | null {
  const cv = candidate.positions[param.id];
  const vv = voter.positions[param.id];

  switch (param.kind) {
    case "scalar": {
      if (typeof vv !== "number" || typeof cv !== "number") return null;
      return 1 - Math.abs(vv - cv);
    }
    case "valence": {
      // No voter position; the candidate's quality *is* the agreement.
      if (typeof cv !== "number") return null;
      return cv;
    }
    case "set": {
      if (!Array.isArray(vv) || vv.length === 0) return null;
      const cvArr = Array.isArray(cv) ? cv : [];
      return jaccard(vv, cvArr);
    }
  }
}

/**
 * Score one candidate: importance-weighted mean of per-parameter agreement.
 *
 *   score = Σ wᵢ·agreeᵢ / Σ wᵢ   over answered parameters with wᵢ > 0
 */
export function scoreCandidate(
  candidate: Candidate,
  voter: VoterVector,
  parameters: Parameter[]
): CandidateScore {
  let num = 0;
  let den = 0;
  const perParameter: TopicScore[] = [];

  for (const p of parameters) {
    const w = voter.importance[p.id] ?? defaultImportance(p.kind);
    const agreement = agreementFor(p, voter, candidate);
    perParameter.push({ parameterId: p.id, topic: p.label, agreement, importance: w });
    if (agreement === null || w <= 0) continue;
    num += w * agreement;
    den += w;
  }

  return { candidateId: candidate.id, score: den ? num / den : 0, perParameter };
}

/** Rank every candidate best-first. */
export function rankCandidates(
  candidates: Candidate[],
  voter: VoterVector,
  parameters: Parameter[]
): CandidateScore[] {
  return candidates
    .map((c) => scoreCandidate(c, voter, parameters))
    .sort((a, b) => b.score - a.score);
}

// ---------------------------------------------------------------------------
// POST-RANKING — optional reshaping of the final list. Out of ranking scope.
// ---------------------------------------------------------------------------

/**
 * A post-ranking step takes the ranked scores (and the candidate records) and
 * returns a reshaped list. These are pure and composable, applied after the
 * match maths so the ranking stays explainable. Examples below.
 */
export type PostRankStep = (
  ranked: CandidateScore[],
  candidates: Candidate[]
) => CandidateScore[];

export function applyPostRanking(
  ranked: CandidateScore[],
  candidates: Candidate[],
  steps: PostRankStep[]
): CandidateScore[] {
  return steps.reduce((acc, step) => step(acc, candidates), ranked);
}

/**
 * "Show me everyone close enough to my worldview, in random order." Keeps
 * candidates at/above `threshold` and shuffles them (intuition-driven mode).
 */
export function shuffleAboveThreshold(threshold: number, rng: () => number = Math.random): PostRankStep {
  return (ranked) => {
    const kept = ranked.filter((c) => c.score >= threshold);
    for (let i = kept.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [kept[i], kept[j]] = [kept[j], kept[i]];
    }
    return kept;
  };
}
