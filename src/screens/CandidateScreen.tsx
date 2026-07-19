import type { BreakdownRow } from "../view/results";
import { useI18n } from "../i18n";
import { candidatesById } from "../data";

function pctColor(pct: number | null): string {
  if (pct == null) return "#a99e8c";
  if (pct >= 66) return "var(--accent-ink, #7d3d29)";
  if (pct >= 40) return "#b08a52";
  return "#b06a55";
}

export function CandidateScreen({
  candidateId,
  score,
  breakdown,
  onBack,
}: {
  candidateId: string;
  score: number;
  breakdown: BreakdownRow[];
  onBack: () => void;
}) {
  const { t } = useI18n();
  const display = candidatesById[candidateId]?.display ?? {};
  const pct = Math.round(score * 100);

  return (
    <div className="scr" style={{ flex: 1, overflowY: "auto", padding: "4px 24px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "15px", margin: "8px 0 4px" }}>
        <div
          className="serif"
          style={{
            flex: "none",
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: display.avatarBg ?? "#e7ddce",
            color: display.avatarInk ?? "#6b5f4c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: 700,
          }}
        >
          {t.candidateInitial(candidateId)}
        </div>
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

      <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: ".5px", color: "#8a7f6f", marginBottom: "14px" }}>
        {t.ui.candidate.byTopic}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {breakdown.map((b) => (
          <div key={b.parameterId}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "9px" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#2b2622" }}>{b.topic}</span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: pctColor(b.pct) }}>
                {b.pct == null ? "—" : `${b.pct}%`}
              </span>
            </div>
            <div style={{ height: "7px", borderRadius: "999px", background: "#eee3d3", overflow: "hidden", marginBottom: "10px" }}>
              <div
                style={{ height: "100%", borderRadius: "999px", width: `${b.pct ?? 0}%`, background: "var(--accent, #c0684a)" }}
              />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ flex: 1, background: "#fff", border: "1px solid #eee3d3", borderRadius: "12px", padding: "9px 11px" }}>
                <div style={{ fontSize: "11px", color: "#a99e8c", fontWeight: 600, marginBottom: "2px" }}>
                  {t.ui.candidate.yourStance}
                </div>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#2b2622" }}>{b.you}</div>
              </div>
              <div style={{ flex: 1, background: "#fff", border: "1px solid #eee3d3", borderRadius: "12px", padding: "9px 11px" }}>
                <div style={{ fontSize: "11px", color: "#a99e8c", fontWeight: 600, marginBottom: "2px" }}>
                  {t.ui.candidate.theirStance}
                </div>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#2b2622" }}>{b.candidate}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
  );
}
