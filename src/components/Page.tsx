import type { ReactNode } from "react";
import { AppFrame } from "./AppFrame";
import { Header } from "./Header";
import { ProgressBar } from "./ProgressBar";
import { SiteFooter } from "./SiteFooter";
import { DEFAULT_ACCENT, type AccentName } from "../theme";

/** The one page shell. Owns the frame, the header, the optional quiz progress
 *  bar, and the fixed footer navigation — every screen (top-level pages and the
 *  event flow alike) renders through this, so page chrome lives in exactly one
 *  place. Layout is a flex column: header + progress (flex:none), the child
 *  body (flex:1, scrolls), then the footer (flex:none, pinned to the bottom).
 *  The body (a PageBody + its content) is the child's job. */
export function Page({
  accent = DEFAULT_ACCENT,
  showBack = false,
  onBack,
  progress,
  children,
}: {
  accent?: AccentName;
  showBack?: boolean;
  onBack?: () => void;
  progress?: { step: number; total: number; pct: number };
  children: ReactNode;
}) {
  return (
    <AppFrame accent={accent}>
      <Header showBack={showBack} onBack={onBack ?? (() => {})} />
      {progress && <ProgressBar step={progress.step} total={progress.total} pct={progress.pct} />}
      {children}
      <SiteFooter />
    </AppFrame>
  );
}
