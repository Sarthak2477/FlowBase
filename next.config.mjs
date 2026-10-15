/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["puppeteer-core", "puppeteer"],
  },
};

export default nextConfig;
