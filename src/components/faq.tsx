"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "What is FrameLane?",
    a: "FrameLane is a video editing and rendering API designed for AI agents. It exposes a complete video production pipeline — from ingest to render — through HTTP, SDKs, and MCP, so agents can plan edits and produce finished videos in a single workflow.",
  },
  {
    q: "Which video formats do you support?",
    a: "Input: MP4, MOV, WebM, MKV, MXF, ProRes, DNxHR, and most codecs FFmpeg understands. Output: H.264, H.265, AV1, and ProRes up to 4K. Audio: AAC, Opus, FLAC, WAV. Images: JPEG, PNG, WebP, AVIF, GIF.",
  },
  {
    q: "How does pricing work?",
    a: "Pay per render minute. The free tier includes 30 minutes of rendering and unlimited preview frames. Paid plans start at $0.04 per rendered minute at 1080p, with volume discounts and dedicated capacity available.",
  },
  {
    q: "Can I use my own custom assets and templates?",
    a: "Yes. Upload fonts, LUTs, overlays, intro/outro templates, and brand kits via the assets API. Reference them by ID in render jobs, or attach them at the workspace level so every agent in your account has access.",
  },
  {
    q: "How do I know when a render job finishes?",
    a: "Three options: poll the jobs endpoint, subscribe to a webhook delivered per stage (queued → rendering → encoded → delivered), or use the streaming SDK that emits events over server-sent events.",
  },
  {
    q: "Is there an SLA?",
    a: "Enterprise plans include a 99.9% uptime SLA with credit-back guarantees, dedicated render capacity, BYO cloud options, and SOC 2 Type II compliance. Reach out for details.",
  },
];

function FAQItem({
  item,
  idx,
  open,
  onToggle,
}: {
  item: { q: string; a: string };
  idx: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ borderBottom: "1px solid var(--line)" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "22px 0",
          display: "flex",
          alignItems: "center",
          gap: 20,
          textAlign: "left",
        }}
      >
        <span
          className="mono"
          style={{ fontSize: 11, color: "var(--fg-dim)", minWidth: 24 }}
        >
          0{idx + 1}
        </span>
        <span
          style={{
            flex: 1,
            fontSize: 17,
            color: "var(--fg)",
            letterSpacing: "-0.01em",
          }}
        >
          {item.q}
        </span>
        <span
          style={{
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: open ? "var(--orange)" : "var(--fg-mute)",
            transition: "all 0.2s",
            transform: open ? "rotate(45deg)" : "rotate(0)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14">
            <line
              x1="7"
              y1="2"
              x2="7"
              y2="12"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <line
              x1="2"
              y1="7"
              x2="12"
              y2="7"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? 220 : 0,
          overflow: "hidden",
          transition: "max-height 0.32s ease",
        }}
      >
        <div
          style={{
            paddingLeft: 44,
            paddingBottom: 22,
            color: "var(--fg-2)",
            fontSize: 15,
            lineHeight: 1.65,
            maxWidth: "64ch",
          }}
        >
          {item.a}
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section>
      <div className="section-tag">
        <span className="num-marker">05 / FAQ</span>
      </div>
      <div className="wrap">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)",
            gap: 80,
            alignItems: "start",
          }}
        >
          <div>
            <h2>
              Frequently
              <br />
              asked
              <br />
              <span className="serif-i" style={{ color: "var(--fg-2)" }}>
                questions.
              </span>
            </h2>
            <p
              style={{
                color: "var(--fg-2)",
                fontSize: 16,
                marginTop: 24,
                lineHeight: 1.6,
                maxWidth: "38ch",
              }}
            >
              Everything you need to know about FrameLane. Don&apos;t see your
              question?{" "}
              <a href="#" style={{ color: "var(--orange)" }}>
                Ask the team →
              </a>
            </p>
          </div>

          <div style={{ borderTop: "1px solid var(--line)" }}>
            {FAQS.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                idx={i}
                open={open === i}
                onToggle={() => setOpen(open === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
