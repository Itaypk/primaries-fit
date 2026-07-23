import { useI18n } from "../i18n";
import { useEvent } from "../data/eventContext";
import { buildEventResults } from "../view/eventResults";
import { PastEventNotice } from "../components/PastEventNotice";
import { PageBody, PageHeading, Button } from "../ui/primitives";

/**
 * The per-event launcher at `/e/:id`. It is deliberately focused: the event's
 * name, the actions for THIS primary (start the questionnaire, browse its
 * candidates, and — for a past race — see the actual results), plus the privacy
 * note and the methodology disclaimer that qualify its data. The product intro
 * and the "how it works" panels live on the home page, not here.
 */
export function WelcomeScreen({
  onStart,
  onBrowse,
  onSeeResults,
}: {
  onStart: () => void;
  onBrowse: () => void;
  onSeeResults: () => void;
}) {
  const { t } = useI18n();
  const { event } = useEvent();
  const w = t.ui.welcome;
  const a = t.ui.about;
  const fwd = t.dir === "rtl" ? "←" : "→";
  const hasResults = Boolean(buildEventResults(event.results, t));

  return (
    <PageBody>
      <div className="page-column">
        <PastEventNotice />

        <PageHeading
          eyebrow={t.ui.status[event.meta.status]}
          title={t.party(event.meta.party)}
          sub={w.sub}
          size="display"
        />

        <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-faint)", margin: "0 0 14px" }}>{w.time}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Button onClick={onStart}>{w.start}</Button>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
            {hasResults && (
              <Button variant="ghost" onClick={onSeeResults} style={{ width: "auto", padding: "4px 0" }}>
                {w.seeResults} {fwd}
              </Button>
            )}
            <Button variant="ghost" onClick={onBrowse} style={{ width: "auto", padding: "4px 0" }}>
              {w.browse} {fwd}
            </Button>
          </div>
        </div>

        {/* The questionnaire never leaves the browser; say so next to the button
            that starts it. */}
        <p style={{ fontSize: "var(--fs-2xs)", lineHeight: 1.5, color: "var(--text-faint)", margin: "16px 0 0" }}>
          {w.privacy}
        </p>

        {/* The AI-research caveat qualifies every claim the app makes about a
            candidate, so it stays on the event page — a reader who expands
            nothing must still have seen it. */}
        <section
          style={{
            marginTop: 24,
            paddingTop: 18,
            borderTop: "1px solid var(--line-soft)",
            fontSize: "var(--fs-xs)",
            lineHeight: 1.6,
            color: "var(--text-soft)",
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 8 }}>{a.title}</div>
          <p style={{ margin: 0 }}>{a.aiNotice}</p>
        </section>
      </div>
    </PageBody>
  );
}
