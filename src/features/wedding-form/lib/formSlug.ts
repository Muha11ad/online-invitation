import type { RawWeddingDoc } from "@/entities/wedding";

import { applyTemplatePrefix, buildAutoSlug, SLUG_PATTERN } from "@/shared/lib/slug";
import type { TemplateType } from "@/shared/types/templates";

import type { WeddingFormMode } from "./formState";

export const SLUG_PATTERN_ERROR =
  "Slug can only contain lowercase letters, numbers, hyphens, and underscores.";

export interface GetSlugParams {
  mode: WeddingFormMode;
  storedValue: RawWeddingDoc | undefined;
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
    return getRenamedSlug({ storedValue, template });
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
  storedValue: RawWeddingDoc;
  template: TemplateType;
}

// Mirrors resolveRenamedSlug() in the PATCH route. An untouched template keeps
// the stored slug verbatim — otherwise invitations created before the template
// prefix existed would preview a rename the server never performs.
export function getRenamedSlug(params: GetRenamedSlugParams): string {
  const { storedValue, template } = params;

  if (template === storedValue.template) {
    return storedValue.slug;
  }

  return applyTemplatePrefix(storedValue.slug, template);
}

export function willSlugChange(storedValue: RawWeddingDoc | undefined, slug: string): boolean {
  if (!storedValue) {
    return false;
  }

  return slug !== storedValue.slug;
}

// Uploads keep landing under the stored slug: the PATCH moves the whole prefix
// afterwards if a template change renames it.
export function getMediaSlug(storedValue: RawWeddingDoc | undefined, slug: string): string {
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
