import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Wildcard covers the whole private LAN subnet so testing from a phone/other
  // browser keeps working even after the dev machine's IP changes (DHCP lease, network switch, etc).
  allowedDevOrigins: ["192.168.*.*"],
  images: {
    remotePatterns: [
      // Replace <bucketId> with the real value after creating the R2 bucket
      // (see docs/r2-media-setup.md). Exact hostname on purpose, not a
      // wildcard: "*.r2.dev" would let the image optimizer fetch any public
      // R2 bucket on the internet, not just ours.
      { protocol: "https", hostname: "pub-<bucketId>.r2.dev" },
      // Once a custom domain is connected to the bucket, add it here, e.g.:
      // { protocol: "https", hostname: "media.<your-domain>" },
    ],
  },
};

export default nextConfig;
