import { useI18n } from "../../i18n";

/**
 * Pick the district race the voter belongs to — single-select over the event's
 * `meta.regions`, plus an explicit "not sure" choice (value "") so nobody is
 * forced to guess. Profile, not position: the answer only chooses which
 * district slate the results screen shows and never enters the voter vector.
 */
export function RegionQuestion({
  regions,
  value,
  onChange,
}: {
  regions: string[];
  value: string | null;
  onChange: (regionId: string) => void;
}) {
  const { t } = useI18n();
  const choices: Array<{ id: string; label: string }> = [
    ...regions.map((id) => ({ id, label: t.region(id) })),
    { id: "", label: t.ui.quiz.regionNone },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {choices.map((c) => {
        const on = value === c.id;
        return (
          <button
            key={c.id || "__none"}
            onClick={() => onChange(c.id)}
            aria-pressed={on}
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
            <span>{c.label}</span>
            <span
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                border: on ? "none" : "1.5px solid #d9cdb9",
                background: on ? "var(--accent, #c0684a)" : "transparent",
                color: "#fff",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none",
              }}
            >
              {on ? "✓" : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
