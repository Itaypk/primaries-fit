import { useEffect } from "react";
import { Link } from "react-router-dom";
import { listEvents } from "../data";
import { useI18n } from "../i18n";
import { Page } from "../components/Page";
import { PageBody, PageHeading, SectionTitle, Card, Pill } from "../ui/primitives";
import type { PillTone } from "../ui/primitives";

/** Status → pill tone. Open races lead (accent); past ones read muted. */
const STATUS_TONE: Record<string, PillTone> = {
  open: "status-open",
  upcoming: "status-upcoming",
  past: "status-past",
};

/**
 * The product landing at `/`: what primaries.fit is and how it works, then the
 * list of primaries. The general "how it works" / value-prop content lives here
 * (not on each event page) so the home page introduces the product and every
 * `/e/:id` page stays a focused launcher for one primary.
 */
export function HomeScreen() {
  const { t } = useI18n();
  const events = listEvents();
  const h = t.ui.home;

  useEffect(() => {
    document.title = t.app.name;
  }, [t]);

  return (
    <Page>
      <PageBody>
        <div className="page-column">
          <PageHeading eyebrow={t.ui.badge} title={h.title} sub={h.sub} size="display" />

          <div className="home-split">
            {/* Main object: the primaries themselves, on top. */}
            <section>
              <SectionTitle style={{ marginBottom: 4 }}>{t.ui.chooser.title}</SectionTitle>
              <p style={{ fontSize: "var(--fs-sm)", lineHeight: 1.55, color: "var(--text-soft)", margin: "0 0 14px" }}>
                {t.ui.chooser.sub}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {events.map((e) => {
                  const year = e.date.slice(0, 4);
                  const past = e.status === "past";
                  const fwd = t.dir === "rtl" ? "‹" : "›";
                  return (
                    <Card
                      key={e.id}
                      padding="16px 18px"
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                    >
                      <Link to={`/e/${e.id}`} style={{ flex: 1, minWidth: 0, textDecoration: "none" }}>
                        <div style={{ fontSize: "var(--fs-h3)", fontWeight: 700, color: "var(--text)" }}>
                          {t.party(e.party)}
                        </div>
                        <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-soft)", marginTop: 2 }}>{year}</div>
                      </Link>
                      <div style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                        <Pill tone={STATUS_TONE[e.status] ?? "status-past"}>{t.ui.status[e.status]}</Pill>
                        {/* Past races carry a real outcome; link straight to its
                            standalone page rather than folding it into the flow. */}
                        {past && (
                          <Link
                            to={`/e/${e.id}/outcome`}
                            style={{ fontSize: "var(--fs-sm)", fontWeight: 700, color: "var(--accent-ink, #7d3d29)", whiteSpace: "nowrap" }}
                          >
                            {t.ui.outcome.viewLink} {fwd}
                          </Link>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Supporting side panel: how the tool works. */}
            <aside>
              <SectionTitle style={{ marginBottom: 14 }}>{h.howHeading}</SectionTitle>
              {/* The three steps are an ordered sequence, so the numbered markers
                  encode real order rather than decorate. */}
              <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {h.steps.map((s, i) => (
                  <li key={i}>
                    <Card padding="15px 16px" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div
                        style={{
                          flex: "none",
                          width: 38,
                          height: 38,
                          borderRadius: 12,
                          background: "var(--accent-soft, #f4e5dd)",
                          color: "var(--accent-ink, #7d3d29)",
                          fontWeight: 700,
                          fontSize: "var(--fs-h3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: "var(--fs-body-lg)", fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
                          {s.title}
                        </div>
                        <div style={{ fontSize: "var(--fs-sm)", lineHeight: 1.5, color: "var(--text-soft)" }}>{s.desc}</div>
                      </div>
                    </Card>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </div>
      </PageBody>
    </Page>
  );
}
