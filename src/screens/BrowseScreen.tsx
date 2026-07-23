import { useMemo } from "react";
import { useI18n } from "../i18n";
import { useEvent } from "../data/eventContext";
import { Avatar } from "../components/Avatar";
import { PageBody, PageHeading, Card, Button, Pill } from "../ui/primitives";

/** Browse every candidate without taking the questionnaire. No scores here —
 *  there's no voter to score against — so this is a plain, unranked directory
 *  that leads into the same candidate detail screen (in its browsing mode). */
export function BrowseScreen({
  onSelect,
  onStart,
}: {
  onSelect: (candidateId: string) => void;
  onStart: () => void;
}) {
  const { t, locale } = useI18n();
  const { event } = useEvent();

  // Alphabetical by the displayed name, so the order asserts no ranking.
  const ordered = useMemo(
    () =>
      [...event.candidates].sort((a, b) =>
        t.candidateName(a.id).localeCompare(t.candidateName(b.id), locale === "he" ? "he" : "en"),
      ),
    [event, locale, t],
  );

  return (
    <PageBody>
      <PageHeading title={t.ui.browse.title} sub={t.ui.browse.sub} />

      <div className="results-grid">
        {ordered.map((c) => (
          <Card
            key={c.id}
            onClick={() => onSelect(c.id)}
            padding="13px 15px"
            style={{ display: "flex", alignItems: "center", gap: 13 }}
          >
            <Avatar candidateId={c.id} size={46} radius={14} fontSize={19} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "var(--fs-body-lg)", fontWeight: 700, color: "var(--text)" }}>
                {t.candidateName(c.id)}
              </div>
              <div
                style={{
                  fontSize: "var(--fs-xs)",
                  color: "var(--text-soft)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {t.candidateTagline(c.id)}
              </div>
            </div>
            {c.display?.limitedRecord && (
              <Pill tone="neutral" style={{ flex: "none", padding: "2px 8px", fontSize: "10.5px" }}>
                {t.ui.results.limitedRecord}
              </Pill>
            )}
          </Card>
        ))}
      </div>

      <Button onClick={onStart} style={{ height: 52, marginTop: 20 }}>
        {t.ui.welcome.start}
      </Button>
    </PageBody>
  );
}
