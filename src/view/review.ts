/**
 * View-model for the in-app reviewer grid (`/e/:eventId/review`). Turns a loaded
 * event's evidence sidecar into one candidate × parameter matrix a human can
 * scan for data-quality problems — pure read, no scoring. The build-time
 * validator (scripts/validate-data.ts) catches machine-checkable errors; this
 * view supports the judgement calls it can't make (is a `low`-confidence guess
 * defensible? does a stated position actually rest on a source?).
 *
 * Flags mirror the three the reviewer brief calls out (docs/multi-event.md,
 * Phase 4): `low` confidence, a stated position with no source, and a
 * `limitedRecord` candidate.
 */
import type { Confidence, Event, Parameter } from "../engine/types";

/** One candidate's sourcing on one parameter. */
export interface ReviewCell {
  candidateId: string;
  parameterId: string;
  /** The candidate actually takes a position on this axis (in candidates.json). */
  hasPosition: boolean;
  /** The projected value, from the evidence entry when present else the position. */
  value?: number | string[];
  confidence?: Confidence;
  rationale?: string;
  sources: string[];
  /** An evidence entry exists for this pair at all. */
  hasEvidence: boolean;
  /** Stated position with nothing backing it — the "lacking a source" flag. */
  lacksSource: boolean;
  /** confidence === "low". */
  lowConfidence: boolean;
}

export interface ReviewRow {
  candidateId: string;
  limitedRecord: boolean;
  /** One cell per parameter, in column (parameter) order. */
  cells: ReviewCell[];
  /** Cells flagged low-confidence or lacking a source — the row's problem count. */
  issueCount: number;
}

export interface ReviewSummary {
  candidates: number;
  parameters: number;
  lowConfidence: number;
  lacksSource: number;
  limitedRecord: number;
}

export interface ReviewVM {
  parameters: Parameter[];
  rows: ReviewRow[];
  summary: ReviewSummary;
}

/** Build the reviewer matrix for a loaded event. */
export function buildReview(event: Event): ReviewVM {
  const { parameters, candidates, evidence } = event;
  const summary: ReviewSummary = {
    candidates: candidates.length,
    parameters: parameters.length,
    lowConfidence: 0,
    lacksSource: 0,
    limitedRecord: 0,
  };

  const rows: ReviewRow[] = candidates.map((c) => {
    const limitedRecord = c.display?.limitedRecord === true;
    if (limitedRecord) summary.limitedRecord++;

    let issueCount = 0;
    const cells: ReviewCell[] = parameters.map((p) => {
      const entry = evidence[c.id]?.[p.id];
      const hasPosition = c.positions[p.id] !== undefined;
      const sources = entry?.sources ?? [];
      const value = entry?.value ?? c.positions[p.id];
      const lowConfidence = entry?.confidence === "low";
      // Only a stated position can "lack a source"; an axis the candidate
      // doesn't take is a legitimate blank, not a gap.
      const lacksSource = hasPosition && sources.length === 0;

      if (lowConfidence) summary.lowConfidence++;
      if (lacksSource) summary.lacksSource++;
      if (lowConfidence || lacksSource) issueCount++;

      return {
        candidateId: c.id,
        parameterId: p.id,
        hasPosition,
        value,
        confidence: entry?.confidence,
        rationale: entry?.rationale,
        sources,
        hasEvidence: entry !== undefined,
        lacksSource,
        lowConfidence,
      };
    });

    return { candidateId: c.id, limitedRecord, cells, issueCount };
  });

  return { parameters, rows, summary };
}
