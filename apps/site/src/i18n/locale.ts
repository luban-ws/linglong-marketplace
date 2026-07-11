import { en } from "./en";
import type { Locale, Messages } from "./types";
import { LOCALE_EN, LOCALE_ZH } from "./types";
import { zh } from "./zh";

export const LOCALE_STORAGE_KEY = "linglong-site-locale";

const MESSAGES: Record<Locale, Messages> = {
  [LOCALE_ZH]: zh,
  [LOCALE_EN]: en,
};

/** Resolve locale from stored preference or browser language. */
export function resolveLocale(stored: string | null, navigatorLang: string): Locale {
  if (stored === LOCALE_ZH || stored === LOCALE_EN) return stored;
  const lang = navigatorLang.toLowerCase();
  if (lang.startsWith("zh")) return LOCALE_ZH;
  return LOCALE_EN;
}

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}

export function otherLocale(locale: Locale): Locale {
  return locale === LOCALE_ZH ? LOCALE_EN : LOCALE_ZH;
}
