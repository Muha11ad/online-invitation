#!/usr/bin/env bash
#
# Uploads the shared template chrome assets (currently living under public/)
# to the "online-invitation-platform" R2 bucket, so templates can be switched
# over to serving them from R2 instead of bundling them with the app.
#
# Each entry below is a "<local path>|<bucket key>" pair. Run from the repo
# root:
#
#   scripts/upload-media-to-r2.sh
#
# Requires wrangler to already be authenticated (npx wrangler login).

set -euo pipefail

BUCKET="online-invitation-platform"

MANIFEST=(
  "public/audio/wedding.mp3|wedding/a-and-b_07-07-2027/audios/wedding.mp3"
  "public/audio/wedding.mp3|wedding/a-and-b_08-08-2028/audios/wedding.mp3"
  "public/audio/wedding.mp3|wedding/a-and-b_09-09-2029/audios/wedding.mp3"
  "public/images/wedding.png|wedding/a-and-b_09-09-2029/images/wedding.png"
  "public/images/wreath.png|templates/first/images/wreath.png"
  "public/images/wedding-birds.png|templates/first/images/wedding-birds.png"
  "public/images/fountain.png|templates/second/images/fountain.png"
  "public/video/hero-video.mp4|templates/second/videos/hero-video.mp4"
  "public/images/p2-t3-hero-image.jpg|templates/third/images/p2-t3-hero-image.jpg"
  "public/images/p2-t3-couples-name-border.png|templates/third/images/p2-t3-couples-name-border.png"
  "public/images/p2-t3-couple-border-image.png|templates/third/images/p2-t3-couple-border-image.png"
  "public/images/p2-t3-wd-back.jpg|templates/third/images/p2-t3-wd-back.jpg"
  "public/images/telegram_logo.png|templates/shared/images/telegram_logo.png"
)

for entry in "${MANIFEST[@]}"; do
  local_path="${entry%%|*}"
  key="${entry##*|}"

  echo "Uploading ${local_path} -> ${BUCKET}/${key}"
  npx wrangler r2 object put "${BUCKET}/${key}" --file "${local_path}" --remote
done
