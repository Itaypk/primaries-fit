import { useEffect } from "react";
import { Link } from "react-router-dom";
import { listEvents } from "../data";
import { useI18n } from "../i18n";
import { DEFAULT_ACCENT } from "../theme";
import { AppFrame } from "../components/AppFrame";
import { Header } from "../components/Header";
import { PageLinks } from "../components/PageLinks";

/** Badge tint per event status. Past races read as muted; an open one leads. */
const STATUS_STYLE: Record<string, { bg: string; ink: string }> = {
  open: { bg: "var(--accent-soft, #dbebe9)", ink: "var(--accent-ink, #295c59)" },
  upcoming: { bg: "#eef1f6", ink: "#556080" },
  past: { bg: "#f0ece2", ink: "#8a7f6f" },
};

/**
 * The event chooser at `/`: every primary in the registry as a card with a
 * status badge, linking into its own flow. The archive of past races and any
 * current one all live here — no event is loaded until one is picked.
 */
export function EventChooser() {
  const { t } = useI18n();
  const events = listEvents();

  useEffect(() => {
    document.title = t.app.name;
  }, [t]);

  return (
    <AppFrame accent={DEFAULT_ACCENT}>
      <Header showBack={false} onBack={() => {}} />
      <div className="scr" style={{ flex: 1, overflowY: "auto", padding: "8px 22px 26px" }}>
        <h1
          className="serif"
          style={{ fontSize: "29px", lineHeight: 1.18, fontWeight: 700, color: "#221e1a", margin: "10px 0 6px" }}
        >
          {t.ui.chooser.title}
        </h1>
        <p style={{ fontSize: "15px", lineHeight: 1.55, color: "#8a7f6f", margin: "0 0 20px" }}>
          {t.ui.chooser.sub}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {events.map((e) => {
            const badge = STATUS_STYLE[e.status] ?? STATUS_STYLE.past;
            const year = e.date.slice(0, 4);
            return (
              <Link
                key={e.id}
                to={`/e/${e.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  background: "#fff",
                  border: "1px solid #eee3d3",
                  borderRadius: "18px",
                  padding: "16px 18px",
                  textDecoration: "none",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "17px", fontWeight: 700, color: "#2b2622" }}>
                    {t.party(e.party)}
                  </div>
                  <div style={{ fontSize: "13.5px", color: "#9a8f7e", marginTop: "2px" }}>{year}</div>
                </div>
                <span
                  style={{
                    flex: "none",
                    padding: "4px 11px",
                    borderRadius: "999px",
                    background: badge.bg,
                    color: badge.ink,
                    fontSize: "12px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.ui.status[e.status]}
                </span>
              </Link>
            );
          })}
        </div>

        <PageLinks hide="home" />
      </div>
    </AppFrame>
  );
}
