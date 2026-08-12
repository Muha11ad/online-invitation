# TODO

Deferred cleanups. Each one is backward-compatibility scaffolding for documents
created before a change landed — safe to remove once production data no longer
needs it, and **not** before.

---

## 1. Drop the `mediaId ?? slug` media prefix fallback

**Status:** waiting on production data.

Media lives under `wedding/<mediaId>/…`. `mediaId` is assigned at creation and
never changes, which is what lets the slug be regenerated without moving a
single object in R2.

Documents created before `mediaId` existed do not have one, and their media sits
under `wedding/<slug>/…`. `getMediaId()` falls back to the slug for those, so
they keep resolving and keep being cleaned up on delete.

Two things keep the fallback correct in the meantime:

- The PATCH route pins `mediaId = existing.slug` the first time such a document
  is renamed, freezing the prefix where its objects already are. No copying.
- `getMediaPrefix()` is the only place that builds the prefix, so nothing else
  has to know about the fallback.

### What to remove

| File                                         | Change                                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/shared/lib/mediaPrefix.ts`              | Delete the `if (reference.mediaId)` branch in `getMediaId`; return `reference.mediaId` directly. |
| `src/entities/wedding/model.ts`              | Make `mediaId` required — drop the `?`.                                                          |
| `src/app/api/admin/weddings/[slug]/route.ts` | Delete the `if (!existing.mediaId)` block in `PATCH`.                                            |
| `src/features/wedding-form/lib/formState.ts` | `getInitialFormState` can read `storedValue.mediaId` directly.                                   |
| `src/app/api/admin/presign/route.ts`         | `MEDIA_ID_PATTERN` can tighten to a UUID pattern once no slug-shaped prefixes remain.            |

### Before removing

Every document must have a `mediaId`. Check:

```js
db.weddings.countDocuments({ mediaId: { $exists: false } }); // must be 0
```

If it is not 0, either edit those invitations once through the admin panel (the
PATCH pins the id on rename), or backfill directly — this is safe because it
records where the media already is:

```js
db.weddings.updateMany({ mediaId: { $exists: false } }, [{ $set: { mediaId: "$slug" } }]);
```

---

## 2. Drop legacy slug-format recognition

**Status:** waiting on production data. Lower priority than 1.

`isGeneratedSlug()` in `src/shared/lib/slug.ts` recognises two formats: the
current `third_ali-and-madina_12-09-2026`, and the pre-template
`ali-madina-12-09-2026`. Only a slug this app generated is kept in sync with the
couple, date and template — a hand-written one is left alone.

Once no stored slug uses the old format, delete `buildLegacySlug()` and its call
in `isGeneratedSlug()`, plus the two tests naming it.

Finding them:

```js
db.weddings.find({ slug: { $not: /_/ } }, { slug: 1 });
```

Editing any of those invitations regenerates the slug into the current format
(the old URL keeps working via `previousSlugs`).

---

## 3. Slugs are no longer editable by hand

**Status:** done in code, may leave data behind.

The slug field is read-only in both create and edit mode — it is always derived
from the template, names and date. Invitations created before that could carry a
hand-written slug, and `isGeneratedSlug()` deliberately leaves those alone so
they are never rewritten underneath their owner.

If you decide hand-written slugs should not survive at all, removing the
`wasGenerated` guard in both `resolveRenamedSlug()`
(`src/app/api/admin/weddings/[slug]/route.ts`) and `getRenamedSlug()`
(`src/features/wedding-form/lib/formSlug.ts`) makes every slug track its
content. Both must change together or the form will preview a rename the server
will not perform.

Finding them:

```js
// slugs that do not match either generated format
db.weddings.find({ slug: { $not: /^(first|second|third)_/ } }, { slug: 1 });
```
