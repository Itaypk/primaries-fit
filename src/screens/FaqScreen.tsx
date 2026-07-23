import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import { useMeta } from "../meta";
import { Page } from "../components/Page";
import { PageBody, PageHeading, Card } from "../ui/primitives";

/** The Q&A / FAQ page (`/faq`). Static, top-level route; a flat list of
 *  question/answer pairs from the shared catalog. */
export function FaqScreen() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const f = t.ui.faq;
  useMeta({ title: `${f.title} · ${t.app.name}`, description: f.sub, url: "/faq", locale });

  return (
    <Page showBack onBack={() => navigate(-1)}>
      <PageBody>
        <div className="page-column">
          <PageHeading eyebrow={f.eyebrow} title={f.title} sub={f.sub} />

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {f.items.map((item, i) => (
              <Card key={i}>
                <h2 className="serif" style={{ fontSize: "var(--fs-h3)", fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>
                  {item.q}
                </h2>
                <p style={{ fontSize: "var(--fs-sm)", lineHeight: 1.6, color: "var(--text-body)", margin: 0 }}>{item.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </PageBody>
    </Page>
  );
}
