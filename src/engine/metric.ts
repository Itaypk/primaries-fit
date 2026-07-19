/**
 * Scoring strategy — the swappable "how do we measure agreement" layer.
 *
 * The rest of the engine never hard-codes a distance formula; it takes a
 * `ScoringStrategy`. This is the abstraction boundary that lets us iterate on
 * the metric later (weighted-Euclidean, asymmetric penalties, non-linear
 * importance…) without touching the pipeline or the UI.
 *
 * A strategy answers two questions:
 *   1. per parameter, how much do a voter and candidate agree? (one method per
 *      parameter kind, each returning a value in [0,1])
 *   2. how are those per-parameter agreements combined into one score?
 */

export interface ScoringStrategy {
  /** Stable id so a chosen strategy can be recorded / configured. */
  id: string;

  /** scalar parameters: voter & candidate positions in [0,1] -> agreement [0,1]. */
  scalarAgreement(voter: number, candidate: number): number;

  /** valence parameters: no voter position; the candidate's value is the agreement. */
  valenceAgreement(candidate: number): number;

  /** set parameters: overlap of two option-id subsets -> agreement [0,1]. */
  setAgreement(voter: string[], candidate: string[]): number;

  /** combine answered per-parameter agreements (with importance weights) into [0,1]. */
  aggregate(parts: Array<{ agreement: number; weight: number }>): number;
}

/** Jaccard similarity |A ∩ B| / |A ∪ B|. */
function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const setB = new Set(b);
  let inter = 0;
  for (const x of new Set(a)) if (setB.has(x)) inter++;
  const union = new Set([...a, ...b]).size;
  return union ? inter / union : 0;
}

/** Importance-weighted mean of `1 - |Δ|` agreements. The current default. */
export const weightedManhattan: ScoringStrategy = {
  id: "weighted-manhattan",
  scalarAgreement: (voter, candidate) => 1 - Math.abs(voter - candidate),
  valenceAgreement: (candidate) => candidate,
  setAgreement: jaccard,
  aggregate: (parts) => {
    let num = 0;
    let den = 0;
    for (const { agreement, weight } of parts) {
      if (weight <= 0) continue;
      num += weight * agreement;
      den += weight;
    }
    return den ? num / den : 0;
  },
};

/** Registry of available strategies, so a metric can be selected by id/config. */
export const strategies: Record<string, ScoringStrategy> = {
  [weightedManhattan.id]: weightedManhattan,
};

export const defaultStrategy = weightedManhattan;
