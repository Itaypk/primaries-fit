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
  /**
   * The district race this candidate runs in (a region id declared in the
   * event's `meta.regions`). Absent = the national list. Never scored — the
   * results view uses it to split the ranking into national + the voter's
   * district slate, mirroring ballots where members vote both lists.
   */
  region?: string;
  /** Presentation-only; never scored. */
  display?: {
    avatarBg?: string;
    avatarInk?: string;
    /** True when most positions are low-confidence (thin public record). UI-only flag. */
    limitedRecord?: boolean;
    /** Read only by the gender-balance post-ranking step; never scored and
     *  never displayed as a label on a candidate. Absent means unknown, which
     *  the step handles rather than guessing. */
    gender?: "f" | "m";
    /** Official portrait URL (from the party site). Used for the avatar; the
     *  coloured initial is the fallback when absent or the image fails to load.
     *  Language-neutral, so it lives here and not in the locale catalogs. */
    image?: string;
    /** Public/social links, keyed by platform id. Same in every language, so
     *  they sit on the structural record rather than the locale catalogs. */
    links?: CandidateLinks;
  };
}

/** A candidate's public links. All optional; only present platforms are shown. */
export interface CandidateLinks {
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  whatsapp?: string;
}

// ---------------------------------------------------------------------------
// Questionnaire — the elicitation layer
// ---------------------------------------------------------------------------

export type QuestionWidget =
  | "slider"
  | "segmented"
  | "boolean"
  | "multiselect"
  | "importance"
  /** Single-select of the event's `meta.regions`. Profile, not position: the
   *  answer (a region id, or "" for "not sure") never enters the voter vector —
   *  it only selects which district slate the results screen shows. */
  | "region";

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

/** Raw answer as produced by a widget, keyed by question id. A plain string is
 *  a region id (the `region` widget); "" means "not sure / no district". */
export type Answer = number | boolean | string | string[];
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

// ---------------------------------------------------------------------------
// Events — a primary as the atomic, self-contained unit
// ---------------------------------------------------------------------------
//
// Each primary carries ALL its data (parameters, questionnaire, candidates,
// evidence, metadata, and — for past races — results) under its own id, and is
// loaded on demand. `Event` extends `Dataset`: the engine consumes the same
// `Dataset` shape it always has, so `meta` / `results` are read by the view/UI
// layers only, never by scoring. Schema growth here must stay additive so one
// engine build scores every event without branching on a version.
// See docs/multi-event.md.

export type EventStatus = "upcoming" | "open" | "past";

/** Registry entry — enough to render a chooser without loading a full event. */
export interface EventSummary {
  /** Globally unique event id, e.g. "hademokratim-2026". Also the folder name. */
  id: string;
  /** Party id; the display label lives in the locale catalogs. */
  party: string;
  /** Primary date, ISO (YYYY-MM-DD). */
  date: string;
  status: EventStatus;
}

/** An event's metadata (its `meta.json`). Extends the registry summary. */
export interface EventMeta extends EventSummary {
  /** ISO date the candidate positions were last researched. */
  dataUpdated: string;
  /** Optional: a locale id resolved to prose, or an external URL. */
  methodology?: string;
  /**
   * District-race ids for events where members also vote a regional slate
   * (labels resolve from the locale catalogs as `region.<id>`). Candidates
   * reference these via `Candidate.region`; absent = no district races.
   */
  regions?: string[];
}

/**
 * Present only for past events. `raw` (vote order) and `final` (seated outcome)
 * are deliberately distinct: reserved seats, regional/minority quotas, and
 * coalition agreements reshape the result, so keeping both is what makes the
 * divergence explainable. `reason` is a locale id resolved to prose.
 */
export interface EventResults {
  raw?: Array<{ candidateId: string; votes?: number; rank: number }>;
  final?: Array<{ candidateId: string; seat: number; reason?: string }>;
}

/** A fully loaded primary: the scorable `Dataset` plus its sidecar + metadata. */
export interface Event extends Dataset {
  meta: EventMeta;
  /** Transparency sidecar (see below). Carried on the event; never scored. */
  evidence: Evidence;
  /** Present for past events. */
  results?: EventResults;
  /**
   * The event's own display copy per locale (param/option/question/candidate),
   * layered over the shared chrome catalog by src/i18n. Text, not structure,
   * but carried on the loaded event so it travels with its ids. Typed as
   * `EventCatalog` in src/i18n/catalog.ts; kept loose here to avoid the engine
   * depending on the i18n layer. Partial: an event may ship only its canonical
   * (Hebrew) fragment, and i18n falls back string-by-string.
   */
  locales: Partial<Record<LocaleCode, unknown>>;
}

// ---------------------------------------------------------------------------
// Evidence sidecar — transparency only. The engine never reads this; it backs
// the "how we decided" disclosure on the candidate screen. See
// docs/candidate-scoring.md.
// ---------------------------------------------------------------------------

export type Confidence = "high" | "medium" | "low";

export interface EvidenceEntry {
  value: number | string[];
  confidence: Confidence;
  rationale: string;
  sources: string[];
}

/** candidateId -> parameterId -> evidence for that position. */
export type Evidence = Record<string, Record<string, EvidenceEntry>>;
