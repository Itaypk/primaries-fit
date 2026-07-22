import { describe, expect, it } from "vitest";
import { weightedManhattan } from "./metric";

const m = weightedManhattan;

describe("weightedManhattan.scalarAgreement", () => {
  it("is 1 when positions match, 0 at the extremes", () => {
    expect(m.scalarAgreement(0.5, 0.5)).toBe(1);
    expect(m.scalarAgreement(0, 1)).toBe(0);
    expect(m.scalarAgreement(1, 0)).toBe(0);
  });
  it("is 1 - |Δ| in between", () => {
    expect(m.scalarAgreement(0.2, 0.5)).toBeCloseTo(0.7, 10);
  });
});

describe("weightedManhattan.valenceAgreement", () => {
  it("is the candidate's own value (higher is better)", () => {
    expect(m.valenceAgreement(0.8)).toBe(0.8);
    expect(m.valenceAgreement(0)).toBe(0);
  });
});

describe("weightedManhattan.setAgreement (Jaccard)", () => {
  it("is 1 when both empty", () => {
    expect(m.setAgreement([], [])).toBe(1);
  });
  it("is 0 for disjoint sets", () => {
    expect(m.setAgreement(["a"], ["b"])).toBe(0);
  });
  it("is |∩| / |∪| for overlapping sets", () => {
    expect(m.setAgreement(["a", "b"], ["b", "c"])).toBeCloseTo(1 / 3, 10);
    expect(m.setAgreement(["a", "b"], ["a", "b"])).toBe(1);
  });
  it("ignores duplicates", () => {
    expect(m.setAgreement(["a", "a", "b"], ["a", "b"])).toBe(1);
  });
});

describe("weightedManhattan.aggregate", () => {
  it("is 0 when there are no answered parts", () => {
    expect(m.aggregate([])).toBe(0);
  });
  it("is the importance-weighted mean of agreements", () => {
    const r = m.aggregate([
      { agreement: 1, weight: 3 },
      { agreement: 0, weight: 1 },
    ]);
    expect(r).toBeCloseTo(0.75, 10);
  });
  it("skips parts with weight <= 0", () => {
    const r = m.aggregate([
      { agreement: 1, weight: 2 },
      { agreement: 0, weight: 0 },
      { agreement: 0, weight: -5 },
    ]);
    expect(r).toBe(1);
  });
});
