import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import { useMeta } from "../meta";
import { DEFAULT_ACCENT } from "../theme";
import { AppFrame } from "../components/AppFrame";
import { Header } from "../components/Header";
import { PageLinks } from "../components/PageLinks";
import { links } from "../about";

const linkStyle = {
  color: "var(--accent-ink, #295c59)",
  fontWeight: 700,
  textDecoration: "underline",
};

/** The full About page (`/about`). A static, top-level editorial route: how the
 *  ranking works, how positions are sourced, privacy, and neutrality — the
 *  reader-friendly companion to docs/candidate-scoring.md. Content is shared
 *  chrome (src/locales), not event data. */
export function AboutScreen() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const a = t.ui.about;
  useMeta({ title: `${a.title} · ${t.app.name}`, description: a.page.sub, url: "/about", locale });

  return (
    <AppFrame accent={DEFAULT_ACCENT}>
      <Header showBack onBack={() => navigate(-1)} />
      <div className="scr" style={{ flex: 1, overflowY: "auto", padding: "6px 24px 26px" }}>
        <div className="candidate-column">
          <h1 className="serif" style={{ fontSize: "29px", fontWeight: 700, color: "#221e1a", margin: "8px 0 6px" }}>
            {a.title}
          </h1>
          <p style={{ fontSize: "16px", lineHeight: 1.6, color: "#6b6152", margin: "0 0 18px" }}>{a.page.sub}</p>

          {a.page.sections.map((s, i) => (
            <section key={i} style={{ marginBottom: "20px" }}>
              <h2 className="serif" style={{ fontSize: "19px", fontWeight: 700, color: "#2b2622", margin: "0 0 7px" }}>
                {s.heading}
              </h2>
              <p style={{ fontSize: "14.5px", lineHeight: 1.65, color: "#5c5346", margin: 0 }}>{s.body}</p>
            </section>
          ))}

          <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#8a7f6f", margin: "18px 0 0" }}>
            {a.feedback}{" "}
            <a href={`mailto:${links.email}`} style={linkStyle}>{links.email}</a>
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", alignItems: "baseline", marginTop: "10px", fontSize: "14px", color: "#8a7f6f" }}>
            <span>{a.author}</span>
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer" style={linkStyle}>{a.linkedin}</a>
            <a href={links.repo} target="_blank" rel="noopener noreferrer" style={linkStyle}>{a.repo}</a>
          </div>

          <PageLinks hide="about" />
        </div>
      </div>
    </AppFrame>
  );
}
