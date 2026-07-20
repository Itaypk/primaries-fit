/**
 * Optional, privacy-preserving visitor analytics.
 * ===============================================
 *
 * Deliberately inert by default: with no `VITE_GOATCOUNTER` set at build time
 * this does nothing and the app makes zero third-party requests — so the
 * privacy promise on the welcome screen holds out of the box.
 *
 * When you do want a unique-visitor count, point it at a GoatCounter site
 * (https://www.goatcounter.com — free for non-commercial use). GoatCounter is
 * chosen because it fits this project: a single script, **no cookies**, no
 * cross-site tracking, and no personal data stored. It counts a unique visit
 * with a salted hash of IP + User-Agent that it rotates daily and never keeps,
 * so there's nothing to consent to under GDPR — and it only ever sees a page
 * hit, never a questionnaire answer (those never leave the browser).
 *
 * To enable: create a site, then build with
 *   VITE_GOATCOUNTER="https://<yourcode>.goatcounter.com/count" npm run build
 * (wire that env into the CI build step in .github/workflows/deploy.yml).
 *
 * Alternatives, if you'd rather keep even the count off a third party:
 *   - Self-host GoatCounter/Umami/Plausible on the same VPS (needs a small
 *     service + datastore — more moving parts than this one line).
 *   - Log-based: turn on Caddy's JSON access log and count unique client IPs
 *     per day offline. Zero client JS, but coarser and it does touch raw IPs.
 */

/** Load the analytics beacon, if one is configured. Call once, after render. */
export function initAnalytics(): void {
  const endpoint = import.meta.env.VITE_GOATCOUNTER as string | undefined;
  if (!endpoint) return;

  // GoatCounter reads its endpoint from the script tag's data attribute and
  // auto-sends one pageview on load. Injected rather than hard-coded in
  // index.html so the "no endpoint = no request" guarantee lives in one place.
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.setAttribute("data-goatcounter", endpoint);
  document.head.appendChild(s);
}
