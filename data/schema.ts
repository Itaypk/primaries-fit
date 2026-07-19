/**
 * primaries.fit — data model
 * ===========================
 *
 * A vector-space model for matching voters to candidates.
 *
 * Three layers, deliberately decoupled:
 *
 *   1. PARAMETERS   — the shared coordinate system ("issue space"). Both voters
 *                     and candidates are points in this space.
 *   2. CANDIDATES   — each candidate is a position vector over the parameters.
 *   3. QUESTIONNAIRE— the elicitation layer. Questions are the UI that fills in
 *                     the voter's position + importance vectors. Questions
 *                     reference parameters by id; they never reference candidates.
 *
 * Why the parameter layer exists: in the original prototype, candidate data was
 * keyed *by question id*, so rewording, reordering, or adding a question forced
 * edits to every candidate. Here, candidate data is keyed by *parameter id*, so
 * the questionnaire can be rewritten freely as long as it targets existing
 * parameters. The candidate database and the questionnaire evolve independently.
 *
 * Everything here is framework-agnostic and serialisable to JSON. The intent is
 * to ship these as static JSON files loaded at startup — no backend required.
 */

/** A string localised to the languages the app supports. */
export interface LocalizedText {
  he: string;
  en: string;
}

// ---------------------------------------------------------------------------
// 1. PARAMETERS — the coordinate system
// ---------------------------------------------------------------------------

/**
 * How a parameter contributes to a match score.
 *
 * - `scalar`  : positional. Voter and candidate each hold a value in [0,1];
 *               agreement = 1 - |voter - candidate|. Continuous axes AND
 *               yes/no statements both use this (yes/no just uses the ends
 *               0 and 1). This is "how close are we".
 *
 * - `valence` : directional / quality. There is no "voter position" — more is
 *               universally preferred (e.g. honesty, experience). Agreement is
 *               simply the candidate's value. The voter only expresses *how
 *               much they care* via an importance question. This is "the more
 *               the better, weighted by how much I want it".
 *
 * - `set`     : categorical multi-select (e.g. flagship issues). Voter and
 *               candidate each hold a subset of `options`; agreement is the
 *               Jaccard similarity |A ∩ B| / |A ∪ B|. This is "how much do our
 *               priorities overlap".
 */
export type ParameterKind = "scalar" | "valence" | "set";

export interface ParameterBase {
  /** Stable id referenced by candidates and questions. Never reuse. */
  id: string;
  kind: ParameterKind;
  /** Short human name for the topic, shown in breakdowns. */
  label: LocalizedText;
}

export interface ScalarParameter extends ParameterBase {
  kind: "scalar";
  /**
   * Labels for the two ends of the axis (value 0 and value 1). Used for display
   * ("your stance" / "their stance") and for slider poles. For a binary yes/no
   * parameter, `low` is the disagree end and `high` is the agree end.
   */
  poles: { low: LocalizedText; high: LocalizedText };
}

export interface ValenceParameter extends ParameterBase {
  kind: "valence";
}

export interface SetOption {
  /** Stable id; candidates list these, questions render them as choices. */
  id: string;
  label: LocalizedText;
}

export interface SetParameter extends ParameterBase {
  kind: "set";
  options: SetOption[];
}

export type Parameter = ScalarParameter | ValenceParameter | SetParameter;

// ---------------------------------------------------------------------------
// 2. CANDIDATES — position vectors over the parameters
// ---------------------------------------------------------------------------

/**
 * A candidate's position on every parameter, keyed by parameter id.
 *
 *  - scalar  parameter -> number in [0,1]
 *  - valence parameter -> number in [0,1]
 *  - set     parameter -> string[] of chosen SetOption ids
 *
 * A missing key means "no stated position"; that parameter is skipped for this
 * candidate rather than counted as a disagreement.
 */
export type CandidatePositions = Record<string, number | string[]>;

export interface Candidate {
  /** Stable id. */
  id: string;
  name: LocalizedText;
  tagline: LocalizedText;
  positions: CandidatePositions;
  /** Presentation-only metadata (initials, avatar colours). Never scored. */
  display?: {
    initials?: LocalizedText;
    avatarBg?: string;
    avatarInk?: string;
  };
}

// ---------------------------------------------------------------------------
// 3. QUESTIONNAIRE — the elicitation layer
// ---------------------------------------------------------------------------

/**
 * The UI widget used to collect an answer. Widget is a presentation concern;
 * what a question *does* to the model is defined by `targets` / `importanceFor`.
 *
 *  - slider    : continuous 0..100 -> maps to a scalar position in [0,1]
 *  - segmented : discrete steps    -> same as slider, different control
 *  - boolean   : agree / disagree  -> scalar position 1 / 0
 *  - multiselect: pick a subset    -> a set answer
 *  - importance: 1..5 rating       -> sets the importance weight of a parameter
 */
export type QuestionWidget =
  | "slider"
  | "segmented"
  | "boolean"
  | "multiselect"
  | "importance";

/**
 * A single parameter a question loads onto, with a signed weight.
 *
 * `weight` is the loading: how strongly this answer moves the voter's position
 * on `parameter`. The common case is a single target with weight 1. Supplying
 * several targets lets ONE answer place the voter on MULTIPLE axes at once —
 * this is the "vector of weights per parameter" generalisation. A negative
 * weight inverts the axis (answer's high end maps to the parameter's low end).
 *
 * When several questions load onto the same scalar parameter, the voter's
 * position on it is the weight-weighted mean of their contributions, and the
 * accumulated |weight| feeds that parameter's importance.
 */
export interface PositionTarget {
  parameter: string;
  weight?: number; // default 1
}

export interface QuestionBase {
  id: string;
  widget: QuestionWidget;
  /** Topic chip shown above the question. */
  topic: LocalizedText;
}

/** slider / segmented / boolean — writes a scalar position. */
export interface PositionQuestion extends QuestionBase {
  widget: "slider" | "segmented" | "boolean";
  title: LocalizedText; // shown for slider/segmented
  statement?: LocalizedText; // shown for boolean ("...")
  hint?: LocalizedText;
  /** The scalar parameter(s) this answer loads onto. */
  targets: PositionTarget[];
}

/** multiselect — writes a set answer. */
export interface SetQuestion extends QuestionBase {
  widget: "multiselect";
  title: LocalizedText;
  hint?: LocalizedText;
  /** The `set` parameter whose options are offered as choices. */
  parameter: string;
}

/**
 * importance — does NOT set a position. It scales the importance weight of one
 * or more parameters. Used both to weight a positional axis (e.g. "how decisive
 * is security?") and to switch on a valence parameter (e.g. "how much does
 * honesty matter?"). A 1..5 answer maps to a weight in [0.5, 1.5].
 */
export interface ImportanceQuestion extends QuestionBase {
  widget: "importance";
  title: LocalizedText;
  hint?: LocalizedText;
  /** Parameters whose importance this rating sets. */
  importanceFor: string[];
}

export type Question = PositionQuestion | SetQuestion | ImportanceQuestion;

export interface Questionnaire {
  id: string;
  /** Bump when the question set changes in a way that invalidates saved answers. */
  version: number;
  questions: Question[];
}

// ---------------------------------------------------------------------------
// VOTER — the runtime output of the questionnaire
// ---------------------------------------------------------------------------

/** Raw answer as produced by a widget, keyed by question id. */
export type Answer = number | boolean | string[];
export type Answers = Record<string, Answer>;

/**
 * The voter reduced to the parameter space: a position vector and an importance
 * vector. This is what actually gets compared to candidates — the questionnaire
 * is just the machine that produces it.
 */
export interface VoterVector {
  /** parameter id -> position in [0,1] (scalar) or string[] (set). Absent = unanswered. */
  positions: Record<string, number | string[]>;
  /** parameter id -> importance weight (>= 0). */
  importance: Record<string, number>;
}

// ---------------------------------------------------------------------------
// SCORING — the ranking output
// ---------------------------------------------------------------------------

export interface TopicScore {
  parameterId: string;
  topic: LocalizedText;
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

/**
 * The full dataset the app loads at startup. Ships as three static JSON files
 * (parameters.json, candidates.json, questionnaire.json) plus optional UI
 * strings, or as one bundle.
 */
export interface Dataset {
  parameters: Parameter[];
  candidates: Candidate[];
  questionnaire: Questionnaire;
}
