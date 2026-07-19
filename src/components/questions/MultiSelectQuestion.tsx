import { useI18n } from "../../i18n";

/** Pick any number of flagship options. */
export function MultiSelectQuestion({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (optionId: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {options.map((optId) => {
        const on = selected.includes(optId);
        return (
          <button
            key={optId}
            onClick={() => onToggle(optId)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              width: "100%",
              textAlign: "start",
              padding: "15px 16px",
              borderRadius: "15px",
              border: on ? "1.5px solid var(--accent, #c0684a)" : "1.5px solid #eee3d3",
              background: on ? "var(--accent-soft, #f4e5dd)" : "#fff",
              color: on ? "#2b2622" : "#4a4238",
              fontSize: "15.5px",
              fontWeight: on ? 700 : 600,
              cursor: "pointer",
            }}
          >
            <span>{t.option(optId)}</span>
            <span
              style={
                on
                  ? {
                      width: "24px",
                      height: "24px",
                      borderRadius: "8px",
                      background: "var(--accent, #c0684a)",
                      color: "#fff",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "none",
                    }
                  : {
                      width: "24px",
                      height: "24px",
                      borderRadius: "8px",
                      border: "1.5px solid #d9cdb9",
                      flex: "none",
                    }
              }
            >
              {on ? "✓" : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
