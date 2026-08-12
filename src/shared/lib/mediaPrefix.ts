// Every object belonging to one invitation lives under a single prefix, so
// deleting the invitation can sweep its media with one list-and-delete and a
// replaced file never becomes an orphan.
//
// The prefix is keyed on `mediaId`, which is assigned at creation and never
// changes — that is what lets the slug be regenerated without moving a single
// object in storage.
//
// Deliberately in `shared` with a structural parameter type rather than in the
// wedding entity: the form is a client component, and importing this through
// the entity's barrel would drag the MongoDB driver into the browser bundle.
export function getMediaPrefix(reference: MediaPrefixReference): string {
  return `wedding/${getMediaId(reference)}/`;
}

// TODO(prod-cleanup): drop the `slug` fallback and make `mediaId` required once
// every stored document has one. See todo.md.
export function getMediaId(reference: MediaPrefixReference): string {
  if (reference.mediaId) {
    return reference.mediaId;
  }

  return reference.slug;
}

export interface MediaPrefixReference {
  slug: string;
  mediaId?: string;
}
