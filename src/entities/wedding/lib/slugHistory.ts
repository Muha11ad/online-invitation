// Builds the retired-slug list for a rename. The slug being adopted is dropped
// from the history — a first → third → first round trip must not leave the
// document's own live slug listed as one of its retired ones.
export function retireSlug(params: RetireSlugParams): string[] {
  const { currentSlug, previousSlugs, newSlug } = params;

  const retired = new Set(previousSlugs ?? []);
  retired.add(currentSlug);
  retired.delete(newSlug);

  return [...retired];
}

export interface RetireSlugParams {
  currentSlug: string;
  previousSlugs: string[] | undefined;
  newSlug: string;
}
