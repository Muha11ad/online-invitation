export const LOCALES = ["en", "ru", "uz", "kiril"] as const;

export type Locale = (typeof LOCALES)[number];

export type LocalizedString = Record<Locale, string>;

// Written in each locale's own script, since this is what the guest picks
// from — a label in a script they can't read defeats the point of the picker.
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  uz: "O'zbek",
  kiril: "Ўзбек",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
