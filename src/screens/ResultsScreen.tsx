import type { CSSProperties } from "react";
import type { CandidateScore } from "../engine/types";
import { useI18n } from "../i18n";
import { useEvent } from "../data/eventContext";
import { reasonsFor } from "../view/results";
import { outcomeRankOf } from "../view/eventResults";
import { Avatar } from "../components/Avatar";
import { ShareButton } from "../components/ShareButton";
import { PastEventNotice } from "../components/PastEventNotice";
import type { ViewMode } from "./EventLayout";

const MODES: ViewMode[] = ["match", "balanced", "close"];

export function ResultsScreen({
  ranked,
  regional = [],
  voterRegion = null,
  topMatchId,
  shareUrl,
  viewMode,
  onViewMode,
  openInfo,
  onToggleInfo,
  onSelect,
  onRestart,
}: {
  ranked: CandidateScore[];
  /** The voter's district slate (match order) — shown as its own section under
   *  the national list when the voter picked a district that has candidates. */
  regional?: CandidateScore[];
  voterRegion?: string | null;
  /** The voter's single best match by score, regardless of the presentation
   *  view mode — used to compare against a past race's actual outcome. */
  topMatchId?: string;
  /** Link that reproduces this ranking (answers encoded in `?a=`). */
  shareUrl?: string;
  viewMode: ViewMode;
  onViewMode: (mode: ViewMode) => void;
  openInfo: string | null;
  onToggleInfo: (candidateId: string) => void;
  onSelect: (candidateId: string) => void;
  onRestart: () => void;
}) {
  const { t, locale } = useI18n();
  const { candidatesById, event } = useEvent();

  const researchedOn = new Date(event.meta.dataUpdated).toLocaleDateString(
    locale === "he" ? "he-IL" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );

  // For a past race, where the voter's best match actually landed in the vote.
  const outcomeRank =
    event.meta.status === "past" ? outcomeRankOf(topMatchId, event.results) : null;
  const methodology = event.meta.methodology;

  // Two-ballot events: the national list gets a heading and the voter's
  // district slate follows as its own section.
  const hasRegional = regional.length > 0 && !!voterRegion;
  const sectionHeading: CSSProperties = {
    fontSize: "19px",
    lineHeight: 1.25,
    fontWeight: 700,
    color: "#221e1a",
    margin: "0 0 12px",
  };

  return (
    <div className="scr" style={{ flex: 1, overflowY: "auto", padding: "4px 22px 24px" }}>
      <PastEventNotice />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <h2
          className="serif"
          style={{ fontSize: "27px", lineHeight: 1.2, fontWeight: 700, color: "#221e1a", margin: "6px 0 6px" }}
        >
          {t.ui.results.title}
        </h2>
        <ShareButton url={shareUrl} />
      </div>
      <p style={{ fontSize: "14px", lineHeight: 1.55, color: "#8a7f6f", margin: "0 0 12px" }}>
        {t.ui.results.sub}
      </p>

      {/* On a past race, ground the ranking in what actually happened: where the
          voter's best match landed in the real vote. */}
      {outcomeRank != null && topMatchId && (
        <p
          style={{
            fontSize: "13px",
            lineHeight: 1.55,
            color: "var(--accent-ink, #295c59)",
            background: "var(--accent-soft, #dbebe9)",
            borderRadius: "12px",
            padding: "10px 12px",
            margin: "0 0 12px",
          }}
        >
          {t.ui.results.compareToOutcome
            .replace("{name}", t.candidateName(topMatchId))
            .replace("{rank}", String(outcomeRank))}
        </p>
      )}

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
        {t.ui.results.aiNotice}{" "}
        {/* Published on primary day, so "how current is this?" is a fair
            question a reader shouldn't have to guess at. */}
        <span style={{ color: "#a99e8c" }}>
          {t.ui.results.dataAsOf.replace("{date}", researchedOn)}
        </span>
        {/* Per-event sourcing methodology, when the event declares one. */}
        {methodology && (
          <>
            {" "}
            <a
              href={methodology}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent-ink, #295c59)", fontWeight: 700, textDecoration: "underline" }}
            >
              {t.ui.results.methodology}
            </a>
          </>
        )}
      </p>

      {/* Presentation modes, not scoring modes — every one of these reorders or
          filters a list whose scores are already fixed (engine/postRank.ts). */}
      <div style={{ marginBottom: viewMode === "match" ? "18px" : "10px" }}>
        <div
          style={{
            fontSize: "11.5px",
            fontWeight: 700,
            letterSpacing: ".5px",
            textTransform: "uppercase",
            color: "#a99e8c",
            marginBottom: "7px",
          }}
        >
          {t.ui.results.viewLabel}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
          {MODES.map((mode) => {
            const active = mode === viewMode;
            return (
              <button
                key={mode}
                onClick={() => onViewMode(mode)}
                aria-pressed={active}
                style={{
                  height: "33px",
                  padding: "0 14px",
                  borderRadius: "999px",
                  border: `1px solid ${active ? "var(--accent, #3f8a86)" : "#e2d6c4"}`,
                  background: active ? "var(--accent-soft, #dbebe9)" : "#fff",
                  color: active ? "var(--accent-ink, #295c59)" : "#6b6152",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {t.ui.results.view[mode]}
              </button>
            );
          })}
        </div>
      </div>

      {viewMode !== "match" && (
        <p style={{ fontSize: "12.5px", lineHeight: 1.55, color: "#8a7f6f", margin: "0 0 18px" }}>
          {viewMode === "balanced"
            ? t.ui.results.viewNote.balanced
            : t.ui.results.viewNote.close.replace("{count}", String(ranked.length))}
        </p>
      )}

      {hasRegional && <h3 className="serif" style={sectionHeading}>{t.ui.results.nationalList}</h3>}

      <div className="results-grid">
        {/* Only the match-ordered list has a "best match" at the top. In the
            balanced and shuffled views position carries no such claim, so
            highlighting the first row would assert something untrue. */}
        {ranked.map((c, i) => card(c, i === 0 && viewMode === "match"))}
      </div>

      {hasRegional && (
        <>
          <h3 className="serif" style={{ ...sectionHeading, margin: "26px 0 12px" }}>
            {t.ui.results.regionalList.replace("{region}", t.region(voterRegion ?? ""))}
          </h3>
          {/* District slates are short; they stay in plain match order — the
              presentation view modes above apply to the national list only. */}
          <div className="results-grid">{regional.map((c) => card(c, false))}</div>
        </>
      )}

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

  function card(c: CandidateScore, isTop: boolean) {
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
                <Avatar candidateId={c.candidateId} size={52} radius={16} fontSize={22} />
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
  }
}
