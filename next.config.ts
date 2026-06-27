import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.0.32.61"],
  skipTrailingSlashRedirect: true, // keep PostHog's trailing-slash paths intact
  async rewrites() {
    return [
      // PostHog reverse proxy (US cloud): same-origin /ingest avoids ad-blockers.
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
};

export default nextConfig;
