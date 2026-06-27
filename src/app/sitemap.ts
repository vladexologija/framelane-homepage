import type { MetadataRoute } from "next";
import { STATIC_ROUTES, absoluteUrl } from "@/lib/seo";
import { COMPARE_PAGES } from "@/lib/landing-pages";
import { getAllPosts } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = STATIC_ROUTES.map((r) => ({
    url: absoluteUrl(r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const compareEntries = COMPARE_PAGES.map((p) => ({
    url: absoluteUrl(`/${p.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const postEntries = getAllPosts().map((post) => {
    const parsed = post.date ? new Date(post.date) : now;
    return {
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: Number.isNaN(parsed.getTime()) ? now : parsed,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    };
  });

  return [...staticEntries, ...compareEntries, ...postEntries];
}
