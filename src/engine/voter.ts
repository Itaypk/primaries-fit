/**
 * Reduce raw questionnaire answers to the parameter space: a position vector +
 * an importance vector. This is the whole job of the questionnaire layer — once
 * a voter is a pair of vectors, scoring never looks at questions again.
 */

import type { Answers, Parameter, Questionnaire, VoterVector } from "./types";

/** Maps a 1..5 importance rating to a weight in [0.5, 1.5]. */
export function importanceWeight(rating: number): number {
  return 0.5 + (rating - 1) / 4;
}

/**
 * Default importance when no importance question sets a parameter.
 * Scalar & set count fully; valence counts for nothing until the voter opts in
 * (some voters actively prefer *less* of a valence trait, e.g. experience).
 */
export function defaultImportance(kind: Parameter["kind"]): number {
  return kind === "valence" ? 0 : 1;
}

export function buildVoterVector(
  answers: Answers,
  questionnaire: Questionnaire,
  parameters: Parameter[],
): VoterVector {
  const byId = new Map(parameters.map((p) => [p.id, p]));
  const positions: VoterVector["positions"] = {};
  const importance: VoterVector["importance"] = {};

  // Accumulators for scalar params that several questions may load onto.
  const posNum: Record<string, number> = {};
  const posDen: Record<string, number> = {};

  for (const p of parameters) importance[p.id] = defaultImportance(p.kind);

  for (const q of questionnaire.questions) {
    const raw = answers[q.id];

    // Profile questions (region) select what the results screen shows; they
    // carry no position or importance and must never touch the vectors.
    if (q.widget === "region") continue;

    if (q.widget === "importance") {
      if (typeof raw !== "number" || !q.importanceFor) continue;
      const w = importanceWeight(raw);
      for (const pid of q.importanceFor) importance[pid] = w;
      continue;
    }

    if (q.widget === "multiselect") {
      if (Array.isArray(raw) && q.parameter) positions[q.parameter] = raw;
      continue;
    }

    // slider / segmented / boolean -> scalar contribution in [0,1].
    let a: number | null = null;
    if (q.widget === "boolean") a = raw === true ? 1 : raw === false ? 0 : null;
    else if (typeof raw === "number") a = raw / 100; // sliders emit 0..100
    if (a === null || !q.targets) continue;

    for (const target of q.targets) {
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
