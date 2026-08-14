import { TemplateType } from "@/shared/types/templates";

// Underscore separates the slug's three parts (template, couple, date) so the
// hyphens inside a part stay unambiguous: "third_a-and-b_07-07-2027".
export const SLUG_PATTERN = /^[a-z0-9_-]+$/;

const SEGMENT_SEPARATOR = "_";
const TEMPLATE_VALUES: ReadonlyArray<string> = Object.values(TemplateType);

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// The template belongs in the slug because it is what makes it unique: the
// same couple on the same date can have one invitation per template, and
// without the prefix the second one collides on the unique-slug check.
export function buildAutoSlug(params: BuildAutoSlugParams): string {
  const { template, husbandEn, wifeEn, ddmmyyyy } = params;

  const couple = [slugify(husbandEn), slugify(wifeEn)].filter(Boolean).join("-and-");
  const identity = [couple, ddmmyyyy].filter(Boolean);

  // A template alone does not identify an invitation. Returning "" while the
  // couple and date are still blank keeps the "no slug yet" signal that callers
  // (such as the media upload slots) rely on to stay disabled.
  if (identity.length === 0) {
    return "";
  }

  return [template, ...identity].join(SEGMENT_SEPARATOR);
}

export interface BuildAutoSlugParams {
  template: TemplateType;
  husbandEn: string;
  wifeEn: string;
  ddmmyyyy: string;
}

// True when the slug is one this app generated rather than one an admin typed
// by hand at creation. Only generated slugs are kept in sync with the couple,
// date and template — a hand-written slug is a deliberate choice and is left
// alone however the invitation is edited afterwards.
export function isGeneratedSlug(params: IsGeneratedSlugParams): boolean {
  const { slug, template, husbandEn, wifeEn, ddmmyyyy } = params;

  if (slug === buildAutoSlug({ template, husbandEn, wifeEn, ddmmyyyy })) {
    return true;
  }

  return slug === buildLegacySlug({ husbandEn, wifeEn, ddmmyyyy });
}

export interface IsGeneratedSlugParams extends BuildAutoSlugParams {
  slug: string;
}

// The pre-template format: "ali-madina-12-09-2026". Recognised so invitations
// created before the template prefix existed still count as generated.
function buildLegacySlug(params: Omit<BuildAutoSlugParams, "template">): string {
  const { husbandEn, wifeEn, ddmmyyyy } = params;

  return [slugify(husbandEn), slugify(wifeEn), ddmmyyyy].filter(Boolean).join("-");
}

// Swaps the template segment of an existing slug, keeping the rest intact so a
// hand-written slug survives a template change. Slugs created before the
// template prefix existed have no such segment and simply get one prepended.
export function applyTemplatePrefix(slug: string, template: TemplateType): string {
  if (slug.length === 0) {
    return slug;
  }

  const [head, ...rest] = slug.split(SEGMENT_SEPARATOR);
  if (rest.length > 0 && TEMPLATE_VALUES.includes(head)) {
    return [template, ...rest].join(SEGMENT_SEPARATOR);
  }

  return [template, slug].join(SEGMENT_SEPARATOR);
}
