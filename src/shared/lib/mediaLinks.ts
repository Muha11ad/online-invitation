// Public URLs for template chrome assets (wreaths, background images/videos,
// logos, etc.) served from the "online-invitation-platform" R2 bucket.
//
// Once a custom domain is connected to the bucket, only R2_PUBLIC_BASE needs
// to change here (plus next.config.ts remotePatterns and the URLs already
// stored in Mongo — see docs/r2-media-setup.md).
export const R2_PUBLIC_BASE = "https://pub-4a35e8f2f4c84c4c975069310d47d03f.r2.dev";

export const MEDIA_LINKS = {
  firstTemplate: {
    wreath: `${R2_PUBLIC_BASE}/templates/first/images/wreath.png`,
    weddingBirds: `${R2_PUBLIC_BASE}/templates/first/images/wedding-birds.png`,
  },
  secondTemplate: {
    fountain: `${R2_PUBLIC_BASE}/templates/second/images/fountain.png`,
    heroVideo: `${R2_PUBLIC_BASE}/templates/second/videos/hero-video.mp4`,
  },
  thirdTemplate: {
    heroImage: `${R2_PUBLIC_BASE}/templates/third/images/p2-t3-hero-image.jpg`,
    couplesNameBorder: `${R2_PUBLIC_BASE}/templates/third/images/p2-t3-couples-name-border.png`,
    coupleBorderImage: `${R2_PUBLIC_BASE}/templates/third/images/p2-t3-couple-border-image.png`,
    weddingDetailsBackground: `${R2_PUBLIC_BASE}/templates/third/images/p2-t3-wd-back.jpg`,
  },
  shared: {
    telegramLogo: `${R2_PUBLIC_BASE}/templates/shared/images/telegram_logo.png`,
  },
} as const;
