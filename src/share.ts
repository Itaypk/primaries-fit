/**
 * Shareable results: encode a voter's answers into a URL-safe string and back,
 * so a ranking can live in a link (`/e/:eventId/results?a=…`) — resumable and
 * shareable with no backend. The engine derives the ranking from the answers,
 * so the answers are the only thing worth carrying; nothing candidate-specific
 * or scored goes in the URL.
 *
 * Encoding is UTF-8-safe base64url of the answers JSON. It is deliberately not a
 * stable/versioned wire format — a link is only meaningful against the same
 * questionnaire version, and stale answers are already discarded downstream
 * (unknown question/parameter ids are ignored by the engine).
 */
import type { Answers } from "./engine/types";

/** base64 → base64url (URL-safe, no padding). */
function toBase64Url(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** base64url → base64 (restore padding + standard alphabet). */
function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  return b64 + pad;
}

/** Encode answers for the `?a=` query param. */
export function encodeAnswers(answers: Answers): string {
  const json = JSON.stringify(answers);
  // encodeURIComponent → escape() makes btoa UTF-8-safe (option ids are ASCII
  // today, but a locale/id could carry non-Latin1 and must not throw).
  const bytes = unescape(encodeURIComponent(json));
  return toBase64Url(btoa(bytes));
}

/** True when a decoded value is a legal raw answer
 *  (number | boolean | string (region id) | string[]). */
function isAnswerValue(v: unknown): boolean {
  return (
    typeof v === "number" ||
    typeof v === "boolean" ||
    typeof v === "string" ||
    (Array.isArray(v) && v.every((x) => typeof x === "string"))
  );
}

/**
 * Decode the `?a=` param back to answers, or `null` when it's absent, malformed,
 * or not a plausible answers object. A bad link must never crash the results
 * screen — the caller falls back to redirecting to the questionnaire.
 */
export function decodeAnswers(param: string | null | undefined): Answers | null {
  if (!param) return null;
  try {
    const json = decodeURIComponent(escape(atob(fromBase64Url(param))));
    const obj = JSON.parse(json);
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0 || !entries.every(([, v]) => isAnswerValue(v))) return null;
    return obj as Answers;
  } catch {
    return null;
  }
}
