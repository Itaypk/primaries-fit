import { useI18n } from "../i18n";

/** Quiz progress: "Question N of M" + a filled bar. */
export function ProgressBar({
  step,
  total,
  pct,
}: {
  step: number;
  total: number;
  pct: number;
}) {
  const { t } = useI18n();
  return (
    <div style={{ flex: "none", padding: "0 22px 12px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "12.5px",
          fontWeight: 600,
          color: "#8a7f6f",
          marginBottom: "7px",
        }}
      >
        <span>
          {t.ui.quiz.stepOf} {step} {t.ui.quiz.of} {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div style={{ height: "7px", borderRadius: "999px", background: "#e7dccb", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            borderRadius: "999px",
            width: `${pct}%`,
            background: "var(--accent, #c0684a)",
            transition: "width .3s",
          }}
        />
      </div>
    </div>
  );
}
