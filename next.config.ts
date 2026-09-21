import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Imagens vêm de CDNs variados dos marketplaces — liberar https genérico
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async redirects() {
    return [
      // Erro de digitação fácil de cometer (e já cometido): a rota é plural.
      // Redirect permanente em vez de 404 — o link pode já ter sido salvo.
      { source: "/estatistica", destination: "/estatisticas", permanent: true },
    ];
  },
};

export default nextConfig;
