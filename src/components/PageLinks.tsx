import { Link } from "react-router-dom";
import { useI18n } from "../i18n";

const linkStyle = {
  color: "var(--accent-ink, #295c59)",
  fontWeight: 700,
  textDecoration: "none",
  fontSize: "14px",
};

/** Cross-links between the static editorial pages (and home). `hide` drops the
 *  link to the page you're already on ("home" on the chooser). */
export function PageLinks({ hide }: { hide?: "about" | "faq" | "home" }) {
  const { t } = useI18n();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px 18px",
        marginTop: "26px",
        paddingTop: "18px",
        borderTop: "1px solid #e2d6c4",
      }}
    >
      {hide !== "home" && <Link to="/" style={linkStyle}>{t.ui.nav.home}</Link>}
      {hide !== "about" && <Link to="/about" style={linkStyle}>{t.ui.nav.about}</Link>}
      {hide !== "faq" && <Link to="/faq" style={linkStyle}>{t.ui.nav.faq}</Link>}
    </div>
  );
}
