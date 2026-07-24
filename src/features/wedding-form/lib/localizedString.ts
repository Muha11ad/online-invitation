import { LOCALES } from "@/shared/i18n";
import type { LocalizedString } from "@/shared/i18n";

export function emptyLocalizedString(): LocalizedString {
  return Object.fromEntries(LOCALES.map((locale) => [locale, ""])) as LocalizedString;
}
