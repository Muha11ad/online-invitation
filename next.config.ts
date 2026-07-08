import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Wildcard covers the whole private LAN subnet so testing from a phone/other
  // browser keeps working even after the dev machine's IP changes (DHCP lease, network switch, etc).
  allowedDevOrigins: ["192.168.*.*"],
};

export default nextConfig;
