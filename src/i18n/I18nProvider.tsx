import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { en, type TranslationKey } from "@/i18n/locales/en";
import { zhCN } from "@/i18n/locales/zh-CN";
import { zhTW } from "@/i18n/locales/zh-TW";

export const APP_LOCALE_KEY = "app-locale";

export const APP_LOCALES = ["en", "zh-CN", "zh-TW"] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

const dictionaries: Record<AppLocale, Record<TranslationKey, string>> = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW
};

const LOCALE_LABEL_KEYS: Record<AppLocale, TranslationKey> = {
  en: "locale.english",
  "zh-CN": "locale.simplifiedChinese",
  "zh-TW": "locale.traditionalChinese"
};

export function isAppLocale(
  value: string | null | undefined
): value is AppLocale {
  return APP_LOCALES.includes(value as AppLocale);
}

export function getStoredAppLocale(): AppLocale {
  try {
    const stored = localStorage.getItem(APP_LOCALE_KEY);
    return isAppLocale(stored) ? stored : "en";
  } catch {
    return "en";
  }
}

export function getDocumentLang(locale: AppLocale): string {
  if (locale === "zh-CN") return "zh-CN";
  if (locale === "zh-TW") return "zh-TW";
  return "en";
}

export function getDateLocale(locale: AppLocale): string {
  if (locale === "zh-CN") return "zh-CN";
  if (locale === "zh-TW") return "zh-TW";
  return "en-US";
}

let syncLocale: AppLocale = getStoredAppLocale();

export function translate(
  locale: AppLocale,
  key: TranslationKey,
  params?: Record<string, string>
): string {
  const template = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
  if (!params) return template;
  return Object.entries(params).reduce(
    (text, [name, value]) => text.replaceAll(`{{${name}}}`, value),
    template
  );
}

/** Non-React callers (hooks, lib) — reads last synced locale from storage. */
export function tGlobal(
  key: TranslationKey,
  params?: Record<string, string>
): string {
  return translate(getStoredAppLocale(), key, params);
}

export function getLocaleLabelKey(locale: AppLocale): TranslationKey {
  return LOCALE_LABEL_KEYS[locale];
}

type I18nContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
  dateLocale: string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function applyDocumentLocale(locale: AppLocale) {
  document.documentElement.lang = getDocumentLang(locale);
  syncLocale = locale;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(getStoredAppLocale);

  useEffect(() => {
    applyDocumentLocale(locale);
    try {
      localStorage.setItem(APP_LOCALE_KEY, locale);
    } catch (e) {
      console.warn("localStorage locale save failed", e);
    }
  }, [locale]);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, params) => translate(locale, key, params),
      dateLocale: getDateLocale(locale)
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
