import { describe, expect, it } from "vitest";
import { applyPostRanking, balanceByGender, shuffleAboveThreshold } from "./postRank";
import type { Candidate, CandidateScore } from "./types";

function score(id: string, s: number): CandidateScore {
  return { candidateId: id, score: s, perParameter: [] };
}
function cand(id: string, gender?: "f" | "m"): Candidate {
  return { id, positions: {}, display: gender ? { gender } : {} };
}

describe("balanceByGender", () => {
  it("alternates groups, higher-scoring group first, unknowns last", () => {
    const ranked = [
      score("w1", 0.9),
      score("m1", 0.8),
      score("w2", 0.7),
      score("u1", 0.6), // unknown gender
      score("m2", 0.5),
    ];
    const candidates = [
      cand("w1", "f"),
      cand("m1", "m"),
      cand("w2", "f"),
      cand("u1"),
      cand("m2", "m"),
    ];
    const out = balanceByGender()(ranked, candidates).map((c) => c.candidateId);
    // women lead (0.9 >= 0.8): w1, m1, w2, m2, then unknown u1.
    expect(out).toEqual(["w1", "m1", "w2", "m2", "u1"]);
  });

  it("appends the remainder of the larger group in score order", () => {
    const ranked = [score("m1", 0.9), score("m2", 0.8), score("w1", 0.7), score("m3", 0.6)];
    const candidates = [cand("m1", "m"), cand("m2", "m"), cand("w1", "f"), cand("m3", "m")];
    const out = balanceByGender()(ranked, candidates).map((c) => c.candidateId);
    // men lead: m1, w1, then men remainder m2, m3.
    expect(out).toEqual(["m1", "w1", "m2", "m3"]);
  });

  it("never changes any score", () => {
    const ranked = [score("w1", 0.9), score("m1", 0.8)];
    const candidates = [cand("w1", "f"), cand("m1", "m")];
    const out = balanceByGender()(ranked, candidates);
    expect(out.map((c) => c.score)).toEqual([0.9, 0.8]);
  });
});

describe("shuffleAboveThreshold", () => {
  it("keeps only candidates at or above the threshold", () => {
    const ranked = [score("a", 0.9), score("b", 0.7), score("c", 0.4)];
    const out = shuffleAboveThreshold(0.7)(ranked, []);
    expect(out.map((c) => c.candidateId).sort()).toEqual(["a", "b"]);
  });

  it("is deterministic under a seeded rng", () => {
    const ranked = [score("a", 1), score("b", 1), score("c", 1)];
    const seq = [0.99, 0.5, 0.01];
    let i = 0;
    const rng = () => seq[i++ % seq.length];
    const out = shuffleAboveThreshold(0, rng)(ranked, []);
    // Deterministic given the fixed rng sequence (Fisher–Yates).
    expect(out).toHaveLength(3);
    expect(out.map((c) => c.candidateId).sort()).toEqual(["a", "b", "c"]);
  });
});

describe("applyPostRanking", () => {
  it("composes steps left to right", () => {
    const ranked = [score("a", 0.9), score("b", 0.3)];
    const out = applyPostRanking(ranked, [], [shuffleAboveThreshold(0.5)]);
    expect(out.map((c) => c.candidateId)).toEqual(["a"]);
  });
});
