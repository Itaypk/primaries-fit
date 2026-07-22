import { useMemo } from "react";
import { useI18n } from "../i18n";
import { useEvent } from "../data/eventContext";
import { Avatar } from "../components/Avatar";

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
    <div className="scr" style={{ flex: 1, overflowY: "auto", padding: "4px 22px 24px" }}>
      <h2
        className="serif"
        style={{ fontSize: "27px", lineHeight: 1.2, fontWeight: 700, color: "#221e1a", margin: "6px 0 6px" }}
      >
        {t.ui.browse.title}
      </h2>
      <p style={{ fontSize: "14px", lineHeight: 1.55, color: "#8a7f6f", margin: "0 0 18px" }}>
        {t.ui.browse.sub}
      </p>

      <div className="results-grid">
        {ordered.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "13px",
              background: "#fff",
              border: "1px solid #eee3d3",
              borderRadius: "18px",
              padding: "13px 15px",
              cursor: "pointer",
            }}
          >
            <Avatar candidateId={c.id} size={46} radius={14} fontSize={19} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#2b2622" }}>
                {t.candidateName(c.id)}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#9a8f7e",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {t.candidateTagline(c.id)}
              </div>
            </div>
            {c.display?.limitedRecord && (
              <span
                style={{
                  flex: "none",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: "#f0ece2",
                  color: "#8a7f6f",
                  fontSize: "10.5px",
                  fontWeight: 700,
                }}
              >
                {t.ui.results.limitedRecord}
              </span>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        style={{
          width: "100%",
          height: "52px",
          marginTop: "20px",
          border: "none",
          borderRadius: "14px",
          background: "var(--accent, #c0684a)",
          color: "#fff",
          fontSize: "16px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {t.ui.welcome.start}
      </button>
    </div>
  );
}
