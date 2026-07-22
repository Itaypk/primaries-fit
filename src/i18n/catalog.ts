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
    /** Event status badge labels, keyed by EventStatus. */
    status: { upcoming: string; open: string; past: string };
    /** The event chooser at `/`. */
    chooser: { title: string; sub: string };
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
}
