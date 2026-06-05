import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — FrameLane Blog`,
    description: post.excerpt,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="wrap" style={{ paddingTop: 80, paddingBottom: 120 }}>
      <style>{`
        .prose h2 {
          font-size: 20px;
          font-weight: 500;
          letter-spacing: -0.02em;
          margin: 48px 0 16px;
          color: var(--fg);
        }
        .prose p {
          font-size: 16px;
          line-height: 1.75;
          color: var(--fg-2);
          margin-bottom: 20px;
        }
        .prose ul, .prose ol {
          padding-left: 20px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .prose li {
          font-size: 16px;
          line-height: 1.7;
          color: var(--fg-2);
        }
      `}</style>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <Link
          href="/blog"
          className="mono"
          style={{
            fontSize: 12,
            color: "var(--fg-mute)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 48,
            transition: "color 0.15s",
          }}
        >
          ← All posts
        </Link>

        <div
          className="mono"
          style={{ fontSize: 12, color: "var(--fg-mute)", marginBottom: 20 }}
        >
          {formatDate(post.date)} · {post.author}
        </div>

        <h1
          style={{
            fontSize: "clamp(26px, 3.5vw, 38px)",
            fontWeight: 500,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            marginBottom: 48,
            color: "var(--fg)",
          }}
        >
          {post.title}
        </h1>

        <div
          className="prose"
          style={{ borderTop: "1px solid var(--line)", paddingTop: 40 }}
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </div>
    </div>
  );
}
