// Builds the retired-slug list for a rename. The slug being adopted is dropped
// from the history — a first → third → first round trip must not leave the
// document's own live slug listed as one of its retired ones.
export function retireSlug(
  currentSlug: string,
  previousSlugs: string[] | undefined,
  newSlug: string,
): string[] {
  const retired = new Set(previousSlugs ?? []);
  retired.add(currentSlug);
  retired.delete(newSlug);

  return [...retired];
}
