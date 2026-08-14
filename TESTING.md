# Manual test plan — slug + media id changes

Hand this file to a fresh session: **"work through TESTING.md and report results"**.
It is self-contained — no prior conversation needed.

Branch `claude/slug-template-name-p21lvq`, from commit `8de2ca2`.

---

## Why this exists

The automated suite (`npm test`, 79 passing) covers **pure functions only** —
slug generation, slug history, form-slug derivation. Nothing in it touches the
API routes, MongoDB, R2, or React rendering. Everything below is a path that has
never executed.

Highest-risk items, in order: **4** (media survives a rename), **6** (invitations
created before this branch), **9** (delete still cleans up storage).

---

## Setup

```bash
git checkout claude/slug-template-name-p21lvq
git pull
npm install
npm run dev
```

Requires a real `.env` — `MONGODB_URI`, `MONGODB_DB_NAME`,
`MONGODB_COLLECTION_WEDDINGS`, the four `R2_*` vars, `ADMIN_USERNAME`,
`ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`. Log in at `/admin/login`.

Keep the R2 bucket console open, and a Mongo shell:

```js
use <MONGODB_DB_NAME>;
db.weddings.find({}, { slug: 1, mediaId: 1, previousSlugs: 1, template: 1 });
```

> **Do not run `prettier --write` across the whole repo.** Three files
> (`dictionary.ts`, `CountdownTimer.tsx`, `MapCanvas.tsx`) fail `format:check`
> on `main` already and are deliberately left alone.

---

## What changed, in one paragraph

The slug now leads with the template — `third_a-and-b_07-07-2027` — so one couple
can have one invitation per template on the same date. It is derived from the
template, names and date, and is **read-only in the UI**; editing any of those
three regenerates it. The old slug is retired into `previousSlugs` and still
resolves, so links already sent to guests keep working. Media is filed under a
`mediaId` that never changes (`wedding/<mediaId>/<kind>/…`), so a rename moves
nothing in storage.

---

## Checks

### 1. The original bug — one couple, several templates

- [ ] Create an invitation: couple `Ali` / `Madina`, date `12-09-2026`, template **First**. Save.
- [ ] Create another with the **same** names and date, template **Third**. Save.

**Expect:** both save. Slugs `first_ali-and-madina_12-09-2026` and
`third_ali-and-madina_12-09-2026`.

**Fails if:** the second is rejected with _"An invitation already uses this
URL"_ — the template is not reaching the slug.

---

### 2. Invitations created before this branch still open

- [ ] Open `/event/<slug>` for an invitation that existed before this work.

**Expect:** loads exactly as before, unchanged URL. Its photo and music still
play.

**Fails if:** 404 — the `$or` lookup on `previousSlugs` in `getWeddingBySlug` is
not matching.

---

### 3. New media lands under a media id

- [ ] On a **new** invitation, upload a couple photo (template Third) and a music file before saving. Save.

**Expect:** in R2, keys look like `wedding/<uuid>/images/<uuid>-name.jpg` and
`wedding/<uuid>/audios/<uuid>-song.mp3` — a UUID, **not** a slug.

- [ ] In Mongo, the document has a `mediaId` matching that UUID.

**Fails if:** the prefix is a slug, or `mediaId` is missing — the form is not
sending it, or POST is not storing it.

---

### 4. Renaming does not touch media ⚠️ highest risk

Use the invitation from check 3.

- [ ] Note its current R2 keys and its `slug`.
- [ ] Edit it and change **only the date**. Watch the slug field update live before saving, and confirm the amber warning appears.
- [ ] Save.

**Expect:**

- Slug regenerated with the new date; `previousSlugs` now holds the old one.
- **R2 keys are byte-for-byte identical** — no new objects, nothing deleted.
- The photo and music still load on `/event/<new-slug>`.
- The **old** URL still opens the invitation.

**Fails if:** any object moved, or media 404s. Media should be entirely
independent of the slug now.

---

### 5. Renaming on a name change

- [ ] Edit the same invitation, change the wife's English name, save.

**Expect:** slug regenerates with the new name; both previous URLs still resolve;
media untouched again.

---

### 6. A pre-existing invitation survives a rename ⚠️ high risk

Pick an invitation created **before this branch** that has media (its files are
under `wedding/<old-slug>/…`).

- [ ] Note its R2 prefix. Confirm in Mongo it has **no** `mediaId`.
- [ ] Edit it — change the date. Save.

**Expect:**

- Slug regenerates.
- `mediaId` is now set, **equal to the old slug** — this pins the prefix where
  the files already are.
- R2 objects did not move.
- Photo and music still load; the old URL still resolves.

**Fails if:** `mediaId` is absent after the save, or the media 404s. Deleting the
invitation would then orphan its files.

---

### 7. The slug cannot be typed

- [ ] On the create page and the edit page, try to type in the Slug field.

**Expect:** read-only in both. On edit it reads _"Built from the template, names
and date — edit those to change it"_.

---

### 8. Switching a template back does not collide

- [ ] Take an invitation on template First. Change to Third, save. Change back to First, save.

**Expect:** both saves succeed. The second must **not** 409 — the invitation must
not collide with its own retired slug.

- [ ] All three URLs from that round trip still open it.
- [ ] `previousSlugs` does not contain the invitation's own current slug.

---

### 9. Delete still cleans up storage

- [ ] Delete one of the test invitations created in check 1 or 3.

**Expect:** in R2, `wedding/<its mediaId>/` is empty — no leftovers.

**Fails if:** objects remain. The delete prefix comes from `mediaId`, so this is
where a wrong media id shows up.

---

### 10. Admin routes reject anonymous callers

This regressed once already, silently. With the dev server running, in a
terminal with **no** session cookie:

```bash
curl -i -X DELETE http://localhost:3000/api/admin/weddings/any-slug
curl -i http://localhost:3000/api/admin/weddings/any-slug
```

**Expect:** `401 Unauthorized` from both, and nothing deleted.

**Fails if:** anything other than 401 comes back.

---

## If something fails

| Symptom                                       | Look at                                                                                                                                                              |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Second invitation 409s in check 1             | `buildAutoSlug` in `src/shared/lib/slug.ts`                                                                                                                          |
| Old URL 404s                                  | `getWeddingBySlug` in `src/entities/wedding/api.ts`                                                                                                                  |
| Slug did not change on a date edit            | `resolveRenamedSlug` in `src/app/api/admin/weddings/[slug]/route.ts`, and `getRenamedSlug` in `src/features/wedding-form/lib/formSlug.ts` — these two **must** agree |
| Form previews a rename the server does not do | the same pair, out of sync                                                                                                                                           |
| Media 404s after a rename                     | `getMediaPrefix` in `src/shared/lib/mediaPrefix.ts`; check `mediaId` in Mongo                                                                                        |
| Upload fails                                  | `POST /api/admin/presign` — it validates `mediaId`, not `slug`, now                                                                                                  |
| Leftovers in R2 after delete                  | `DELETE` in `src/app/api/admin/weddings/[slug]/route.ts`                                                                                                             |

Before reporting a code fix, re-run all four gates:

```bash
npx tsc --noEmit && npm run lint && npm test
npm run build
```

---

## Results

Record outcome per check, and paste any server-log error verbatim.

| #   | Check                           | Result | Notes |
| --- | ------------------------------- | ------ | ----- |
| 1   | Couple across templates         |        |       |
| 2   | Pre-existing invitation opens   |        |       |
| 3   | Media under a media id          |        |       |
| 4   | Rename leaves media alone       |        |       |
| 5   | Rename on name change           |        |       |
| 6   | Pre-existing invitation renamed |        |       |
| 7   | Slug read-only                  |        |       |
| 8   | Template switched back          |        |       |
| 9   | Delete cleans storage           |        |       |
| 10  | Anonymous calls rejected        |        |       |

Cleanup: delete the invitations created for checks 1 and 3, and confirm their R2
prefixes are gone.
