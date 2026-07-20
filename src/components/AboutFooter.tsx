import { links } from "../about";
import { useI18n } from "../i18n";

const linkStyle = {
  color: "var(--accent-ink, #7d3d29)",
  fontWeight: 700,
  textDecoration: "none",
  borderBottom: "1px solid var(--accent-soft, #f4e5dd)",
};

/** About + provenance, shown at the foot of the welcome screen.
 *
 *  The AI-research caveat is deliberately not tucked behind a disclosure: it
 *  qualifies every claim the app makes about a candidate, so a reader who
 *  never expands anything still has to have seen it. */
export function AboutFooter() {
  const { t } = useI18n();
  const a = t.ui.about;

  return (
    <div
      style={{
        marginTop: "26px",
        paddingTop: "18px",
        borderTop: "1px solid #e2d6c4",
        fontSize: "13px",
        lineHeight: 1.6,
        color: "#8a7f6f",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: ".6px",
          textTransform: "uppercase",
          color: "#a99e8c",
          marginBottom: "8px",
        }}
      >
        {a.title}
      </div>

      <p style={{ margin: "0 0 12px" }}>{a.aiNotice}</p>

      <p style={{ margin: "0 0 12px" }}>
        {a.feedback}{" "}
        <a href={`mailto:${links.email}`} style={linkStyle}>
          {links.email}
        </a>
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", alignItems: "baseline" }}>
        <span>{a.author}</span>
        <a href={links.linkedin} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          {a.linkedin}
        </a>
        <a href={links.repo} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          {a.repo}
        </a>
      </div>
    </div>
  );
}
