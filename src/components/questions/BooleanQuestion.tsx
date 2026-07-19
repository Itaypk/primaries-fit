import { useI18n } from "../../i18n";

const selected =
  "flex:1;height:52px;border-radius:14px;border:1.5px solid var(--accent,#c0684a);background:var(--accent,#c0684a);color:#fff;font-size:16px;font-weight:700;cursor:pointer";
const unselected =
  "flex:1;height:52px;border-radius:14px;border:1.5px solid #e6dccb;background:#fff;color:#4a4238;font-size:16px;font-weight:600;cursor:pointer";

/** Parse a CSS-declaration string into a React style object. Keeps the ported
 *  prototype styles legible without repeating each property twice. */
function css(text: string): React.CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of text.split(";")) {
    const [k, v] = decl.split(":");
    if (!k || v == null) continue;
    const prop = k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    out[prop] = v.trim();
  }
  return out as React.CSSProperties;
}

/** Agree / disagree on a statement. */
export function BooleanQuestion({
  statement,
  value,
  onChange,
}: {
  statement: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  const { t } = useI18n();
  return (
    <div>
      <div
        className="serif"
        style={{
          background: "#fff",
          border: "1px solid #eee3d3",
          borderRadius: "18px",
          padding: "20px 18px",
          fontSize: "19px",
          lineHeight: 1.4,
          fontWeight: 600,
          color: "#2b2622",
          marginBottom: "20px",
        }}
      >
        “{statement}”
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        <button onClick={() => onChange(true)} style={css(value === true ? selected : unselected)}>
          {t.ui.quiz.yes}
        </button>
        <button onClick={() => onChange(false)} style={css(value === false ? selected : unselected)}>
          {t.ui.quiz.no}
        </button>
      </div>
    </div>
  );
}
