import { buildAutoSlug, isGeneratedSlug, SLUG_PATTERN } from "@/shared/lib/slug";
import type { TemplateType } from "@/shared/types/templates";

import type { WeddingFormMode, WeddingFormValue } from "./formState";

export const SLUG_PATTERN_ERROR =
  "Slug can only contain lowercase letters, numbers, hyphens, and underscores.";

export interface GetSlugParams {
  mode: WeddingFormMode;
  storedValue: WeddingFormValue | undefined;
  template: TemplateType;
  slugTouched: boolean;
  manualSlug: string;
  husbandEn: string;
  wifeEn: string;
  ddmmyyyy: string;
}

// The slug the form displays. In edit mode it is derived and read-only; in
// create mode it is generated from the couple until the admin types over it.
export function getSlug(params: GetSlugParams): string {
  const { mode, storedValue, template, slugTouched, manualSlug } = params;

  if (mode === "edit" && storedValue) {
    return getRenamedSlug({
      storedValue,
      template,
      husbandEn: params.husbandEn,
      wifeEn: params.wifeEn,
      ddmmyyyy: params.ddmmyyyy,
    });
  }

  if (slugTouched) {
    return manualSlug;
  }

  return buildAutoSlug({
    template,
    husbandEn: params.husbandEn,
    wifeEn: params.wifeEn,
    ddmmyyyy: params.ddmmyyyy,
  });
}

export interface GetRenamedSlugParams {
  storedValue: WeddingFormValue;
  template: TemplateType;
  husbandEn: string;
  wifeEn: string;
  ddmmyyyy: string;
}

// Mirrors resolveRenamedSlug() in the PATCH route: a generated slug follows the
// template, couple and date, while a hand-written one is left alone. The two
// must agree, or the form previews a rename the server will not perform.
export function getRenamedSlug(params: GetRenamedSlugParams): string {
  const { storedValue, template, husbandEn, wifeEn, ddmmyyyy } = params;

  const wasGenerated = isGeneratedSlug({
    slug: storedValue.slug,
    template: storedValue.template,
    husbandEn: storedValue.names.husband.en,
    wifeEn: storedValue.names.wife.en,
    ddmmyyyy: storedValue.date.ddmmyyyy,
  });
  if (!wasGenerated) {
    return storedValue.slug;
  }

  const candidate = buildAutoSlug({ template, husbandEn, wifeEn, ddmmyyyy });
  if (candidate.length === 0) {
    return storedValue.slug;
  }

  return candidate;
}

export function willSlugChange(storedValue: WeddingFormValue | undefined, slug: string): boolean {
  if (!storedValue) {
    return false;
  }

  return slug !== storedValue.slug;
}

// Uploads keep landing under the stored slug: the PATCH moves the whole prefix
// afterwards if a template change renames it.
export function getMediaSlug(storedValue: WeddingFormValue | undefined, slug: string): string {
  if (!storedValue) {
    return slug;
  }

  return storedValue.slug;
}

export function getSlugPatternError(mode: WeddingFormMode, slug: string): string | null {
  if (mode === "edit" || slug.length === 0) {
    return null;
  }

  if (SLUG_PATTERN.test(slug)) {
    return null;
  }

  return SLUG_PATTERN_ERROR;
}

export function isSlugValid(mode: WeddingFormMode, slug: string): boolean {
  if (mode === "edit") {
    return true;
  }

  return slug.trim().length > 0 && SLUG_PATTERN.test(slug);
}
