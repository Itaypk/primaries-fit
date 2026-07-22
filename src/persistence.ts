import type { Answers } from "./engine/types";

/** localStorage key for one event's progress. Namespaced by event id so two
 *  primaries never collide; still versioned by that event's questionnaire. */
const keyFor = (eventId: string) => `primaries-fit:progress:${eventId}`;

export interface SavedProgress {
  /** questionnaire.version the answers were given against. Answers keyed to an
   *  older questionnaire reference parameters that may no longer exist, so a
   *  mismatch discards them rather than scoring against a changed space. */
  version: number;
  answers: Answers;
  qIndex: number;
}

/** Restore an event's saved progress, or null if there is none, it's stale, or
 *  storage is unavailable (Safari private mode throws on access). */
export function loadProgress(eventId: string, version: number): SavedProgress | null {
  try {
    const raw = window.localStorage.getItem(keyFor(eventId));
    if (!raw) return null;
    const saved = JSON.parse(raw) as SavedProgress;
    if (saved.version !== version) {
      window.localStorage.removeItem(keyFor(eventId));
      return null;
    }
    if (!saved.answers || typeof saved.answers !== "object") return null;
    return saved;
  } catch {
    return null;
  }
}

export function saveProgress(eventId: string, progress: SavedProgress): void {
  try {
    window.localStorage.setItem(keyFor(eventId), JSON.stringify(progress));
  } catch {
    // Storage full or blocked — progress just won't survive a reload.
  }
}

export function clearProgress(eventId: string): void {
  try {
    window.localStorage.removeItem(keyFor(eventId));
  } catch {
    // Nothing to do; the caller is resetting in-memory state regardless.
  }
}
