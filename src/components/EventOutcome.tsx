import { useI18n } from "../i18n";
import { useEvent } from "../data/eventContext";
import { buildEventResults } from "../view/eventResults";

/**
 * The "what actually happened" panel for a past event: the vote order and the
 * final seated list side by side, with each seat that diverged from its vote
 * rank flagged and its `reason` prose shown. Renders nothing when the event has
 * no recorded results, so it's safe to mount unconditionally on a past event.
 *
 * This reads the event's `results` metadata only — never a score. The whole
 * point of keeping raw and final distinct is that the seated list is not vote
 * order alone; this panel is where that difference is made legible.
 */
export function EventOutcome() {
  const { t } = useI18n();
  const { event } = useEvent();
  const vm = buildEventResults(event.results, t);
  if (!vm) return null;

  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #eee3d3",
        borderRadius: "18px",
        padding: "18px 18px 16px",
        margin: "22px 0 0",
      }}
    >
      <h3
        className="serif"
        style={{ fontSize: "20px", fontWeight: 700, color: "#221e1a", margin: "0 0 4px" }}
      >
        {t.ui.outcome.title}
      </h3>
      {vm.hasDivergence && (
        <p style={{ fontSize: "13px", lineHeight: 1.55, color: "#8a7f6f", margin: "0 0 14px" }}>
          {t.ui.outcome.sub}
        </p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "18px" }}>
        {vm.raw.length > 0 && (
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <ColumnHeading>{t.ui.outcome.rawColumn}</ColumnHeading>
            <ol style={listStyle}>
              {vm.raw.map((r) => (
                <li key={r.candidateId} style={rowStyle}>
                  <span style={numStyle}>{r.rank}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>{r.name}</span>
                  {r.votes != null && (
                    <span style={{ flex: "none", fontSize: "12px", color: "#a99e8c" }}>
                      {r.votes.toLocaleString()} {t.ui.outcome.votes}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {vm.final.length > 0 && (
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <ColumnHeading>{t.ui.outcome.finalColumn}</ColumnHeading>
            <ol style={listStyle}>
              {vm.final.map((f) => (
                <li key={f.candidateId} style={{ ...rowStyle, flexWrap: "wrap" }}>
                  <span style={numStyle}>{f.seat}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>{f.name}</span>
                  {f.moved && (
                    <span
                      style={{
                        flex: "none",
                        padding: "1px 8px",
                        borderRadius: "999px",
                        background: "var(--accent-soft, #f4e5dd)",
                        color: "var(--accent-ink, #7d3d29)",
                        fontSize: "10.5px",
                        fontWeight: 700,
                      }}
                    >
                      {t.ui.outcome.moved.replace("{rank}", String(f.rawRank))}
                    </span>
                  )}
                  {f.reason && (
                    <div
                      style={{
                        flexBasis: "100%",
                        fontSize: "12px",
                        lineHeight: 1.5,
                        color: "#8a7f6f",
                        marginTop: "3px",
                        paddingInlineStart: "30px",
                      }}
                    >
                      {f.reason}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}

const listStyle = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column" as const,
  gap: "8px",
};

const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  fontSize: "14px",
  color: "#4a4238",
};

const numStyle = {
  flex: "none",
  width: "22px",
  height: "22px",
  borderRadius: "7px",
  background: "#f0ece2",
  color: "#8a7f6f",
  fontSize: "12px",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "11.5px",
        fontWeight: 700,
        letterSpacing: ".5px",
        textTransform: "uppercase",
        color: "#a99e8c",
        marginBottom: "10px",
      }}
    >
      {children}
    </div>
  );
}
