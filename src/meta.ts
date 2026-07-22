/**
 * Runtime document metadata (title + Open Graph). A shared link should preview
 * the primary it points at, not the generic app. On a client-rendered static
 * SPA this updates the tags after load, which covers in-app/JS-executing
 * consumers; crawler-visible unfurls (WhatsApp, X, Facebook don't run JS) need
 * build-time prerendered per-event shells — tracked as a known limitation in
 * docs/roadmap.md. index.html keeps generic fallback tags for that case.
 */
import { useEffect } from "react";
import type { LocaleCode } from "./engine/types";

export interface PageMeta {
  title: string;
  description?: string;
  /** Absolute or path URL this page canonically lives at. */
  url?: string;
  locale?: LocaleCode;
}

/** Find an existing meta/link tag by selector, or create + attach it. */
function tag(selector: string, make: () => HTMLElement): HTMLElement {
  let el = document.head.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = make();
    document.head.appendChild(el);
  }
  return el;
}

function setMeta(attr: "property" | "name", key: string, content: string): void {
  const el = tag(`meta[${attr}="${key}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute(attr, key);
    return m;
  });
  el.setAttribute("content", content);
}

/** Imperatively reflect `meta` onto the document head. Runs on every change. */
export function useMeta(meta: PageMeta): void {
  const { title, description, url, locale } = meta;
  useEffect(() => {
    document.title = title;
    setMeta("property", "og:title", title);

    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
    }
    if (url) {
      const abs = url.startsWith("http") ? url : window.location.origin + url;
      setMeta("property", "og:url", abs);
      const canonical = tag('link[rel="canonical"]', () => {
        const l = document.createElement("link");
        l.setAttribute("rel", "canonical");
        return l;
      }) as HTMLLinkElement;
      canonical.href = abs;
    }
    if (locale) setMeta("property", "og:locale", locale === "he" ? "he_IL" : "en_US");
  }, [title, description, url, locale]);
}
