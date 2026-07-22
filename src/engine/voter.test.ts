import { describe, expect, it } from "vitest";
import { buildVoterVector, defaultImportance, importanceWeight } from "./voter";
import type { Parameter, Questionnaire } from "./types";

describe("importanceWeight", () => {
  it("maps a 1..5 rating onto [0.5, 1.5]", () => {
    expect(importanceWeight(1)).toBeCloseTo(0.5, 10);
    expect(importanceWeight(3)).toBeCloseTo(1.0, 10);
    expect(importanceWeight(5)).toBeCloseTo(1.5, 10);
  });
});

describe("defaultImportance", () => {
  it("is 0 for valence (opt-in) and 1 otherwise", () => {
    expect(defaultImportance("valence")).toBe(0);
    expect(defaultImportance("scalar")).toBe(1);
    expect(defaultImportance("set")).toBe(1);
  });
});

describe("buildVoterVector", () => {
  const params: Parameter[] = [
    { id: "a", kind: "scalar" },
    { id: "b", kind: "scalar" },
    { id: "flag", kind: "set", options: ["x", "y", "z"] },
    { id: "val", kind: "valence" },
  ];

  it("scales sliders (0..100) down to [0,1] and passes booleans/multiselect through", () => {
    const q: Questionnaire = {
      id: "t",
      version: 1,
      questions: [
        { id: "qa", widget: "slider", targets: [{ parameter: "a" }] },
        { id: "qb", widget: "boolean", targets: [{ parameter: "b" }] },
        { id: "qf", widget: "multiselect", parameter: "flag" },
      ],
    };
    const v = buildVoterVector(
      { qa: 70, qb: true, qf: ["x", "z"] },
      q,
      params,
    );
    expect(v.positions.a).toBeCloseTo(0.7, 10);
    expect(v.positions.b).toBe(1);
    expect(v.positions.flag).toEqual(["x", "z"]);
  });

  it("leaves unanswered parameters absent (skipped, not zeroed)", () => {
    const q: Questionnaire = {
      id: "t",
      version: 1,
      questions: [{ id: "qa", widget: "slider", targets: [{ parameter: "a" }] }],
    };
    const v = buildVoterVector({}, q, params);
    expect(v.positions.a).toBeUndefined();
    expect(v.positions.b).toBeUndefined();
  });

  it("sets importance from a rating and defaults valence to 0", () => {
    const q: Questionnaire = {
      id: "t",
      version: 1,
      questions: [{ id: "qi", widget: "importance", importanceFor: ["a"] }],
    };
    const v = buildVoterVector({ qi: 5 }, q, params);
    expect(v.importance.a).toBeCloseTo(1.5, 10);
    expect(v.importance.b).toBe(1); // scalar default
    expect(v.importance.val).toBe(0); // valence opt-in
  });

  it("averages multiple targets by |weight| and inverts on a negative weight", () => {
    const q: Questionnaire = {
      id: "t",
      version: 1,
      questions: [
        { id: "q1", widget: "slider", targets: [{ parameter: "a", weight: 1 }] },
        // second question loads the SAME axis inverted (negative weight)
        { id: "q2", widget: "slider", targets: [{ parameter: "a", weight: -1 }] },
      ],
    };
    // q1: a=0.8 ; q2 inverted: 1-0.2 = 0.8 -> mean 0.8
    const v = buildVoterVector({ q1: 80, q2: 20 }, q, params);
    expect(v.positions.a).toBeCloseTo(0.8, 10);
  });
});
