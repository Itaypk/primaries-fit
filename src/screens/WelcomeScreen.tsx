import { useI18n } from "../i18n";
import { AboutFooter } from "../components/AboutFooter";
import { PastEventNotice } from "../components/PastEventNotice";
import { EventOutcome } from "../components/EventOutcome";

export function WelcomeScreen({ onStart, onBrowse }: { onStart: () => void; onBrowse: () => void }) {
  const { t } = useI18n();
  const w = t.ui.welcome;

  return (
    <div
      className="scr"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "8px 26px 26px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PastEventNotice />

      <div className="welcome-layout" style={{ marginTop: "10px" }}>
        <div>
          <div
            style={{
              alignSelf: "flex-start",
              fontSize: "12.5px",
              fontWeight: 700,
              letterSpacing: ".5px",
              color: "var(--accent-ink, #7d3d29)",
              background: "var(--accent-soft, #f4e5dd)",
              padding: "6px 13px",
              borderRadius: "999px",
              display: "inline-block",
            }}
          >
            {t.ui.badge}
          </div>

          <h1
            className="serif"
            style={{
              fontSize: "33px",
              lineHeight: 1.18,
              fontWeight: 700,
              color: "#221e1a",
              margin: "20px 0 14px",
            }}
          >
            {w.title}
          </h1>
          <p style={{ fontSize: "16px", lineHeight: 1.6, color: "#6b6152", margin: 0 }}>
            {w.sub}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "22px" }}>
          {w.steps.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
                background: "#fff",
                border: "1px solid #eee3d3",
                borderRadius: "18px",
                padding: "15px 16px",
              }}
            >
              <div
                style={{
                  flex: "none",
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  background: "var(--accent-soft, #f4e5dd)",
                  color: "var(--accent-ink, #7d3d29)",
                  fontWeight: 700,
                  fontSize: "17px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#2b2622", marginBottom: "2px" }}>
                  {s.title}
                </div>
                <div style={{ fontSize: "14px", lineHeight: 1.5, color: "#8a7f6f" }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: "22px" }} />
      <div style={{ textAlign: "center", fontSize: "13px", color: "#a99e8c", margin: "18px 0 12px" }}>
        {w.time}
      </div>
      <button
        onClick={onStart}
        style={{
          width: "100%",
          height: "56px",
          border: "none",
          borderRadius: "16px",
          background: "var(--accent, #c0684a)",
          color: "#fff",
          fontSize: "17px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 8px 20px -8px var(--accent, #c0684a)",
        }}
      >
        {w.start}
      </button>

      <button
        onClick={onBrowse}
        style={{
          width: "100%",
          marginTop: "12px",
          padding: "8px",
          border: "none",
          background: "none",
          color: "var(--accent-ink, #7d3d29)",
          fontSize: "14.5px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {w.browse} →
      </button>

      {/* The questionnaire never leaves the browser; say so up front, next to
          the button that starts it. */}
      <p style={{ textAlign: "center", fontSize: "12px", lineHeight: 1.5, color: "#a99e8c", margin: "10px 0 0" }}>
        {w.privacy}
      </p>

      {/* For a past race, what actually happened — the vote order vs. the seated
          list. Renders nothing when the event carries no results. */}
      <EventOutcome />

      <AboutFooter />
    </div>
  );
}
