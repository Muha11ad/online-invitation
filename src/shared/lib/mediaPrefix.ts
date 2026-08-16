// Every object belonging to one invitation lives under a single prefix, so
// deleting the invitation can sweep its media with one list-and-delete and a
// replaced file never becomes an orphan.
//
// The prefix is keyed on the slug. For any document created by this code,
// that is safe: the slug is a client-minted id assigned once and never
// changed. It is only safe for a document migrated from before this change
// if migration set `slug` to the R2 prefix that document's media already
// sits under (its former `mediaId`, or its former slug if it never had one)
// — see todo.md. Call this with anything else and it resolves to a prefix
// with no objects in it.
//
// Deliberately in `shared` with a plain string parameter rather than in the
// wedding entity: the form is a client component, and importing this through
// the entity's barrel would drag the MongoDB driver into the browser bundle.
export function getMediaPrefix(slug: string): string {
  return `wedding/${slug}/`;
}
