import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev and production must not write manifests into the same directory.
  // This is especially important on Windows, where file renames can race.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  output: "standalone",
};

export default nextConfig;
