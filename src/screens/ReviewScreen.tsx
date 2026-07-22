import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useI18n } from "../i18n";
import { useEvent } from "../data/eventContext";
import { buildReview, type ReviewCell } from "../view/review";
import { ConfidenceDot, sourceLabel } from "../view/confidence";

/** Tint a cell by its data-quality state — low confidence and missing sources
 *  are the two things a reviewer scans for, so they read at a glance. */
function cellTint(cell: ReviewCell): string {
  if (!cell.hasPosition) return "#f6f2ea";
  if (cell.lacksSource) return "#f7e4dd";
  if (cell.lowConfidence) return "#fbf3e0";
  return "#fff";
}

/** Compact value label for a matrix cell: the number for scalar/valence, the
 *  option count for a set. The full breakdown lives in the detail panel. */
function cellValue(value: number | string[] | undefined): string {
  if (value === undefined) return "·";
  if (Array.isArray(value)) return String(value.length);
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

/**
 * Unlisted reviewer view. Renders every candidate × parameter of the loaded
 * event's evidence sidecar as one scannable grid, flagging low-confidence and
 * missing-source cells and limited-record candidates, with each cell's
 * rationale and sources one click away. Pure read — no scoring, no auth.
 */
export function ReviewScreen() {
  const { t } = useI18n();
  const { event, parametersById } = useEvent();
  const vm = useMemo(() => buildReview(event), [event]);
  const r = t.ui.review;

  const [issuesOnly, setIssuesOnly] = useState(false);
  const [open, setOpen] = useState<string | null>(null); // `${candidateId}:${parameterId}`

  const rows = issuesOnly
    ? vm.rows.filter((row) => row.issueCount > 0 || row.limitedRecord)
    : vm.rows;

  return (
    <div className="scr" style={{ flex: 1, overflowY: "auto", padding: "6px 20px 24px" }}>
      <h2 className="serif" style={{ fontSize: "24px", fontWeight: 700, color: "#221e1a", margin: "6px 0 4px" }}>
        {r.title} · {t.party(event.meta.party)}
      </h2>
      <p style={{ fontSize: "13px", lineHeight: 1.55, color: "#8a7f6f", margin: "0 0 14px" }}>{r.sub}</p>

      {/* Flag tallies — the health of the dataset in one line. */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "12px" }}>
        <Tally label={`${vm.summary.candidates} × ${vm.summary.parameters}`} tone="plain" />
        <Tally label={`${vm.summary.lowConfidence} ${r.flags.low}`} tone={vm.summary.lowConfidence ? "warn" : "ok"} />
        <Tally label={`${vm.summary.lacksSource} ${r.flags.missing}`} tone={vm.summary.lacksSource ? "bad" : "ok"} />
        <Tally label={`${vm.summary.limitedRecord} ${r.flags.limited}`} tone={vm.summary.limitedRecord ? "warn" : "ok"} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <button
          onClick={() => setIssuesOnly((v) => !v)}
          aria-pressed={issuesOnly}
          style={{
            height: "31px",
            padding: "0 13px",
            borderRadius: "999px",
            border: `1px solid ${issuesOnly ? "var(--accent, #3f8a86)" : "#e2d6c4"}`,
            background: issuesOnly ? "var(--accent-soft, #dbebe9)" : "#fff",
            color: issuesOnly ? "var(--accent-ink, #295c59)" : "#6b6152",
            fontSize: "12.5px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {r.issuesOnly}
        </button>
        <span style={{ fontSize: "11.5px", color: "#a99e8c" }}>{r.legend}</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "separate", borderSpacing: "3px", fontSize: "12px" }}>
          <thead>
            <tr>
              <th style={{ ...headCell, textAlign: "start", position: "sticky", insetInlineStart: 0, background: "#faf6ef", zIndex: 1 }}>
                {r.candidateCol}
              </th>
              {vm.parameters.map((p) => (
                <th key={p.id} style={{ ...headCell, minWidth: "46px" }} title={t.param(p.id)}>
                  {t.param(p.id)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const openCell =
                open && open.startsWith(`${row.candidateId}:`)
                  ? row.cells.find((c) => `${c.candidateId}:${c.parameterId}` === open)
                  : undefined;
              return (
                <ReviewBody
                  key={row.candidateId}
                  name={t.candidateName(row.candidateId)}
                  limitedRecord={row.limitedRecord}
                  limitedLabel={r.flags.limited}
                  cells={row.cells}
                  colCount={vm.parameters.length + 1}
                  open={open}
                  onToggle={(key) => setOpen((cur) => (cur === key ? null : key))}
                  detail={
                    openCell && (
                      <CellDetail
                        cell={openCell}
                        paramLabel={t.param(openCell.parameterId)}
                        isSet={parametersById[openCell.parameterId]?.kind === "set"}
                        optionLabel={(o) => t.option(o)}
                        confidenceLabel={openCell.confidence ? t.ui.candidate.confidence[openCell.confidence] : r.noEvidence}
                        sourcesLabel={t.ui.candidate.sources}
                        noSourcesLabel={r.noSources}
                        noPositionLabel={r.noPosition}
                      />
                    )
                  }
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const headCell: CSSProperties = {
  fontSize: "10.5px",
  fontWeight: 700,
  color: "#8a7f6f",
  textAlign: "center",
  padding: "4px 5px",
  verticalAlign: "bottom",
  lineHeight: 1.15,
};

function Tally({ label, tone }: { label: string; tone: "plain" | "ok" | "warn" | "bad" }) {
  const bg =
    tone === "bad" ? "#f7e4dd" : tone === "warn" ? "#fbf3e0" : tone === "ok" ? "#e9efe6" : "#f0ece2";
  const ink =
    tone === "bad" ? "#a4503a" : tone === "warn" ? "#7a6a3a" : tone === "ok" ? "#4f6b4a" : "#8a7f6f";
  return (
    <span style={{ padding: "3px 10px", borderRadius: "999px", background: bg, color: ink, fontSize: "11.5px", fontWeight: 700 }}>
      {label}
    </span>
  );
}

/** One candidate row plus its optional expanded detail row. */
function ReviewBody({
  name,
  limitedRecord,
  limitedLabel,
  cells,
  colCount,
  open,
  onToggle,
  detail,
}: {
  name: string;
  limitedRecord: boolean;
  limitedLabel: string;
  cells: ReviewCell[];
  colCount: number;
  open: string | null;
  onToggle: (key: string) => void;
  detail: React.ReactNode;
}) {
  return (
    <>
      <tr>
        <th
          scope="row"
          style={{
            textAlign: "start",
            fontSize: "12px",
            fontWeight: 700,
            color: "#2b2622",
            padding: "4px 8px",
            whiteSpace: "nowrap",
            position: "sticky",
            insetInlineStart: 0,
            background: "#faf6ef",
            zIndex: 1,
          }}
        >
          {name}
          {limitedRecord && (
            <span
              style={{
                display: "inline-block",
                marginInlineStart: "6px",
                padding: "1px 6px",
                borderRadius: "999px",
                background: "#f0ece2",
                color: "#8a7f6f",
                fontSize: "9.5px",
                fontWeight: 700,
                verticalAlign: "middle",
              }}
            >
              {limitedLabel}
            </span>
          )}
        </th>
        {cells.map((cell) => {
          const key = `${cell.candidateId}:${cell.parameterId}`;
          const isOpen = open === key;
          return (
            <td key={cell.parameterId} style={{ padding: 0 }}>
              <button
                onClick={() => cell.hasEvidence && onToggle(key)}
                title={cell.hasPosition ? undefined : "—"}
                style={{
                  width: "100%",
                  minWidth: "40px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  border: isOpen ? "1.5px solid var(--accent, #3f8a86)" : "1px solid #eee3d3",
                  borderRadius: "7px",
                  background: cellTint(cell),
                  color: cell.hasPosition ? "#4a4238" : "#c9beac",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  cursor: cell.hasEvidence ? "pointer" : "default",
                }}
              >
                <ConfidenceDot level={cell.confidence} />
                {cellValue(cell.value)}
                {cell.lacksSource && <span style={{ color: "#c0684a", fontWeight: 800 }}>!</span>}
              </button>
            </td>
          );
        })}
      </tr>
      {detail && (
        <tr>
          <td colSpan={colCount} style={{ padding: "0 3px 6px" }}>
            {detail}
          </td>
        </tr>
      )}
    </>
  );
}

function CellDetail({
  cell,
  paramLabel,
  isSet,
  optionLabel,
  confidenceLabel,
  sourcesLabel,
  noSourcesLabel,
  noPositionLabel,
}: {
  cell: ReviewCell;
  paramLabel: string;
  isSet: boolean;
  optionLabel: (o: string) => string;
  confidenceLabel: string;
  sourcesLabel: string;
  noSourcesLabel: string;
  noPositionLabel: string;
}) {
  const valueText =
    cell.value === undefined
      ? noPositionLabel
      : isSet && Array.isArray(cell.value)
        ? cell.value.map(optionLabel).join(" · ")
        : cellValue(cell.value);

  return (
    <div
      style={{
        background: "#faf7f0",
        border: "1px dashed #e7dccb",
        borderRadius: "12px",
        padding: "11px 13px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#2b2622" }}>{paramLabel}</span>
        <span style={{ color: "#c9beac" }}>·</span>
        <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#6b6152" }}>{valueText}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11.5px", color: "#8a7f6f" }}>
          <ConfidenceDot level={cell.confidence} />
          {confidenceLabel}
        </span>
      </div>
      {cell.rationale && (
        <div style={{ fontSize: "12.5px", lineHeight: 1.5, color: "#4a4238" }}>{cell.rationale}</div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginTop: "8px" }}>
        <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#a99e8c" }}>{sourcesLabel}</span>
        {cell.sources.length ? (
          cell.sources.map((src, i) => (
            <a key={i} href={src} target="_blank" rel="noreferrer" style={{ fontSize: "11.5px" }}>
              {sourceLabel(src)}
            </a>
          ))
        ) : (
          <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#c0684a" }}>{noSourcesLabel}</span>
        )}
      </div>
    </div>
  );
}
