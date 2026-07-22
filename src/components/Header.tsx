import { Link } from "react-router-dom";
import { useI18n } from "../i18n";

const ROUND_BTN: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: "50%",
  border: "1px solid var(--line-frame)",
  background: "var(--surface)",
  color: "var(--text)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

/** App header: contextual back, brand wordmark (always links home), and the
 *  language toggle. Site navigation lives in the fixed footer (SiteFooter). */
export function Header({ showBack, onBack }: { showBack: boolean; onBack: () => void }) {
  const { t, toggleLocale } = useI18n();
  const backArrow = t.dir === "rtl" ? "→" : "←";

  return (
    <div
      style={{
        flex: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        padding: "20px 20px 14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", minWidth: 44 }}>
        {showBack && (
          <button onClick={onBack} aria-label={t.ui.nav.back} style={{ ...ROUND_BTN, fontSize: 17 }}>
            {backArrow}
          </button>
        )}
      </div>

      {/* The wordmark is the whole brand — a phrase, not a single word, so it
          needs room to shrink between the fixed-width side slots. */}
      <Link
        to="/"
        className="serif"
        style={{
          fontSize: "var(--fs-h3)",
          lineHeight: 1.25,
          fontWeight: 700,
          color: "var(--text)",
          textAlign: "center",
          minWidth: 0,
        }}
      >
        {t.app.name}
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", minWidth: 44 }}>
        <button
          onClick={toggleLocale}
          style={{
            height: 34,
            padding: "0 13px",
            borderRadius: "var(--r-pill)",
            border: "1px solid var(--line-frame)",
            background: "var(--surface)",
            color: "var(--text-muted)",
            fontSize: "var(--fs-xs)",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {t.app.langLabel}
        </button>
      </div>
    </div>
  );
}
