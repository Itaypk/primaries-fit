import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearProgress, loadProgress, saveProgress } from "./persistence";
import type { Answers } from "./engine/types";

// Minimal in-memory localStorage so the namespacing logic can be tested under
// the node environment without pulling in jsdom.
function mockStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
}

beforeEach(() => vi.stubGlobal("window", { localStorage: mockStorage() }));
afterEach(() => vi.unstubAllGlobals());

const answersA: Answers = { q_conflict: 80 };
const answersB: Answers = { q_conflict: 10 };

describe("per-event persistence namespacing", () => {
  it("keeps two events' progress independent", () => {
    saveProgress("event-a", { version: 1, answers: answersA, qIndex: 3 });
    saveProgress("event-b", { version: 1, answers: answersB, qIndex: 7 });

    expect(loadProgress("event-a", 1)?.answers).toEqual(answersA);
    expect(loadProgress("event-a", 1)?.qIndex).toBe(3);
    expect(loadProgress("event-b", 1)?.answers).toEqual(answersB);
    expect(loadProgress("event-b", 1)?.qIndex).toBe(7);
  });

  it("clears only the named event", () => {
    saveProgress("event-a", { version: 1, answers: answersA, qIndex: 3 });
    saveProgress("event-b", { version: 1, answers: answersB, qIndex: 7 });

    clearProgress("event-a");
    expect(loadProgress("event-a", 1)).toBeNull();
    expect(loadProgress("event-b", 1)?.answers).toEqual(answersB);
  });

  it("discards an event's stale answers on a version bump", () => {
    saveProgress("event-a", { version: 1, answers: answersA, qIndex: 3 });
    expect(loadProgress("event-a", 2)).toBeNull(); // version mismatch
    // and the stale entry is removed, so a later matching version won't see it
    expect(loadProgress("event-a", 1)).toBeNull();
  });

  it("returns null when there is no saved progress", () => {
    expect(loadProgress("never-saved", 1)).toBeNull();
  });
});
