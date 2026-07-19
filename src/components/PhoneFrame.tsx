import type { CSSProperties, ReactNode } from "react";
import { palettes, type AccentName } from "../theme";
import { useI18n } from "../i18n";

/** Outer device chrome: the centred, gradient backdrop and the phone card.
 *  Accent palette is injected as CSS variables scoped to the card. */
export function PhoneFrame({
  accent,
  children,
}: {
  accent: AccentName;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const p = palettes[accent];

  const cardStyle = {
    position: "relative",
    width: "402px",
    height: "840px",
    background: "#faf6ef",
    borderRadius: "46px",
    boxShadow:
      "0 2px 4px rgba(60,40,20,.1),0 30px 70px -20px rgba(60,40,20,.45)",
    border: "1px solid #e8ddcd",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
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
      <div dir={t.dir} style={cardStyle}>
        {children}
      </div>
    </div>
  );
}
