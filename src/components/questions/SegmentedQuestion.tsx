import { useI18n } from "../../i18n";

const STEPS = [0, 25, 50, 75, 100];

/** Discrete axis: five buttons across the same 0..100 range as the slider. */
export function SegmentedQuestion({
  parameterId,
  value,
  onChange,
}: {
  parameterId: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  const { t } = useI18n();
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "14px",
          fontWeight: 700,
          color: "#2b2622",
          marginBottom: "14px",
        }}
      >
        <span style={{ maxWidth: "44%" }}>{t.poleLow(parameterId)}</span>
        <span style={{ maxWidth: "44%", textAlign: "end" }}>{t.poleHigh(parameterId)}</span>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        {STEPS.map((v) => {
          const on = value === v;
          return (
            <button
              key={v}
              onClick={() => onChange(v)}
              style={{
                flex: 1,
                height: "56px",
                borderRadius: "14px",
                border: on ? "none" : "1.5px solid #e6dccb",
                background: on ? "var(--accent, #c0684a)" : "#fff",
                cursor: "pointer",
                boxShadow: on ? "0 4px 12px -4px var(--accent, #c0684a)" : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
