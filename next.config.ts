import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Imagens vêm de CDNs variados dos marketplaces — liberar https genérico
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
