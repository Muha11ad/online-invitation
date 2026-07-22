# Cloudflare R2 media setup

This is a manual, dashboard-driven workflow — there is no admin UI for uploads
yet. Media files are uploaded by hand to R2, and their public URLs are pasted
directly into the wedding document in MongoDB.

## 1. Create the bucket

- Cloudflare dashboard → R2 → **Create bucket**.
- The free tier includes 10GB storage and free egress, which is enough for
  this use case.

## 2. Enable public access

- Open the bucket → **Settings** → **Public access**.
- Allow the `r2.dev` subdomain.
- Copy the resulting `https://pub-<id>.r2.dev` URL — you'll need it in the
  next step and whenever you paste media URLs into MongoDB.

## 3. Update next.config.ts

- In `next.config.ts`, replace the `pub-<bucketId>.r2.dev` placeholder in
  `images.remotePatterns` with your real hostname from step 2.
- This is only needed for images rendered through `next/image`. Audio/video
  files don't go through the image optimizer, so nothing needs to change for
  those.
- Note: no template currently renders `coupleMainImage` through `next/image`
  (the third template uses a CSS `background-image`), so this config is
  forward-compatibility for when a template switches to `<Image>`, not
  load-bearing for today's rendering.

## 4. Upload files — folder convention

Use this exact folder structure inside the bucket:

```
wedding/<slug>/images/<image-name>.png
wedding/<slug>/audios/<audio-name>.mp3
wedding/<slug>/videos/<video-name>.mp4
```

`<slug>` is the wedding's slug from MongoDB — the same one used in the
`/event/<slug>` URL.

Keeping all of a wedding's media under a single `wedding/<slug>/` prefix means
that once a wedding is over, all of its media can be deleted at once by
deleting that one prefix.

## 5. Paste URLs into MongoDB

Copy the full public URL for each uploaded file (e.g.
`https://pub-<id>.r2.dev/wedding/aziz-malika/audios/song.mp3`) and paste it
into the corresponding field on the wedding document:

- `coupleMainImage`
- `music`

The `videos/` folder is reserved for a future `video` field — no such model
field exists yet, so don't paste video URLs into MongoDB until it does.

## 6. Test locally

- Run the dev server.
- Open `/event/<slug>`.
- Check that the image renders and the music plays.

## 7. Later: custom domain

When a domain is purchased:

- Connect it to the bucket in R2 settings.
- Add it to `remotePatterns` in `next.config.ts` (the commented-out example
  line is already there for this).
- Update the URLs stored in Mongo to use the new domain instead of
  `pub-<id>.r2.dev`.

## 8. Template chrome assets

Not all media is per-wedding. Templates also ship their own static chrome —
wreaths, decorative photos, background video, the shared telegram logo — that
is the same for every wedding using that template. These live under a
separate prefix:

```
templates/<template-name>/images/<file-name>
templates/<template-name>/videos/<file-name>
templates/shared/images/<file-name>
```

`<template-name>` is `first` / `second` / `third`; `templates/shared/` holds
assets reused across templates (currently just the telegram logo).

Uploads for these are scripted, not manual — see
`scripts/upload-media-to-r2.sh` for the local→key manifest and the
`npx wrangler r2 object put` calls that upload each file.

`src/shared/lib/mediaLinks.ts` is the single place the resulting public URLs
live (`R2_PUBLIC_BASE` + a `MEDIA_LINKS` object keyed by template). Templates
import from there instead of hardcoding `/images/...` paths, so:

- Custom-domain migration (see step 7) only requires updating
  `R2_PUBLIC_BASE` in `mediaLinks.ts`, plus `next.config.ts` and the
  per-wedding URLs stored in Mongo as described above — no template file
  needs to change.
