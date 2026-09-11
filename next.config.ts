import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB, far too small for client-submitted video evidence.
      // Raising this trades memory for capability: uploads are buffered
      // fully in memory (src/lib/storage.ts) before hitting disk, so a
      // larger limit means more RAM used per concurrent upload — keep an
      // eye on this if the Railway instance is memory-constrained.
      bodySizeLimit: "150mb",
    },
  },
};

export default nextConfig;
