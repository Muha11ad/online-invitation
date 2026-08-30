import { LOCALES, type Locale, type LocalizedString } from "@/shared/i18n";

// Purpose-built rather than `Pick<RawWeddingDoc, "message" | "names" |
// "location">`: that Pick drags in `location.coords`, which completeness
// never reads, and every caller that isn't holding a real RawWeddingDoc
// (the admin form's in-memory draft state, the validator's not-yet-a-doc
// input value) ended up inventing a fake coords value just to satisfy the
// shape. This type only names the six fields completeness actually depends
// on.
export interface LocaleCompletenessInput {
  message: LocalizedString;
  names: {
    husband: LocalizedString;
    wife: LocalizedString;
  };
  location: {
    city: LocalizedString;
    venue: LocalizedString;
    address: LocalizedString;
  };
}

// The six fields locale-completeness is judged on, read out defensively
// (optional chaining) so a legacy or malformed document degrades to "not
// filled in" rather than throwing. Exported so a caller that needs a
// finer-grained signal than hasCompleteLocale's pass/fail — e.g. the admin
// form's per-locale progress dot — can derive it from this same list instead
// of re-enumerating the six fields itself.
export function getLocalizedFields(
  doc: LocaleCompletenessInput,
  locale: Locale,
): Array<string | undefined> {
  return [
    doc.message?.[locale],
    doc.names?.husband?.[locale],
    doc.names?.wife?.[locale],
    doc.location?.city?.[locale],
    doc.location?.venue?.[locale],
    doc.location?.address?.[locale],
  ];
}

export function hasCompleteLocale(doc: LocaleCompletenessInput, locale: Locale): boolean {
  return getLocalizedFields(doc, locale).every(isNonEmpty);
}

// Locales a guest can actually switch to, in LOCALES order, so the picker's
// item order is stable regardless of how fields happen to be filled in.
export function getAvailableLocales(doc: LocaleCompletenessInput): Locale[] {
  return LOCALES.filter((locale) => hasCompleteLocale(doc, locale));
}

export function pick(value: LocalizedString, locale: Locale): string {
  return value[locale];
}

export function isNonEmpty(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
