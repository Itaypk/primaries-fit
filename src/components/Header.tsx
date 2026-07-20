import { useI18n } from "../i18n";

/** App header: optional back button, brand mark, language toggle. */
export function Header({
  showBack,
  onBack,
}: {
  showBack: boolean;
  onBack: () => void;
}) {
  const { t, toggleLocale } = useI18n();
  const backArrow = t.dir === "rtl" ? "→" : "←";

  return (
    <div
      style={{
        flex: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 20px 14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "9px", minWidth: "74px" }}>
        {showBack && (
          <button
            onClick={onBack}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "1px solid #e8ddcd",
              background: "#fff",
              color: "#2b2622",
              fontSize: "17px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {backArrow}
          </button>
        )}
      </div>

      {/* The wordmark is the whole brand now — no icon. It's a phrase rather
          than a single word, so it needs room to shrink between the fixed-width
          back/language slots on a narrow frame. */}
      <span
        className="serif"
        style={{
          fontSize: "17px",
          lineHeight: 1.25,
          fontWeight: 700,
          color: "#2b2622",
          textAlign: "center",
          minWidth: 0,
        }}
      >
        {t.app.name}
      </span>

      <div style={{ minWidth: "74px", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={toggleLocale}
          style={{
            height: "34px",
            padding: "0 13px",
            borderRadius: "999px",
            border: "1px solid #e8ddcd",
            background: "#fff",
            color: "#6b6152",
            fontSize: "13px",
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
