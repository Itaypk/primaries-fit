import { useI18n } from "../../i18n";

/** Continuous axis (0..100) with two labelled poles and a live readout. */
export function SliderQuestion({
  parameterId,
  value,
  onChange,
}: {
  parameterId: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  const { t } = useI18n();
  const touched = value != null;
  const readout =
    value == null
      ? t.ui.quiz.dragHint
      : value < 34
        ? t.poleLow(parameterId)
        : value > 66
          ? t.poleHigh(parameterId)
          : t.ui.quiz.middle;

  return (
    <div style={{ marginTop: "6px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "14.5px",
          fontWeight: 700,
          color: "#2b2622",
          marginBottom: "26px",
        }}
      >
        <span style={{ maxWidth: "44%" }}>{t.poleLow(parameterId)}</span>
        <span style={{ maxWidth: "44%", textAlign: "end" }}>{t.poleHigh(parameterId)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value ?? 50}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div
        style={{
          textAlign: "center",
          marginTop: "24px",
          fontSize: "14px",
          fontWeight: 600,
          color: touched ? "var(--accent-ink, #7d3d29)" : "#b8ac99",
        }}
      >
        {readout}
      </div>
    </div>
  );
}
