import type { Locale, LocalizedString } from "@/shared/i18n";

import type { RawWeddingDoc } from "../model";

export function hasCompleteLocale(doc: RawWeddingDoc, locale: Locale): boolean {
  return (
    isNonEmpty(doc.message?.[locale]) &&
    isNonEmpty(doc.names?.husband?.[locale]) &&
    isNonEmpty(doc.names?.wife?.[locale]) &&
    isNonEmpty(doc.location?.city?.[locale]) &&
    isNonEmpty(doc.location?.venue?.[locale]) &&
    isNonEmpty(doc.location?.address?.[locale])
  );
}

export function pick(value: LocalizedString, locale: Locale): string {
  return value[locale];
}

function isNonEmpty(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
