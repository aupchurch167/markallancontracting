/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Sanity-hosted images (CompanyCam photos are uploaded into Sanity assets).
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
  // Redirect map from the existing macont.com Webflow site is produced at launch
  // (Phase 4). Add 301s here once the crawl is complete so no URL 404s on cutover.
  async redirects() {
    return [];
  },
};

export default nextConfig;
