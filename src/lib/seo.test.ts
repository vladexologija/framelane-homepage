import { describe, it, expect } from "vitest";

import {
  buildMetadata,
  faqPageLd,
  breadcrumbLd,
  softwareApplicationLd,
  organizationLd,
  absoluteUrl,
  SITE_URL,
} from "./seo";
import { COMPARE_PAGES, getComparePage } from "./landing-pages";
import { comparisonFor, COMPARISON_ROWS } from "./comparison-data";
import sitemap from "../app/sitemap";

describe("buildMetadata", () => {
  const md = buildMetadata({
    title: "Remotion alternative for AI agents",
    description: "A GPU-native Remotion alternative.",
    path: "/compare/remotion",
    keywords: ["Remotion alternative"],
    ogTitle: "FrameLane vs Remotion",
  });
  const og = md.openGraph as { title?: string; url?: string; type?: string };
  const tw = md.twitter as { card?: string; title?: string };

  it("sets the canonical to the page path", () => {
    expect(md.alternates?.canonical).toBe("/compare/remotion");
  });

  it("applies the og-title override to openGraph and twitter", () => {
    expect(og.title).toBe("FrameLane vs Remotion");
    expect(tw.title).toBe("FrameLane vs Remotion");
  });

  it("uses a summary_large_image twitter card and a website og:url", () => {
    expect(tw.card).toBe("summary_large_image");
    expect(og.url).toBe("/compare/remotion");
    expect(og.type).toBe("website");
  });
});

describe("JSON-LD builders", () => {
  it("faqPageLd maps Q&A to schema.org Questions", () => {
    const ld = faqPageLd([{ q: "Q1", a: "A1" }]);
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toHaveLength(1);
    expect(ld.mainEntity[0]).toMatchObject({
      "@type": "Question",
      name: "Q1",
      acceptedAnswer: { "@type": "Answer", text: "A1" },
    });
  });

  it("breadcrumbLd builds absolute, positioned list items", () => {
    const ld = breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Compare", path: "/compare" },
    ]);
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement[0]).toMatchObject({
      position: 1,
      name: "Home",
      item: SITE_URL,
    });
    expect(ld.itemListElement[1].item).toBe(`${SITE_URL}/compare`);
  });

  it("emits SoftwareApplication and Organization types", () => {
    expect(softwareApplicationLd()["@type"]).toBe("SoftwareApplication");
    expect(organizationLd()["@type"]).toBe("Organization");
  });
});

describe("comparisonFor", () => {
  it("returns only FrameLane + the requested competitor", () => {
    const { cols, rows } = comparisonFor("Remotion");
    expect(cols).toEqual(["FrameLane", "Remotion"]);
    expect(rows).toHaveLength(COMPARISON_ROWS.length);
    expect(rows[0].cells).toHaveLength(2);
  });
});

describe("compare pages", () => {
  it("exposes two pages, each resolvable by slug with content", () => {
    expect(COMPARE_PAGES).toHaveLength(2);
    for (const p of COMPARE_PAGES) {
      expect(getComparePage(p.slug)).toBe(p);
      expect(p.benefits.length).toBeGreaterThan(0);
      expect(p.keywords.length).toBeGreaterThan(0);
    }
  });
});

describe("sitemap", () => {
  const urls = sitemap().map((e) => e.url);

  it("includes every compare page", () => {
    expect(urls).toContain(absoluteUrl("/compare/remotion"));
    expect(urls).toContain(absoluteUrl("/compare/shotstack"));
  });

  it("includes the core marketing routes", () => {
    expect(urls).toContain(SITE_URL); // "/"
    expect(urls).toContain(absoluteUrl("/pricing"));
  });

  it("includes blog posts from content/posts", () => {
    expect(urls.some((u) => u.startsWith(`${SITE_URL}/blog/`))).toBe(true);
  });
});
