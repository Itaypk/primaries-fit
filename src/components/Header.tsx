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
        padding: "6px 20px 14px",
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

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* compass mark */}
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            border: "2.5px solid var(--accent, #c0684a)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "5px 5px auto auto",
              width: "2.5px",
              height: "8px",
              background: "var(--accent, #c0684a)",
              transform: "rotate(38deg)",
              transformOrigin: "bottom",
              borderRadius: "2px",
            }}
          />
        </div>
        <span className="serif" style={{ fontSize: "20px", fontWeight: 700, color: "#2b2622" }}>
          {t.app.name}
        </span>
      </div>

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
