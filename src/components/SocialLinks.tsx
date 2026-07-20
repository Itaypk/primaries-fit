import type { ReactNode } from "react";
import type { CandidateLinks } from "../engine/types";
import { useI18n } from "../i18n";

/** Order links are shown in — most "official" first. */
const ORDER: Array<keyof CandidateLinks> = [
  "website",
  "facebook",
  "instagram",
  "twitter",
  "linkedin",
  "whatsapp",
];

const LABEL: Record<keyof CandidateLinks, string> = {
  website: "Website",
  facebook: "Facebook",
  instagram: "Instagram",
  twitter: "X",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
};

/** Minimal single-path glyphs, sized to the 20×20 viewBox. */
const ICON: Record<keyof CandidateLinks, ReactNode> = {
  website: (
    <path d="M10 1a9 9 0 100 18 9 9 0 000-18zm0 2c1.3 0 2.9 2 3.4 5H6.6C7.1 5 8.7 3 10 3zM6.3 10c0-.7 0-1.4.1-2h7.2c.1.6.1 1.3.1 2s0 1.4-.1 2H6.4c-.1-.6-.1-1.3-.1-2zm.3 4h6.8C12.9 16 11.3 17 10 17s-2.9-1-3.4-3zM4.4 12H3.1a7 7 0 010-4h1.3c-.1.6-.1 1.3-.1 2s0 1.4.1 2zm11.2 0c.1-.6.1-1.3.1-2s0-1.4-.1-2h1.3a7 7 0 010 4h-1.3z" />
  ),
  facebook: (
    <path d="M18 10a8 8 0 10-9.25 7.9v-5.59H6.72V10h2.03V8.24c0-2 1.2-3.11 3.02-3.11.87 0 1.79.16 1.79.16v1.97h-1.01c-.99 0-1.3.62-1.3 1.25V10h2.21l-.35 2.31h-1.86v5.59A8 8 0 0018 10z" />
  ),
  instagram: (
    <path d="M10 5.4A4.6 4.6 0 1014.6 10 4.6 4.6 0 0010 5.4zm0 7.6A3 3 0 1113 10a3 3 0 01-3 3zm4.8-7.8a1.07 1.07 0 11-1.07-1.07A1.07 1.07 0 0114.8 5.2zM17.8 6.3a5.3 5.3 0 00-1.45-3.75A5.3 5.3 0 0012.6 1.1c-1.48-.08-5.92-.08-7.4 0A5.3 5.3 0 001.45 2.55 5.3 5.3 0 000 6.3c-.08 1.48-.08 5.92 0 7.4a5.3 5.3 0 001.45 3.75 5.3 5.3 0 003.75 1.45c1.48.08 5.92.08 7.4 0a5.3 5.3 0 003.75-1.45 5.3 5.3 0 001.45-3.75c.08-1.48.08-5.92 0-7.4zm-1.9 9a3 3 0 01-1.7 1.7c-1.18.47-3.98.36-5.28.36s-4.1.1-5.28-.36a3 3 0 01-1.7-1.7c-.47-1.18-.36-3.98-.36-5.28s-.1-4.1.36-5.28a3 3 0 011.7-1.7C4.72 3.27 7.52 3.38 8.82 3.38s4.1-.1 5.28.36a3 3 0 011.7 1.7c.47 1.18.36 3.98.36 5.28s.11 4.1-.36 5.28z" />
  ),
  twitter: (
    <path d="M14.9 2h2.6l-5.7 6.5L18.5 18h-5.2l-4.1-5.4L4.5 18H1.9l6.1-7L1.3 2h5.3l3.7 4.9L14.9 2zm-.9 14.4h1.4L6.1 3.5H4.6l9.4 12.9z" />
  ),
  linkedin: (
    <path d="M17 1H3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V3a2 2 0 00-2-2zM6.3 16H3.8V8h2.5v8zM5 6.7a1.45 1.45 0 111.45-1.45A1.45 1.45 0 015 6.7zM16.2 16h-2.5v-3.9c0-.93-.02-2.13-1.3-2.13s-1.5 1-1.5 2.06V16H8.4V8h2.4v1.1h.03a2.63 2.63 0 012.37-1.3c2.53 0 3 1.67 3 3.84V16z" />
  ),
  whatsapp: (
    <path d="M10 1.7a8.24 8.24 0 00-7 12.6L1.7 18.3l4.1-1.3A8.24 8.24 0 1010 1.7zm0 15a6.73 6.73 0 01-3.44-.94l-.25-.15-2.44.78.78-2.38-.16-.25A6.76 6.76 0 1110 16.7zm3.7-5.06c-.2-.1-1.2-.6-1.38-.66s-.32-.1-.46.1-.53.66-.65.8-.24.15-.44.05a5.5 5.5 0 01-1.63-1 6.1 6.1 0 01-1.13-1.4c-.12-.2 0-.31.09-.41s.2-.24.3-.36a1.4 1.4 0 00.2-.34.37.37 0 000-.35c0-.1-.46-1.1-.63-1.51s-.33-.34-.46-.35h-.4a.75.75 0 00-.54.25 2.28 2.28 0 00-.71 1.69 3.94 3.94 0 00.83 2.1 9.05 9.05 0 003.47 3.06 11.6 11.6 0 001.16.43 2.79 2.79 0 001.28.08 2.09 2.09 0 001.37-.97 1.7 1.7 0 00.12-.96c-.05-.09-.18-.14-.38-.24z" />
  ),
};

/** Row of social/contact links for a candidate, when the party record has them. */
export function SocialLinks({ links }: { links?: CandidateLinks }) {
  const { t } = useI18n();
  const present = ORDER.filter((k) => links?.[k]);
  if (!present.length) return null;

  return (
    <div style={{ margin: "22px 0 4px" }}>
      <div
        style={{
          fontSize: "13px",
          fontWeight: 800,
          letterSpacing: ".5px",
          color: "#8a7f6f",
          marginBottom: "12px",
        }}
      >
        {t.ui.candidate.links}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {present.map((k) => (
          <a
            key={k}
            href={links![k]}
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label={LABEL[k]}
            title={LABEL[k]}
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "13px",
              border: "1px solid #eee3d3",
              background: "#fff",
              color: "var(--accent-ink, #7d3d29)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              {ICON[k]}
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
