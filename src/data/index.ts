/**
 * Event data access — the boundary between the app and the on-disk primaries.
 *
 * A primary is a self-contained **event**: its own folder of structural JSON
 * under `events/<id>/`, loaded on demand so the archive of past races never
 * bloats the initial bundle (docs/multi-event.md). This module exposes exactly
 * two things to the app:
 *
 *   listEvents(): EventSummary[]          — the chooser index, sync + cheap.
 *   loadEvent(id): Promise<Event>         — fetches one event's JSON folder.
 *
 * The id-index helpers that used to be module globals are now **functions of a
 * loaded event** (see indexParameters / indexCandidates / evidenceFor), so no
 * ambient singleton assumes there is exactly one primary.
 */
import type {
  Candidate,
  Dataset,
  Event,
  EventMeta,
  EventResults,
  EventSummary,
  Evidence,
  EvidenceEntry,
  LocaleCode,
  Parameter,
  Questionnaire,
} from "../engine/types";
import type { EventCatalog } from "../i18n/catalog";
import registry from "./events/index.json";

/** The locales an event ships a copy fragment for. Mirrors src/i18n LocaleCode. */
const EVENT_LOCALES: LocaleCode[] = ["he", "en"];

/** The featured event shown at the root until an explicit chooser exists (Phase 2). */
export const FEATURED_EVENT_ID = "hademokratim-2026";

/**
 * Lazy loaders for every event JSON file, keyed by path. `import.meta.glob`
 * (non-eager) yields a `() => Promise<module>` per match, so each event's data
 * is a separate chunk fetched only when that event is opened.
 */
const eventFiles = import.meta.glob<{ default: unknown }>([
  "./events/*/*.json",
  "./events/*/locales/*.json",
]);

/** The chooser index — current and past primaries, without loading any of them. */
export function listEvents(): EventSummary[] {
  return registry.events as EventSummary[];
}

async function importJson<T>(path: string): Promise<T> {
  const loader = eventFiles[path];
  if (!loader) throw new Error(`Event data file not found: ${path}`);
  return (await loader()).default as T;
}

/** Fetch one event's folder and assemble it into a fully loaded `Event`. */
export async function loadEvent(id: string): Promise<Event> {
  const dir = `./events/${id}`;
  const [parameters, candidates, questionnaire, evidence, meta] = await Promise.all([
    importJson<{ parameters: Parameter[] }>(`${dir}/parameters.json`),
    importJson<{ candidates: Candidate[] }>(`${dir}/candidates.json`),
    importJson<Questionnaire>(`${dir}/questionnaire.json`),
    importJson<Evidence>(`${dir}/evidence.json`),
    importJson<EventMeta>(`${dir}/meta.json`),
  ]);

  // results.json is optional (past events only); load it only if present.
  const resultsPath = `${dir}/results.json`;
  const results = eventFiles[resultsPath]
    ? await importJson<EventResults>(resultsPath)
    : undefined;

  // Per-locale display-copy fragments, layered over the shared catalog by i18n.
  // A fragment file may be absent (a Hebrew-only event); i18n then falls back
  // to the canonical Hebrew fragment string-by-string.
  const localeEntries = await Promise.all(
    EVENT_LOCALES.filter((lang) => eventFiles[`${dir}/locales/${lang}.json`]).map(
      async (lang) => [lang, await importJson<EventCatalog>(`${dir}/locales/${lang}.json`)] as const,
    ),
  );
  const locales = Object.fromEntries(localeEntries) as Partial<Record<LocaleCode, EventCatalog>>;

  return {
    parameters: parameters.parameters,
    candidates: candidates.candidates,
    questionnaire,
    evidence,
    meta,
    results,
    locales,
  };
}

// ---------------------------------------------------------------------------
// Id-index helpers — pure functions of a loaded event, not ambient state.
// ---------------------------------------------------------------------------

/** Index a loaded event's parameters by id for O(1) lookup. */
export function indexParameters(dataset: Dataset): Record<string, Parameter> {
  return Object.fromEntries(dataset.parameters.map((p) => [p.id, p]));
}

/** Index a loaded event's candidates by id. */
export function indexCandidates(dataset: Dataset): Record<string, Candidate> {
  return Object.fromEntries(dataset.candidates.map((c) => [c.id, c]));
}

/** The sourcing behind one candidate's position on one parameter, if recorded. */
export function evidenceFor(
  event: Event,
  candidateId: string,
  parameterId: string,
): EvidenceEntry | undefined {
  return event.evidence[candidateId]?.[parameterId];
}
