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
export function buildAutoSlug(
  template: TemplateType,
  husbandEn: string,
  wifeEn: string,
  ddmmyyyy: string,
): string {
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
