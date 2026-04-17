import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // "export" is only needed for GitHub Pages — dev mode uses the Next.js server
  // so dynamic routes like /editor/[uuid] work without generateStaticParams constraints
  output: isProd ? "export" : undefined,
  basePath: isProd ? "/draftroom" : "",      // Only needed on GH Pages — not locally
  trailingSlash: true,                       // Generates index.html per route (GH Pages compat)
  images: {
    unoptimized: true,                       // Next.js Image optimization requires a server
  },
};

export default nextConfig;
