import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    localPatterns: [{ pathname: "/media/**" }, { pathname: "/videos/**" }],
  },
  poweredByHeader: false,
  experimental: {
    // Importa solo los íconos usados
    optimizePackageImports: ["@phosphor-icons/react"],
  },
  // Hay un package-lock.json en el home del usuario: fijamos la raíz al proyecto
  turbopack: { root: path.resolve(import.meta.dirname) },
};

export default nextConfig;
