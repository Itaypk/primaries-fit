/** Shape of a locale catalog (src/locales/*.json). One per supported language. */
export interface Catalog {
  app: { name: string; langLabel: string };
  ui: {
    badge: string;
    welcome: {
      title: string;
      sub: string;
      time: string;
      start: string;
      steps: Array<{ title: string; desc: string }>;
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
      confidence: { high: string; medium: string; low: string };
    };
  };
  param: Record<string, { label: string; poleLow?: string; poleHigh?: string }>;
  option: Record<string, string>;
  question: Record<string, { title?: string; statement?: string }>;
  candidate: Record<string, { name: string; tagline: string; initial: string }>;
}
