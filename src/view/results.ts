/**
 * View-model helpers: turn engine output (CandidateScore, VoterVector) into the
 * display shapes the result & candidate screens render. No scoring happens here.
 */
import type {
  Candidate,
  CandidateScore,
  Parameter,
  VoterVector,
} from "../engine/types";
import type { Translator } from "../i18n";

/** A one-line reason shown under a result card. */
export interface ReasonVM {
  kind: "agree" | "gap";
  parameterId: string;
}

/** Top agreements + the single worst gap, mirroring the prototype's logic. */
export function reasonsFor(score: CandidateScore): ReasonVM[] {
  const answered = score.perParameter.filter(
    (p) => p.agreement !== null && p.importance > 0,
  );
  const agree = [...answered]
    .sort((a, b) => b.agreement! * b.importance - a.agreement! * a.importance)
    .filter((p) => p.agreement! >= 0.6)
    .slice(0, 3)
    .map((p): ReasonVM => ({ kind: "agree", parameterId: p.parameterId }));

  const worst = [...answered].sort((a, b) => a.agreement! - b.agreement!)[0];
  const reasons = [...agree];
  if (worst && worst.agreement! < 0.5) {
    reasons.push({ kind: "gap", parameterId: worst.parameterId });
  }
  return reasons;
}

/** Label for a scalar position: pole names at the ends, "middle" in between. */
export function scalarLabel(
  t: Translator,
  parameterId: string,
  value: number | null | undefined,
): string {
  if (value == null) return t.ui.quiz.none;
  if (value < 0.34) return t.poleLow(parameterId);
  if (value > 0.66) return t.poleHigh(parameterId);
  return t.ui.quiz.middle;
}

export interface BreakdownRow {
  parameterId: string;
  topic: string;
  you: string;
  candidate: string;
  /** 0..100 or null when the voter didn't answer this parameter. */
  pct: number | null;
}

/** Per-parameter comparison shown on the candidate detail screen. */
export function buildBreakdown(
  candidate: Candidate,
  voter: VoterVector,
  parameters: Parameter[],
  t: Translator,
): BreakdownRow[] {
  return parameters.map((p) => {
    const cv = candidate.positions[p.id];
    const vv = voter.positions[p.id];
    const answered = voter.importance[p.id] > 0;
    let you = t.ui.quiz.none;
    let candidate_ = "";
    let pct: number | null = null;

    switch (p.kind) {
      case "scalar": {
        you = scalarLabel(t, p.id, typeof vv === "number" ? vv : null);
        candidate_ = scalarLabel(t, p.id, typeof cv === "number" ? cv : null);
        if (typeof vv === "number" && typeof cv === "number") {
          pct = Math.round((1 - Math.abs(vv - cv)) * 100);
        }
        break;
      }
      case "valence": {
        const cval = typeof cv === "number" ? cv : 0;
        candidate_ = `${Math.round(cval * 100)}%`;
        if (answered) {
          // Recover the 1..5 rating from the stored importance weight.
          const rating = Math.round((voter.importance[p.id] - 0.5) * 4 + 1);
          you = `${rating}/5`;
          pct = Math.round(cval * 100);
        }
        break;
      }
      case "set": {
        const cvArr = Array.isArray(cv) ? cv : [];
        const vvArr = Array.isArray(vv) ? vv : [];
        candidate_ = cvArr.map((k) => t.option(k)).join(" · ");
        if (vvArr.length) {
          you = vvArr.map((k) => t.option(k)).join(" · ");
          const union = new Set([...vvArr, ...cvArr]).size;
          const inter = vvArr.filter((k) => cvArr.includes(k)).length;
          pct = union ? Math.round((inter / union) * 100) : 0;
        }
        break;
      }
    }

    return { parameterId: p.id, topic: t.param(p.id), you, candidate: candidate_, pct };
  });
}
