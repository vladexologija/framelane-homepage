import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";
import { getComparePage } from "@/lib/landing-pages";
import { buildMetadata } from "@/lib/seo";

const content = getComparePage("compare/ffmpeg")!;

export const metadata: Metadata = buildMetadata({
  title: content.metaTitle,
  description: content.metaDescription,
  path: `/${content.slug}`,
  keywords: content.keywords,
  ogTitle: content.ogTitle,
});

export default function FfmpegComparePage() {
  return <LandingPage content={content} />;
}
