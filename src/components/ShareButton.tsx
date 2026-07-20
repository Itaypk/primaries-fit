import { useEffect, useState } from "react";
import { useI18n } from "../i18n";

/** Shares the app, not the result.
 *
 *  Results live entirely in memory — there's no URL that encodes a ranking —
 *  so what gets shared is the tool itself. On mobile this hands off to the
 *  native share sheet (which is where sharing actually happens); elsewhere it
 *  falls back to copying the link. */
export function ShareButton() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function share() {
    const url = window.location.origin + "/";
    const payload = { title: t.app.name, text: t.ui.welcome.sub, url };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        // User dismissed the sheet, or the browser refused — fall through to
        // the clipboard so the button still does something useful.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard blocked (insecure context or denied permission). Nothing
      // sensible left to try; leave the label unchanged rather than lie.
    }
  }

  return (
    <button
      onClick={share}
      aria-live="polite"
      style={{
        flex: "none",
        marginTop: "8px",
        height: "34px",
        padding: "0 14px",
        borderRadius: "999px",
        border: "1px solid #e2d6c4",
        background: copied ? "var(--accent-soft, #dbebe9)" : "#fff",
        color: copied ? "var(--accent-ink, #295c59)" : "#6b6152",
        fontSize: "13px",
        fontWeight: 700,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {copied ? t.ui.results.shared : t.ui.results.share}
    </button>
  );
}
