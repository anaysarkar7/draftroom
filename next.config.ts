import type { NextConfig } from "next";

// Distinguish GitHub Pages deploys (set explicitly in the deploy script)
// from Vercel or local dev. Never use NODE_ENV for this — Vercel also sets
// NODE_ENV=production, which would incorrectly apply GH Pages settings there.
const isGhPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  // Static export is only needed for GitHub Pages branch deploys.
  // Vercel handles routing natively as a Next.js server — no export needed.
  output: isGhPages ? "export" : undefined,

  // basePath is only needed on GH Pages where the site lives at /draftroom.
  // On Vercel and local dev the app is served at the root.
  basePath: isGhPages ? "/draftroom" : "",

  // index.html per route — required for GH Pages; harmless elsewhere
  trailingSlash: true,

  images: {
    // Image optimisation requires a Node server; unoptimized works everywhere
    unoptimized: true,
  },
};

export default nextConfig;
