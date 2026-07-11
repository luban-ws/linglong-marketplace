import { otherLocale } from "../i18n/locale";
import { useLocale } from "../i18n/LocaleContext";
import { LOCALE_EN, LOCALE_ZH } from "../i18n/types";

/** Compact zh / EN switcher for rail and top bar. */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, messages } = useLocale();
  const next = otherLocale(locale);

  return (
    <div
      className={className ? `lang-toggle ${className}` : "lang-toggle"}
      role="group"
      aria-label={messages.lang.label}
    >
      <button
        type="button"
        className={locale === LOCALE_ZH ? "lang-btn is-active" : "lang-btn"}
        aria-pressed={locale === LOCALE_ZH}
        onClick={() => setLocale(LOCALE_ZH)}
      >
        {messages.lang.switchToZh}
      </button>
      <span className="lang-sep" aria-hidden="true">
        /
      </span>
      <button
        type="button"
        className={locale === LOCALE_EN ? "lang-btn is-active" : "lang-btn"}
        aria-pressed={locale === LOCALE_EN}
        onClick={() => setLocale(LOCALE_EN)}
      >
        {messages.lang.switchToEn}
      </button>
      <span className="sr-only">
        {next === LOCALE_ZH ? messages.lang.switchToZh : messages.lang.switchToEn}
      </span>
    </div>
  );
}
