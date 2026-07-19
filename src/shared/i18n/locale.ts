export const LOCALES = ["en", "ru", "uz", "kiril"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "kiril";

export type LocalizedString = Record<Locale, string>;

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function resolveLocale(raw?: string): Locale {
  if (!raw) {
    return DEFAULT_LOCALE;
  }

  const lowered = raw.toLowerCase();
  return isLocale(lowered) ? lowered : DEFAULT_LOCALE;
}
