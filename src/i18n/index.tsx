/**
 * Localisation. The "catalog" model: structural data carries ids only, and all
 * text is looked up here — either as typed static chrome (`t.ui.*`) or by
 * convention from an id (`t.param(id)`, `t.candidate(id)`…).
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LocaleCode } from "../engine/types";
import type { Catalog, EventCatalog } from "./catalog";
import he from "../locales/he.json";
import en from "../locales/en.json";

const catalogs: Record<LocaleCode, Catalog> = {
  he: he as Catalog,
  en: en as Catalog,
};

/** Text direction is a property of the locale, not stored per-string. */
const localeDir: Record<LocaleCode, "rtl" | "ltr"> = {
  he: "rtl",
  en: "ltr",
};

/** Convention-based accessors over the active catalog. */
export interface Translator {
  locale: LocaleCode;
  dir: "rtl" | "ltr";
  app: Catalog["app"];
  ui: Catalog["ui"];
  /** Party display label by id (shared catalog); falls back to the id. */
  party(id: string): string;
  param(id: string): string;
  poleLow(id: string): string;
  poleHigh(id: string): string;
  option(id: string): string;
  questionTitle(id: string): string;
  questionStatement(id: string): string;
  candidateName(id: string): string;
  candidateTagline(id: string): string;
  candidateInitial(id: string): string;
  /** Prose for a past event's result-divergence reason id; "" when absent. */
  resultReason(id: string): string;
}

/**
 * Build a translator for `locale`. Chrome (`app`, `ui`, `party`) comes from the
 * shared catalog; event-specific copy (param/option/question/candidate) comes
 * from the loaded event's fragment `ev` — absent (on the chooser, or mid-load),
 * those accessors fall back to the id. `app` merges any per-event override.
 */
function makeTranslator(locale: LocaleCode, ev: EventCatalog | null): Translator {
  const c = catalogs[locale];
  return {
    locale,
    dir: localeDir[locale],
    app: ev?.app ? { ...c.app, ...ev.app } : c.app,
    ui: c.ui,
    party: (id) => c.party[id] ?? id,
    param: (id) => ev?.param[id]?.label ?? id,
    poleLow: (id) => ev?.param[id]?.poleLow ?? "",
    poleHigh: (id) => ev?.param[id]?.poleHigh ?? "",
    option: (id) => ev?.option[id] ?? id,
    questionTitle: (id) => ev?.question[id]?.title ?? "",
    questionStatement: (id) => ev?.question[id]?.statement ?? "",
    candidateName: (id) => ev?.candidate[id]?.name ?? id,
    candidateTagline: (id) => ev?.candidate[id]?.tagline ?? "",
    candidateInitial: (id) => ev?.candidate[id]?.initial ?? id,
    resultReason: (id) => ev?.resultReason?.[id] ?? "",
  };
}

interface I18nContextValue {
  t: Translator;
  locale: LocaleCode;
  setLocale: (l: LocaleCode) => void;
  toggleLocale: () => void;
  /** Layer an event's copy fragments over the shared catalog (null to clear). */
  setEventCatalogs: (fragments: Record<LocaleCode, EventCatalog> | null) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  initialLocale = "he",
  children,
}: {
  initialLocale?: LocaleCode;
  children: ReactNode;
}) {
  const [locale, setLocale] = useState<LocaleCode>(initialLocale);
  const [eventCatalogs, setEventCatalogs] =
    useState<Record<LocaleCode, EventCatalog> | null>(null);
  const toggleLocale = useCallback(
    () => setLocale((l) => (l === "he" ? "en" : "he")),
    [],
  );
  const t = useMemo(
    () => makeTranslator(locale, eventCatalogs?.[locale] ?? null),
    [locale, eventCatalogs],
  );
  const value = useMemo(
    () => ({ t, locale, setLocale, toggleLocale, setEventCatalogs }),
    [t, locale, toggleLocale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}
