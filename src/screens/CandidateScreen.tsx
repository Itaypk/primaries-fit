import { useState } from "react";
import type { BreakdownRow } from "../view/results";
import { useI18n } from "../i18n";
import { useEvent } from "../data/eventContext";
import { Avatar } from "../components/Avatar";
import { SocialLinks } from "../components/SocialLinks";
import { ConfidenceDot, sourceLabel } from "../view/confidence";

function pctColor(pct: number | null): string {
  if (pct == null) return "var(--text-faint)";
  if (pct >= 66) return "var(--accent-ink, #7d3d29)";
  if (pct >= 40) return "#b08a52";
  return "#b06a55";
}

export function CandidateScreen({
  candidateId,
  score,
  breakdown,
  onBack,
  browsing = false,
}: {
  candidateId: string;
  score: number;
  breakdown: BreakdownRow[];
  onBack: () => void;
  /** Reached from "browse candidates" rather than a ranking: there's no voter,
   *  so drop the match figure and the "your stance" comparison and just show
   *  the candidate's own positions. */
  browsing?: boolean;
}) {
  const { t } = useI18n();
  const { candidatesById } = useEvent();
  const display = candidatesById[candidateId]?.display ?? {};
  const pct = Math.round(score * 100);
  const [openEvidence, setOpenEvidence] = useState<string | null>(null);

  return (
    <div className="scr" style={{ flex: 1, overflowY: "auto", padding: "4px 24px 24px" }}>
      <div className="page-column">
      <div style={{ display: "flex", alignItems: "center", gap: "15px", margin: "8px 0 4px" }}>
        <Avatar candidateId={candidateId} size={64} radius={20} fontSize={28} />
        <div style={{ flex: 1 }}>
          <div className="serif" style={{ fontSize: "21px", fontWeight: 700, color: "#221e1a" }}>
            {t.candidateName(candidateId)}
          </div>
          <div style={{ fontSize: "14px", color: "#9a8f7e" }}>{t.candidateTagline(candidateId)}</div>
          {display.limitedRecord && (
            <span
              style={{
                display: "inline-block",
                marginTop: "6px",
                padding: "2px 9px",
                borderRadius: "999px",
                background: "#f0ece2",
                color: "#8a7f6f",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              {t.ui.results.limitedRecord}
            </span>
          )}
        </div>
      </div>

      {browsing ? (
        <SocialLinks links={display.links} />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "var(--accent-soft, #f4e5dd)",
            borderRadius: "18px",
            padding: "16px 18px",
            margin: "16px 0 22px",
          }}
        >
          <div
            className="serif"
            style={{ fontSize: "36px", fontWeight: 800, color: "var(--accent-ink, #7d3d29)", lineHeight: 1 }}
          >
            {pct}%
          </div>
          <div style={{ fontSize: "14px", lineHeight: 1.4, color: "var(--accent-ink, #7d3d29)", fontWeight: 600 }}>
            {t.ui.candidate.overallMatch}
          </div>
        </div>
      )}

      <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: ".5px", color: "#8a7f6f", margin: browsing ? "26px 0 14px" : "0 0 14px" }}>
        {t.ui.candidate.byTopic}
      </div>

      <div className="breakdown-grid">
        {breakdown.map((b) => {
          const evidenceOpen = openEvidence === b.parameterId;
          return (
            <div key={b.parameterId}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "9px" }}>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "#2b2622" }}>{b.topic}</span>
                {!browsing && (
                  <span style={{ fontSize: "13px", fontWeight: 700, color: pctColor(b.pct) }}>
                    {b.pct == null ? "—" : `${b.pct}%`}
                  </span>
                )}
              </div>
              {!browsing && (
                <div style={{ height: "7px", borderRadius: "999px", background: "#eee3d3", overflow: "hidden", marginBottom: "10px" }}>
                  <div
                    style={{ height: "100%", borderRadius: "999px", width: `${b.pct ?? 0}%`, background: "var(--accent, #c0684a)" }}
                  />
                </div>
              )}
              <div style={{ display: "flex", gap: "8px" }}>
                {!browsing && (
                  <div style={{ flex: 1, background: "#fff", border: "1px solid #eee3d3", borderRadius: "12px", padding: "9px 11px" }}>
                    <div style={{ fontSize: "11px", color: "#a99e8c", fontWeight: 600, marginBottom: "2px" }}>
                      {t.ui.candidate.yourStance}
                    </div>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#2b2622" }}>{b.you}</div>
                  </div>
                )}
                <div style={{ flex: 1, background: "#fff", border: "1px solid #eee3d3", borderRadius: "12px", padding: "9px 11px" }}>
                  <div style={{ fontSize: "11px", color: "#a99e8c", fontWeight: 600, marginBottom: "2px" }}>
                    {t.ui.candidate.theirStance}
                  </div>
                  <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#2b2622" }}>{b.candidate}</div>
                </div>
              </div>

              {b.confidence && (
                <button
                  onClick={() => setOpenEvidence(evidenceOpen ? null : b.parameterId)}
                  style={{
                    marginTop: "9px",
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#8a7f6f",
                  }}
                >
                  <ConfidenceDot level={b.confidence} />
                  {t.ui.candidate.howWeDecided}
                  <span style={{ color: "#c9beac" }}>·</span>
                  {t.ui.candidate.confidence[b.confidence]}
                  <span style={{ fontSize: "10px" }}>{evidenceOpen ? "▴" : "▾"}</span>
                </button>
              )}

              {evidenceOpen && (
                <div
                  style={{
                    marginTop: "9px",
                    padding: "12px 14px",
                    background: "#faf7f0",
                    border: "1px dashed #e7dccb",
                    borderRadius: "12px",
                  }}
                >
                  <div style={{ fontSize: "13px", lineHeight: 1.5, color: "#4a4238" }}>{b.rationale}</div>
                  {!!b.sources?.length && (
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginTop: "9px" }}>
                      <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#a99e8c" }}>
                        {t.ui.candidate.sources}
                      </span>
                      {b.sources.map((src, si) => (
                        <a key={si} href={src} target="_blank" rel="noreferrer" style={{ fontSize: "11.5px" }}>
                          {sourceLabel(src)}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* In browsing mode the links sit up top in place of the match figure;
          after a quiz they belong here, below the per-topic breakdown. */}
      {!browsing && <SocialLinks links={display.links} />}

      <button
        onClick={onBack}
        style={{
          width: "100%",
          height: "52px",
          marginTop: "24px",
          border: "none",
          borderRadius: "14px",
          background: "var(--accent, #c0684a)",
          color: "#fff",
          fontSize: "16px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {t.ui.candidate.backToResults}
      </button>
      </div>
    </div>
  );
}
