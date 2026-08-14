import { buildAutoSlug, isGeneratedSlug } from "@/shared/lib/slug";
import type { TemplateType } from "@/shared/types/templates";

import type { WeddingFormMode, WeddingFormValue } from "./formState";

export interface GetSlugParams {
  mode: WeddingFormMode;
  storedValue: WeddingFormValue | undefined;
  template: TemplateType;
  husbandEn: string;
  wifeEn: string;
  ddmmyyyy: string;
}

// The slug the form displays. Always derived, never typed: it describes the
// template, couple and date, and the only way to change it is to change one of
// those.
export function getSlug(params: GetSlugParams): string {
  const { mode, storedValue, template } = params;

  if (mode === "edit" && storedValue) {
    return getRenamedSlug({
      storedValue,
      template,
      husbandEn: params.husbandEn,
      wifeEn: params.wifeEn,
      ddmmyyyy: params.ddmmyyyy,
    });
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

// A generated slug always matches the API's pattern, so the only thing left to
// check is that there is one: create mode has none until the couple or date is
// filled in.
export function isSlugValid(mode: WeddingFormMode, slug: string): boolean {
  if (mode === "edit") {
    return true;
  }

  return slug.trim().length > 0;
}
