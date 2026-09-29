/** @type {import('next').NextConfig} */
// GitHub Pages: set BASE_PATH to the repo name (e.g. "/me" for prathamp18.github.io/me).
// Vercel / Netlify / custom domain: leave it empty.
const basePath = process.env.BASE_PATH || "";

const nextConfig = {
  output: "export",          // static site -> deploy anywhere
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: process.env.PREVIEW ? "." : basePath },
  // PREVIEW=1 builds with relative asset paths (used only for the hosted preview)
  ...(process.env.PREVIEW ? { assetPrefix: "./" } : {}),
};
export default nextConfig;
