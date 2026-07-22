/**
 * Shape of a **shared** locale catalog (src/locales/*.json) — the language's
 * generic chrome, one file per supported language. Event-specific copy
 * (parameters, options, questions, candidates) lives in a per-event
 * `EventCatalog` fragment and is layered on top of this at load time.
 */
export interface Catalog {
  app: { name: string; langLabel: string };
  /** Party display labels, keyed by party id (used by the event chooser). */
  party: Record<string, string>;
  ui: {
    badge: string;
    welcome: {
      title: string;
      sub: string;
      time: string;
      start: string;
      /** Reassurance that the questionnaire keeps nothing — shown on welcome. */
      privacy: string;
      /** Secondary action: skip the questionnaire and browse candidates. */
      browse: string;
      steps: Array<{ title: string; desc: string }>;
    };
    browse: {
      title: string;
      sub: string;
    };
    quiz: {
      next: string;
      seeResults: string;
      stepOf: string;
      of: string;
      dragHint: string;
      rangeHint: string;
      multiHint: string;
      boolHint: string;
      yes: string;
      no: string;
      notImp: string;
      veryImp: string;
      middle: string;
      none: string;
    };
    results: {
      title: string;
      sub: string;
      match: string;
      topMatch: string;
      aligned: string;
      gap: string;
      whyMatch: string;
      fullBreakdown: string;
      restart: string;
      limitedRecord: string;
      aiNotice: string;
      /** Contains a {date} placeholder. */
      dataAsOf: string;
      share: string;
      shared: string;
      viewLabel: string;
      view: { match: string; balanced: string; close: string };
      /** `close` contains a {count} placeholder. */
      viewNote: { balanced: string; close: string };
      /** Link to how candidate positions are sourced (shown when the event
       *  declares a `methodology`). */
      methodology: string;
      /** Shown on a past event's results: where the voter's top match landed in
       *  the real outcome. Contains {name} and {rank} placeholders. */
      compareToOutcome: string;
    };
    about: {
      title: string;
      aiNotice: string;
      feedback: string;
      author: string;
      repo: string;
      linkedin: string;
    };
    candidate: {
      overallMatch: string;
      byTopic: string;
      yourStance: string;
      theirStance: string;
      backToResults: string;
      yes: string;
      no: string;
      howWeDecided: string;
      sources: string;
      /** Heading over the candidate's social/contact links. */
      links: string;
      confidence: { high: string; medium: string; low: string };
    };
    /** The unlisted reviewer grid at `/e/:eventId/review`. */
    review: {
      title: string;
      sub: string;
      /** Row-header column label. */
      candidateCol: string;
      /** Toggle: show only candidates with a flagged cell or limited record. */
      issuesOnly: string;
      /** One-line key to the cell colours / marker. */
      legend: string;
      /** Flag names used in the summary tallies. */
      flags: { low: string; missing: string; limited: string };
      /** Detail-panel copy. */
      noPosition: string;
      noEvidence: string;
      noSources: string;
    };
    /** Event status badge labels, keyed by EventStatus. */
    status: { upcoming: string; open: string; past: string };
    /** The event chooser at `/`. */
    chooser: { title: string; sub: string };
    /** Shown on a past event: the "you're exploring an archived race" notice and
     *  the actual-outcome (raw vs. final) panel. */
    pastEvent: {
      /** Contains a {date} placeholder. */
      banner: string;
    };
    outcome: {
      title: string;
      sub: string;
      /** Column heading over the vote-order list. */
      rawColumn: string;
      /** Column heading over the seated-list. */
      finalColumn: string;
      votes: string;
      /** Badge on a candidate whose seat differs from their vote rank. */
      moved: string;
    };
  };
}

/**
 * A per-event locale fragment (src/data/events/<id>/locales/<lang>.json). Carries
 * only the event's own display copy, resolved by convention from the ids in that
 * event's structural JSON, and layered over the shared `Catalog` at load time.
 * `app` may override the shared app name for an event; the rest is required.
 */
export interface EventCatalog {
  app?: Partial<{ name: string; langLabel: string }>;
  param: Record<string, { label: string; poleLow?: string; poleHigh?: string }>;
  option: Record<string, string>;
  question: Record<string, { title?: string; statement?: string }>;
  candidate: Record<string, { name: string; tagline: string; initial: string }>;
  /** Prose for a past event's result-divergence reasons, keyed by the reason id
   *  referenced from `results.json` `final[].reason`. Present only for past
   *  events that record a divergence between vote order and seated outcome. */
  resultReason?: Record<string, string>;
}
