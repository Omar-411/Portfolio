import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "opengraph.githubassets.com",
      },
    ],
  },
  async redirects() {
    // The portfolio used to live at /portfolio before the site became bilingual.
    return [{ source: "/portfolio", destination: "/en/portfolio", permanent: false }];
  },
};

export default nextConfig;
