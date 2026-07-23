/**
 * Shared UI primitives. Every screen composes these instead of re-typing the
 * same card / button / pill / heading inline, so a change to the look happens
 * once here rather than in a dozen files. They read the design tokens
 * (src/styles.css :root) through CSS variables — no hardcoded palette here.
 */
import type { ButtonHTMLAttributes, CSSProperties, KeyboardEvent, ReactNode } from "react";

/** The standard scrolling page region: one canonical inset for every screen. */
export function PageBody({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="scr page-body" style={style}>
      {children}
    </div>
  );
}

/**
 * The page's title block: a ballot-style eyebrow (the site-wide signature)
 * over a serif title and an optional lead paragraph. `size="display"` is the
 * larger hero used once per flow (the welcome screen); pages use the default.
 */
export function PageHeading({
  eyebrow,
  title,
  sub,
  size = "title",
  style,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  size?: "title" | "display";
  style?: CSSProperties;
}) {
  return (
    <header style={{ marginBottom: sub ? 18 : 12, ...style }}>
      {eyebrow && <div className="eyebrow" style={{ marginBottom: 12 }}>{eyebrow}</div>}
      <h1
        className="serif"
        style={{
          fontSize: size === "display" ? "var(--fs-display)" : "var(--fs-title)",
          lineHeight: 1.18,
          fontWeight: 700,
          color: "var(--text-strong)",
          margin: 0,
        }}
      >
        {title}
      </h1>
      {sub && (
        <p style={{ fontSize: "var(--fs-body-lg)", lineHeight: 1.6, color: "var(--text-muted)", margin: "10px 0 0" }}>
          {sub}
        </p>
      )}
    </header>
  );
}

/** A serif sub-heading for sections within a page (about sections, card titles). */
export function SectionTitle({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <h2
      className="serif"
      style={{ fontSize: "var(--fs-h2)", fontWeight: 700, color: "var(--text)", margin: 0, ...style }}
    >
      {children}
    </h2>
  );
}

const cardBase: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "var(--r-card)",
  boxShadow: "var(--shadow-card)",
};

/**
 * The white content card. When `onClick` is given it becomes a real,
 * keyboard-operable control (Enter/Space activate, visible focus ring) rather
 * than a bare clickable div.
 */
export function Card({
  children,
  onClick,
  className,
  style,
  padding = "15px 17px",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  padding?: string | number;
}) {
  const interactive = Boolean(onClick);
  const onKey = (e: KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <div
      className={className}
      onClick={onClick}
      onKeyDown={interactive ? onKey : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      style={{ ...cardBase, padding, cursor: interactive ? "pointer" : undefined, ...style }}
    >
      {children}
    </div>
  );
}

type ButtonVariant = "primary" | "ghost";

/** App button. `primary` is the accent-filled full-width CTA; `ghost` is the
 *  quiet text action (the "browse instead" affordance). */
export function Button({
  variant = "primary",
  children,
  style,
  ...rest
}: { variant?: ButtonVariant; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles: Record<ButtonVariant, CSSProperties> = {
    primary: {
      width: "100%",
      height: 56,
      border: "none",
      borderRadius: 16,
      background: "var(--accent, #c0684a)",
      color: "#fff",
      fontSize: "var(--fs-body-lg)",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "var(--shadow-cta)",
    },
    ghost: {
      width: "100%",
      padding: 8,
      border: "none",
      background: "none",
      color: "var(--accent-ink, #7d3d29)",
      fontSize: "var(--fs-sm)",
      fontWeight: 700,
      cursor: "pointer",
    },
  };
  return (
    <button style={{ ...styles[variant], ...style }} {...rest}>
      {children}
    </button>
  );
}

export type PillTone = "accent" | "neutral" | "muted" | "status-open" | "status-upcoming" | "status-past";

const pillTones: Record<PillTone, CSSProperties> = {
  accent: { background: "var(--accent-soft, #f4e5dd)", color: "var(--accent-ink, #7d3d29)" },
  neutral: { background: "var(--surface-sunken)", color: "var(--text-soft)" },
  muted: { background: "var(--surface-sunken)", color: "var(--text-soft)" },
  "status-open": { background: "var(--accent-soft, #dbebe9)", color: "var(--accent-ink, #295c59)" },
  "status-upcoming": { background: "#eef1f6", color: "#556080" },
  "status-past": { background: "#f0ece2", color: "#8a7f6f" },
};

/** A rounded status/label pill. One shape, tone chosen by role. */
export function Pill({
  tone = "neutral",
  children,
  style,
}: {
  tone?: PillTone;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 11px",
        borderRadius: "var(--r-pill)",
        fontSize: "var(--fs-2xs)",
        fontWeight: 700,
        whiteSpace: "nowrap",
        ...pillTones[tone],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
