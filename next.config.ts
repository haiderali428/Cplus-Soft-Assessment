import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained output in .next/standalone — used by the Dockerfile
  // to create a lean production image without node_modules on the final layer.
  output: "standalone",
};

export default nextConfig;
