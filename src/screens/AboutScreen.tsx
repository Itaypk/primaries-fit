import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import { useMeta } from "../meta";
import { Page } from "../components/Page";
import { PageBody, PageHeading, SectionTitle } from "../ui/primitives";
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
    <Page showBack onBack={() => navigate(-1)}>
      <PageBody>
        <div className="page-column">
          <PageHeading eyebrow={a.eyebrow} title={a.title} sub={a.page.sub} />

          {a.page.sections.map((s, i) => (
            <section key={i} style={{ marginBottom: 20 }}>
              <SectionTitle style={{ marginBottom: 7 }}>{s.heading}</SectionTitle>
              <p style={{ fontSize: "var(--fs-sm)", lineHeight: 1.65, color: "var(--text-body)", margin: 0 }}>{s.body}</p>
            </section>
          ))}

          <p style={{ fontSize: "var(--fs-sm)", lineHeight: 1.6, color: "var(--text-soft)", margin: "18px 0 0" }}>
            {a.feedback}{" "}
            <a href={`mailto:${links.email}`} style={linkStyle}>{links.email}</a>
          </p>
        </div>
      </PageBody>
    </Page>
  );
}
