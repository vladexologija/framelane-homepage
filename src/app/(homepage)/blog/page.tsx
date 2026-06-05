import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog — FrameLane",
  description: "Engineering notes and product updates from the FrameLane team.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="wrap" style={{ paddingTop: 80, paddingBottom: 120 }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="eyebrow" style={{ marginBottom: 24 }}>
          Blog
        </div>
        <h1
          style={{
            fontSize: "clamp(32px, 4vw, 48px)",
            letterSpacing: "-0.03em",
            marginBottom: 64,
          }}
        >
          Engineering notes 
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{
                display: "block",
                padding: "28px 0",
                borderTop: "1px solid var(--line)",
                transition: "opacity 0.15s",
              }}
            >
              <div
                className="mono"
                style={{ fontSize: 12, color: "var(--fg-mute)", marginBottom: 10 }}
              >
                {formatDate(post.date)}
              </div>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.3,
                  marginBottom: 10,
                  color: "var(--fg)",
                }}
              >
                {post.title}
              </h2>
              <p style={{ fontSize: 14, color: "var(--fg-mute)", lineHeight: 1.6 }}>
                {post.excerpt}
              </p>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  color: "var(--orange)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                Read post →
              </div>
            </Link>
          ))}
          <div style={{ borderTop: "1px solid var(--line)" }} />
        </div>
      </div>
    </div>
  );
}
