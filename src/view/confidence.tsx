import type { CSSProperties } from "react";
import type { Confidence } from "../engine/types";

/** Short display label for a source link: bare hostname, no protocol/www.
 *  Shared by the candidate breakdown and the reviewer grid. */
// eslint-disable-next-line react-refresh/only-export-components
export function sourceLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Evidence-strength marker, shared by the candidate screen and the reviewer
 * grid. Filled = a direct, on-record statement; half = some evidence; hollow =
 * a weak/inferred signal; dashed (no level) = no evidence at all — a state only
 * the reviewer grid distinguishes.
 */
export function ConfidenceDot({ level }: { level?: Confidence }) {
  const fill: CSSProperties =
    level === "high"
      ? { background: "var(--accent-ink, #7d3d29)" }
      : level === "medium"
        ? { background: "#b08a52" }
        : level === "low"
          ? { background: "transparent", border: "1.5px solid #c9beac" }
          : { background: "transparent", border: "1.5px dashed #d8ccb8" };
  return <span style={{ flex: "none", width: 8, height: 8, borderRadius: "50%", ...fill }} />;
}
