import { useI18n } from "../i18n";
import { useEvent } from "../data/eventContext";

/**
 * "This primary already happened — you're exploring the archive" banner. Driven
 * purely by `meta.status`: renders nothing unless the loaded event is `past`, so
 * it can be dropped into any event screen unconditionally. The questionnaire
 * still works for a past race; this only sets the expectation that the result is
 * historical, not live.
 */
export function PastEventNotice() {
  const { t, locale } = useI18n();
  const { event } = useEvent();
  if (event.meta.status !== "past") return null;

  const heldOn = new Date(event.meta.date).toLocaleDateString(
    locale === "he" ? "he-IL" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "13px",
        lineHeight: 1.5,
        color: "#7a6a3a",
        background: "#fbf3e0",
        border: "1px solid #ecdcb8",
        borderRadius: "12px",
        padding: "11px 13px",
        margin: "0 0 16px",
      }}
    >
      <span aria-hidden style={{ flex: "none", fontSize: "15px" }}>🗳️</span>
      <span>{t.ui.pastEvent.banner.replace("{date}", heldOn)}</span>
    </div>
  );
}
