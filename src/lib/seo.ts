import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

/**
 * Canonical origin for the marketing site. Configurable per-environment via
 * NEXT_PUBLIC_SITE_URL (e.g. a preview domain); defaults to production.
 * Trailing slash stripped so `${SITE_URL}${path}` never double-slashes.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://framelane.io"
).replace(/\/$/, "");

export const DEFAULT_TITLE = "FrameLane: Video Editing & Rendering API for AI Agents";

export const DEFAULT_DESCRIPTION =
  "FrameLane is a GPU-native video editing and rendering API for AI agents. Your agent writes the edit plan in JSON; FrameLane renders production-ready video through a single API call or MCP.";

/**
 * Default social-card image (relative; resolved against metadataBase). Repeated
 * on every page because Next.js *replaces*, never merges, a child segment's
 * `openGraph`/`twitter` objects, so an inherited image would otherwise be lost.
 */
export const OG_IMAGE = "/logo.png";

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface RouteEntry {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

/**
 * Hand-built marketing routes (everything that isn't generated from a content
 * array). Consumed by app/sitemap.ts. Data-driven routes (compare pages, blog
 * posts) are appended there from their own sources so the sitemap can't drift.
 */
export const STATIC_ROUTES: RouteEntry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.6 },
];

export function absoluteUrl(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/**
 * Builds per-page Metadata. The root layout owns metadataBase, the title
 * template, robots, icons and the default OG image, so callers only supply the
 * page-specific deltas. `path` must start with "/" (used as canonical + og:url;
 * resolved against metadataBase).
 */
export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogTitle?: string;
  type?: "website" | "article";
  publishedTime?: string;
}): Metadata {
  const ogTitle = opts.ogTitle ?? opts.title;
  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords,
    alternates: { canonical: opts.path },
    openGraph: {
      type: opts.type ?? "website",
      url: opts.path,
      siteName: SITE.name,
      title: ogTitle,
      description: opts.description,
      images: [OG_IMAGE],
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: opts.description,
      images: [OG_IMAGE],
    },
  };
}

// ── JSON-LD builders ─────────────────────────────────────────────────────────
// Each returns a plain schema.org object. Render with <JsonLd data={...} />.

export interface Offer {
  name: string;
  price: string;
  priceCurrency?: string;
}

/** FrameLane's public, on-site pricing (Free + Pro) as schema.org Offers. */
export const FRAMELANE_OFFERS: Offer[] = [
  { name: "Free", price: "0", priceCurrency: "USD" },
  { name: "Pro", price: "99", priceCurrency: "USD" },
];

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: DEFAULT_DESCRIPTION,
    sameAs: [SITE.githubUrl, SITE.discordUrl],
  };
}

export function softwareApplicationLd(opts?: {
  description?: string;
  offers?: Offer[];
}) {
  const offers = opts?.offers ?? FRAMELANE_OFFERS;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE.name,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web-based, API",
    url: SITE_URL,
    description: opts?.description ?? DEFAULT_DESCRIPTION,
    offers: offers.map((o) => ({
      "@type": "Offer",
      name: o.name,
      price: o.price,
      priceCurrency: o.priceCurrency ?? "USD",
    })),
  };
}

export function faqPageLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}
