import { useI18n } from "../../i18n";

const RATINGS = [1, 2, 3, 4, 5];

/** 1..5 importance rating. Does not set a position — only a weight. */
export function ImportanceQuestion({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  const { t } = useI18n();
  return (
    <div>
      <div style={{ display: "flex", gap: "8px" }}>
        {RATINGS.map((n) => {
          const on = value === n;
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              style={{
                flex: 1,
                height: "56px",
                borderRadius: "14px",
                border: on ? "none" : "1.5px solid #e6dccb",
                background: on ? "var(--accent, #c0684a)" : "#fff",
                color: on ? "#fff" : "#8a7f6f",
                fontSize: "18px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "13px",
          color: "#9a8f7e",
          marginTop: "12px",
        }}
      >
        <span>{t.ui.quiz.notImp}</span>
        <span>{t.ui.quiz.veryImp}</span>
      </div>
    </div>
  );
}
