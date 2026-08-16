# TODO

## Precondition for deploying the slug/mediaId collapse

**Status: must be done before this code ships. Not a migration script — do
that separately.**

This refactor collapsed the separate `mediaId` into `slug` and made
`getMediaPrefix()` key R2 objects on `slug` alone (see the comment there).
Before deploying, every document already in the `weddings` collection must
have a `slug` that:

1. Matches the UUID v4 pattern in `src/shared/lib/slug.ts` (`SLUG_PATTERN`), and
2. Already equals the R2 prefix its media is actually filed under today —
   that is, its former `mediaId` where the document has one, otherwise its
   former (readable) `slug`.

Minting a fresh UUID during migration instead of reusing the existing
`mediaId`/slug would strand every document's media: `getMediaPrefix()` would
compute a prefix with nothing under it, so presigned uploads for a "replace"
would 400 or write to an empty prefix, and DELETE would sweep an empty
prefix and silently orphan the real objects.

If any document fails condition 1 or 2, fix it before deploying — either by
editing it once through the admin panel or by a one-off script that copies
`mediaId` (or the old `slug`, if no `mediaId`) into `slug`.
