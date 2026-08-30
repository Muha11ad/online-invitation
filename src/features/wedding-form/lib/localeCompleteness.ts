import {
  getLocalizedFields,
  isNonEmpty,
  type LocaleCompletenessInput,
} from "@/entities/wedding/lib/localization";

import type { Locale } from "@/shared/i18n";

export type { LocaleCompletenessInput };

export type LocaleCompleteness = "empty" | "partial" | "complete";

// hasCompleteLocale only has a pass/fail notion of completeness, but the
// toggle also needs to show "in progress" — so this counts fills against the
// same six fields (via getLocalizedFields) instead of re-listing them here.
export function getLocaleCompleteness(
  doc: LocaleCompletenessInput,
  locale: Locale,
): LocaleCompleteness {
  const fields = getLocalizedFields(doc, locale);
  const filled = fields.filter(isNonEmpty).length;

  if (filled === 0) {
    return "empty";
  }
  if (filled === fields.length) {
    return "complete";
  }
  return "partial";
}
