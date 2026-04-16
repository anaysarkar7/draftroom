import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",                          // Static HTML export (required for GitHub Pages)
  basePath: isProd ? "/draftroom" : "",      // Only needed on GH Pages — not locally
  trailingSlash: true,                       // Generates index.html per route (GH Pages compat)
  images: {
    unoptimized: true,                       // Next.js Image optimization requires a server
  },
};

export default nextConfig;
