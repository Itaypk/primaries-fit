import type { Answers } from "./engine/types";

const KEY = "primaries-fit:progress";

export interface SavedProgress {
  /** questionnaire.version the answers were given against. Answers keyed to an
   *  older questionnaire reference parameters that may no longer exist, so a
   *  mismatch discards them rather than scoring against a changed space. */
  version: number;
  answers: Answers;
  qIndex: number;
  screen: "welcome" | "quiz" | "results";
}

/** Restore progress saved by a previous visit, or null if there is none, it's
 *  stale, or storage is unavailable (Safari private mode throws on access). */
export function loadProgress(version: number): SavedProgress | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as SavedProgress;
    if (saved.version !== version) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    if (!saved.answers || typeof saved.answers !== "object") return null;
    return saved;
  } catch {
    return null;
  }
}

export function saveProgress(progress: SavedProgress): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Storage full or blocked — progress just won't survive a reload.
  }
}

export function clearProgress(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to do; the caller is resetting in-memory state regardless.
  }
}
