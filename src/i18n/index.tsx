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
import type { Catalog } from "./catalog";
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
  param(id: string): string;
  poleLow(id: string): string;
  poleHigh(id: string): string;
  option(id: string): string;
  questionTitle(id: string): string;
  questionStatement(id: string): string;
  candidateName(id: string): string;
  candidateTagline(id: string): string;
  candidateInitial(id: string): string;
}

function makeTranslator(locale: LocaleCode): Translator {
  const c = catalogs[locale];
  return {
    locale,
    dir: localeDir[locale],
    app: c.app,
    ui: c.ui,
    param: (id) => c.param[id]?.label ?? id,
    poleLow: (id) => c.param[id]?.poleLow ?? "",
    poleHigh: (id) => c.param[id]?.poleHigh ?? "",
    option: (id) => c.option[id] ?? id,
    questionTitle: (id) => c.question[id]?.title ?? "",
    questionStatement: (id) => c.question[id]?.statement ?? "",
    candidateName: (id) => c.candidate[id]?.name ?? id,
    candidateTagline: (id) => c.candidate[id]?.tagline ?? "",
    candidateInitial: (id) => c.candidate[id]?.initial ?? id,
  };
}

interface I18nContextValue {
  t: Translator;
  locale: LocaleCode;
  setLocale: (l: LocaleCode) => void;
  toggleLocale: () => void;
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
  const toggleLocale = useCallback(
    () => setLocale((l) => (l === "he" ? "en" : "he")),
    [],
  );
  const t = useMemo(() => makeTranslator(locale), [locale]);
  const value = useMemo(
    () => ({ t, locale, setLocale, toggleLocale }),
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
