import type { CSSProperties, ReactNode } from "react";
import { palettes, type AccentName } from "../theme";
import { useI18n } from "../i18n";

/** The app's self-contained panel: a rounded, internally-scrolling frame that
 *  stays a phone-card size on small viewports and widens into a reading panel
 *  with room for multi-column layouts on larger ones. Sizing and breakpoints
 *  live in `.app-frame` (styles.css) — it reacts to its own rendered width
 *  via container queries, not the viewport, so it degrades gracefully as a
 *  desktop window narrows. Accent palette is injected as CSS variables. */
export function AppFrame({
  accent,
  children,
}: {
  accent: AccentName;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const p = palettes[accent];

  const accentVars = {
    "--accent": p.accent,
    "--accent-soft": p.soft,
    "--accent-ink": p.ink,
  } as CSSProperties;

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px 16px",
        background:
          "radial-gradient(120% 90% at 50% 0%, #f4ecdf 0%, #e7dccb 100%)",
      }}
    >
      <div dir={t.dir} className="app-frame" style={accentVars}>
        {children}
      </div>
    </div>
  );
}
