import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Auth-gated console + auth flows + API routes, no SEO value, keep out of the index.
      disallow: [
        "/dashboard",
        "/usage",
        "/projects",
        "/api-keys",
        "/webhooks",
        "/billing",
        "/settings",
        "/signup",
        "/oauth",
        "/login",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
