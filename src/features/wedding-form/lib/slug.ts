export const SLUG_PATTERN = /^[a-z0-9-]+$/;

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildAutoSlug(husbandEn: string, wifeEn: string, ddmmyyyy: string): string {
  return [slugify(husbandEn), slugify(wifeEn), ddmmyyyy].filter(Boolean).join("-");
}
