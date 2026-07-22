import { Link, useLocation } from "react-router-dom";
import { links } from "../about";
import { useI18n } from "../i18n";

/** The site footer: fixed at the bottom of the frame on every screen, it holds
 *  the primary navigation (the header no longer carries a menu) plus a compact
 *  credit. Route-aware — the link for the current page reads as current rather
 *  than being hidden, so the nav is stable everywhere. */
export function SiteFooter() {
  const { t } = useI18n();
  const { pathname } = useLocation();

  const items = [
    { to: "/", label: t.ui.nav.home },
    { to: "/about", label: t.ui.nav.about },
    { to: "/faq", label: t.ui.nav.faq },
  ];

  return (
    <footer className="site-footer">
      <nav aria-label={t.ui.nav.menu}>
        {items.map((it) => (
          <Link key={it.to} to={it.to} aria-current={pathname === it.to ? "page" : undefined}>
            {it.label}
          </Link>
        ))}
      </nav>
      <div className="credit">
        <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
          {t.ui.about.author}
        </a>
        <a href={links.repo} target="_blank" rel="noopener noreferrer">
          {t.ui.about.repo}
        </a>
      </div>
    </footer>
  );
}
