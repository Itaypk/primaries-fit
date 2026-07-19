/**
 * primaries.fit — data model (structural types)
 * =============================================
 *
 * Three decoupled layers over one shared coordinate system:
 *
 *   1. PARAMETERS   — the "issue space". Voters and candidates are points here.
 *   2. CANDIDATES   — each candidate is a position vector over the parameters.
 *   3. QUESTIONNAIRE— elicitation. Questions fill in the voter's vectors; they
 *                     reference parameters by id and never mention candidates.
 *
 * These types describe *structure only*. All human-readable text lives in
 * per-locale catalogs (src/locales/*.json) and is resolved by convention from
 * these ids — see src/i18n. That separation is the "catalog" localisation model.
 *
 * See docs/data-model.md for the full rationale.
 */

export type LocaleCode = "he" | "en";

// ---------------------------------------------------------------------------
// Parameters — the coordinate system
// ---------------------------------------------------------------------------

/**
 * How a parameter contributes to a match score.
 *
 * - `scalar`  : positional. Voter & candidate each hold a value in [0,1];
 *               agreement is "how close are we". Continuous axes and yes/no
 *               statements both use this (yes/no snaps to the ends 0 / 1).
 * - `valence` : directional. No voter position — more is universally preferred
 *               (honesty, experience). The voter only sets *importance*, and by
 *               default a valence parameter counts for nothing until they opt in.
 * - `set`     : categorical multi-select. Voter & candidate each hold a subset
 *               of `options`; agreement is set overlap.
 */
export type ParameterKind = "scalar" | "valence" | "set";

export interface Parameter {
  /** Stable id referenced by candidates and questions. Never reuse. */
  id: string;
  kind: ParameterKind;
  /** For `set` parameters: the ids of the selectable options. */
  options?: string[];
}

// ---------------------------------------------------------------------------
// Candidates — position vectors
// ---------------------------------------------------------------------------

/**
 * A candidate's position on every parameter, keyed by parameter id:
 *   scalar / valence -> number in [0,1]; set -> string[] of option ids.
 * A missing key means "no stated position" and is skipped, not counted against.
 */
export type CandidatePositions = Record<string, number | string[]>;

export interface Candidate {
  id: string;
  positions: CandidatePositions;
  /** Presentation-only; never scored. */
  display?: {
    avatarBg?: string;
    avatarInk?: string;
    /** True when most positions are low-confidence (thin public record). UI-only flag. */
    limitedRecord?: boolean;
  };
}

// ---------------------------------------------------------------------------
// Questionnaire — the elicitation layer
// ---------------------------------------------------------------------------

export type QuestionWidget =
  | "slider"
  | "segmented"
  | "boolean"
  | "multiselect"
  | "importance";

/**
 * One parameter a question loads onto, with a signed weight (default 1). Several
 * targets let a single answer place the voter on multiple axes at once — the
 * "vector of weights per parameter". A negative weight inverts the axis.
 */
export interface PositionTarget {
  parameter: string;
  weight?: number;
}

export interface Question {
  id: string;
  widget: QuestionWidget;
  /** slider / segmented / boolean: the scalar parameter(s) this answer moves. */
  targets?: PositionTarget[];
  /** multiselect: the `set` parameter whose options are offered. */
  parameter?: string;
  /** importance: parameters whose importance weight this 1..5 rating sets. */
  importanceFor?: string[];
}

export interface Questionnaire {
  id: string;
  /** Bump when a change invalidates saved answers. */
  version: number;
  questions: Question[];
}

// ---------------------------------------------------------------------------
// Voter & scoring
// ---------------------------------------------------------------------------

/** Raw answer as produced by a widget, keyed by question id. */
export type Answer = number | boolean | string[];
export type Answers = Record<string, Answer>;

/**
 * The voter reduced to the parameter space. This — not the raw answers — is what
 * gets compared to candidates.
 */
export interface VoterVector {
  /** parameter id -> position in [0,1] or option ids. Absent = unanswered. */
  positions: Record<string, number | string[]>;
  /** parameter id -> importance weight (>= 0). */
  importance: Record<string, number>;
}

export interface TopicScore {
  parameterId: string;
  /** Per-parameter agreement in [0,1], or null if the voter didn't answer it. */
  agreement: number | null;
  importance: number;
}

export interface CandidateScore {
  candidateId: string;
  /** Overall match in [0,1]. */
  score: number;
  perParameter: TopicScore[];
}

/** The structural dataset the app loads at startup (text resolved separately). */
export interface Dataset {
  parameters: Parameter[];
  candidates: Candidate[];
  questionnaire: Questionnaire;
}
