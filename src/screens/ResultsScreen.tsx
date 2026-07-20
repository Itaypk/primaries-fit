import type { CandidateScore } from "../engine/types";
import { useI18n } from "../i18n";
import { candidatesById } from "../data";
import { reasonsFor } from "../view/results";

export function ResultsScreen({
  ranked,
  openInfo,
  onToggleInfo,
  onSelect,
  onRestart,
}: {
  ranked: CandidateScore[];
  openInfo: string | null;
  onToggleInfo: (candidateId: string) => void;
  onSelect: (candidateId: string) => void;
  onRestart: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="scr" style={{ flex: 1, overflowY: "auto", padding: "4px 22px 24px" }}>
      <h2
        className="serif"
        style={{ fontSize: "27px", lineHeight: 1.2, fontWeight: 700, color: "#221e1a", margin: "6px 0 6px" }}
      >
        {t.ui.results.title}
      </h2>
      <p style={{ fontSize: "14px", lineHeight: 1.55, color: "#8a7f6f", margin: "0 0 12px" }}>
        {t.ui.results.sub}
      </p>

      {/* The ranking is only as good as the researched positions behind it, so
          the caveat sits with the ranking rather than only on the welcome
          screen — this is the screen people screenshot and share. */}
      <p
        style={{
          fontSize: "12.5px",
          lineHeight: 1.55,
          color: "#8a7f6f",
          background: "#fbf6ee",
          border: "1px solid #eee3d3",
          borderRadius: "12px",
          padding: "10px 12px",
          margin: "0 0 18px",
        }}
      >
        {t.ui.results.aiNotice}
      </p>

      <div className="results-grid">
        {ranked.map((c, i) => {
          const isTop = i === 0;
          const display = candidatesById[c.candidateId]?.display ?? {};
          const pct = Math.round(c.score * 100);
          const reasons = reasonsFor(c);
          const open = openInfo === c.candidateId;

          return (
            <div
              key={c.candidateId}
              className={isTop ? "results-card-full" : undefined}
              style={{
                background: "#fff",
                border: isTop ? "2px solid var(--accent, #c0684a)" : "1px solid #eee3d3",
                borderRadius: "22px",
                padding: "17px 17px 15px",
                boxShadow: isTop ? "0 12px 26px -14px var(--accent, #c0684a)" : "none",
              }}
            >
              {isTop && (
                <div
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 800,
                    letterSpacing: ".6px",
                    color: "var(--accent, #c0684a)",
                    marginBottom: "10px",
                  }}
                >
                  ★ {t.ui.results.topMatch}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
                <div
                  className="serif"
                  style={{
                    flex: "none",
                    width: "52px",
                    height: "52px",
                    borderRadius: "16px",
                    background: display.avatarBg ?? "#e7ddce",
                    color: display.avatarInk ?? "#6b5f4c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    fontWeight: 700,
                  }}
                >
                  {t.candidateInitial(c.candidateId)}
                </div>
                <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => onSelect(c.candidateId)}>
                  <div style={{ fontSize: "17px", fontWeight: 700, color: "#2b2622" }}>
                    {t.candidateName(c.candidateId)}
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
                    {t.candidateTagline(c.candidateId)}
                  </div>
                  {display.limitedRecord && (
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: "5px",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: "#f0ece2",
                        color: "#8a7f6f",
                        fontSize: "10.5px",
                        fontWeight: 700,
                        letterSpacing: ".2px",
                      }}
                    >
                      {t.ui.results.limitedRecord}
                    </span>
                  )}
                </div>
                <div style={{ flex: "none", textAlign: "center" }}>
                  <div
                    className="serif"
                    style={{ fontSize: "23px", fontWeight: 800, color: "var(--accent-ink, #7d3d29)", lineHeight: 1 }}
                  >
                    {pct}%
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#a99e8c", fontWeight: 600 }}>{t.ui.results.match}</div>
                </div>
              </div>

              <div style={{ height: "8px", borderRadius: "999px", background: "#eee3d3", overflow: "hidden", margin: "14px 0 0" }}>
                <div style={{ height: "100%", borderRadius: "999px", width: `${pct}%`, background: "var(--accent, #c0684a)" }} />
              </div>

              <button
                onClick={() => onToggleInfo(c.candidateId)}
                style={{
                  marginTop: "12px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                  background: "none",
                  border: "none",
                  color: "var(--accent-ink, #7d3d29)",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: "1.5px solid var(--accent-ink, #7d3d29)",
                    fontSize: "11px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  i
                </span>
                {t.ui.results.whyMatch} {open ? "▴" : "▾"}
              </button>

              {open && (
                <div
                  style={{
                    marginTop: "12px",
                    paddingTop: "14px",
                    borderTop: "1px dashed #e7dccb",
                    display: "flex",
                    flexDirection: "column",
                    gap: "9px",
                  }}
                >
                  {reasons.map((r, ri) => (
                    <div
                      key={ri}
                      style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#4a4238" }}
                    >
                      <span
                        style={{
                          flex: "none",
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          background: r.kind === "agree" ? "var(--accent, #c0684a)" : "#cdbfa8",
                        }}
                      />
                      {(r.kind === "agree" ? t.ui.results.aligned : t.ui.results.gap) + " · " + t.param(r.parameterId)}
                    </div>
                  ))}
                  <button
                    onClick={() => onSelect(c.candidateId)}
                    style={{
                      alignSelf: "flex-start",
                      marginTop: "4px",
                      background: "none",
                      border: "none",
                      color: "var(--accent, #c0684a)",
                      fontSize: "13.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {t.ui.results.fullBreakdown} →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onRestart}
        style={{
          width: "100%",
          height: "50px",
          marginTop: "20px",
          border: "1px solid #e2d6c4",
          borderRadius: "14px",
          background: "#fff",
          color: "#6b6152",
          fontSize: "15px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {t.ui.results.restart}
      </button>
    </div>
  );
}
