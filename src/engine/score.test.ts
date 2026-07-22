import { describe, expect, it } from "vitest";
import { candidates, parameters, questionnaire } from "../data";
import { buildVoterVector } from "./voter";
import { rankCandidates, scoreCandidate } from "./score";
import type { Answers, Parameter } from "./types";

/**
 * Engine parity fixture. A fixed answer set over the real הדמוקרטים dataset,
 * scored end to end, must reproduce this exact ranking. This is the guard that
 * the multi-event refactor (data relocation in docs/multi-event.md, Phase 1)
 * changes NO scores — if a position or the maths shifts, this snapshot breaks.
 *
 * The expected order was captured by running the current engine once; it is a
 * fixed literal on purpose (not recomputed), so a real regression fails here.
 */
const FIXED_ANSWERS: Answers = {
  q_conflict: 80,
  q_imp_conflict: 5,
  q_separation: true,
  q_economy: 70,
  q_imp_economy: 4,
  q_religion_state: 85,
  q_imp_religion_state: 4,
  q_shared_society: 75,
  q_imp_shared_society: 3,
  q_positioning: 30,
  q_climate: 60,
  q_imp_climate: 2,
  q_flagship: ["religion_and_state", "democracy_integrity", "civil_rights"],
  q_imp_experience: 3,
};

const EXPECTED_ORDER = [
  "michal_rozin", "gaby_lasky", "gilad_kariv", "kati_piasecki", "eran_etzion",
  "yair_pink", "rabbi_benjamin_daniel_minich", "nidal_masalha", "yariv_oppenheimer",
  "ali_salalha", "avi_dabush", "mossi_raz", "lee_hoffmann_agiv", "tomer_avital",
  "moran_michel", "prof_yaron_niv", "dima_shapira", "nava_rozolio", "eran_nissan",
  "yair_rubinstein", "chen_arieli", "nimrod_sheffer", "avishai_lichtenstein",
  "hadas_ragolsky", "dani_algart", "yael_cohen_paran", "moran_zer_katzenstein",
  "omri_ronen", "emily_moatti", "moshe_redman_abutbul", "itai_leshem",
  "amir_khnifes", "alice_goldman", "inbal_wortman_shoham", "efrat_rayten",
  "naama_lazimi", "ram_shefa", "naor_narkis", "ayed_badir", "ghaleb_salamna",
  "yoav_agami", "rotem_sivan_hoffmann", "achsan_chalaylah", "malek_bader",
  "mehereta_baruch_ron", "inbar_bezek", "sumaya_bashir", "evyatar_beer",
  "gil_beilin", "olivia_emanuel_de_lam", "ihab_shalian",
];

describe("engine parity (real dataset)", () => {
  it("reproduces the known ranking for the fixed answer set", () => {
    const voter = buildVoterVector(FIXED_ANSWERS, questionnaire, parameters);
    const ranked = rankCandidates(candidates, voter, parameters);
    expect(ranked.map((r) => r.candidateId)).toEqual(EXPECTED_ORDER);
    expect(ranked[0].candidateId).toBe("michal_rozin");
    expect(ranked[0].score).toBeCloseTo(0.907692, 6);
  });

  it("scores every candidate and keeps output in [0,1]", () => {
    const voter = buildVoterVector(FIXED_ANSWERS, questionnaire, parameters);
    const ranked = rankCandidates(candidates, voter, parameters);
    expect(ranked).toHaveLength(candidates.length);
    for (const r of ranked) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    }
  });
});

describe("empty / partial answers (the multi-event tolerance)", () => {
  it("with no answers, scalars/sets are unanswered and valence stays opt-out", () => {
    const voter = buildVoterVector({}, questionnaire, parameters);
    const s = scoreCandidate(candidates[0], voter, parameters);
    // No parameter contributes (valence importance defaults to 0), so score is 0.
    expect(s.score).toBe(0);
    for (const p of s.perParameter) {
      if (parameters.find((x) => x.id === p.parameterId)?.kind === "valence") {
        expect(p.importance).toBe(0);
      }
    }
  });

  it("an unanswered parameter is skipped, never counted as disagreement", () => {
    const params: Parameter[] = [
      { id: "a", kind: "scalar" },
      { id: "b", kind: "scalar" },
    ];
    // Voter answered only 'a', matching the candidate exactly on it.
    const voter = { positions: { a: 0.5 }, importance: { a: 1, b: 1 } };
    const candidate = { id: "c", positions: { a: 0.5, b: 0.0 } };
    const s = scoreCandidate(candidate, voter, params);
    // 'b' is skipped (voter has no position) -> perfect score on 'a' alone.
    expect(s.score).toBe(1);
    expect(s.perParameter.find((p) => p.parameterId === "b")?.agreement).toBeNull();
  });
});
