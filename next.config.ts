import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Wildcard covers the whole private LAN subnet so testing from a phone/other
  // browser keeps working even after the dev machine's IP changes (DHCP lease, network switch, etc).
  allowedDevOrigins: ["192.168.*.*"],
  images: {
    remotePatterns: [
      // Public r2.dev URL of the "online-invitation-platform" R2 bucket
      // (see docs/r2-media-setup.md). Exact hostname on purpose, not a
      // wildcard: "*.r2.dev" would let the image optimizer fetch any public
      // R2 bucket on the internet, not just ours.
      { protocol: "https", hostname: "pub-4a35e8f2f4c84c4c975069310d47d03f.r2.dev" },
      // Once a custom domain is connected to the bucket, add it here, e.g.:
      // { protocol: "https", hostname: "media.<your-domain>" },
    ],
  },
};

export default nextConfig;
