import { defaultLocale, isLocale, type Locale } from "./config";

const STORAGE_KEY = "portfolio:lang";

/** Browser-only: the visitor's saved language, else their browser language, else the default. */
export function getPreferredLocale(): Locale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && isLocale(saved)) return saved;
  } catch {
    // Storage can be unavailable; fall through to the browser language.
  }
  return navigator.language?.toLowerCase().startsWith("fr") ? "fr" : defaultLocale;
}

export function rememberLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Not critical.
  }
}
