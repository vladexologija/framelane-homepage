"use client";

import { useState } from "react";

const WORKFLOWS = [
  {
    icon: "✂",
    title: "Short-form clipping agents",
    desc: "Turn podcasts, interviews, webinars, and streams into TikTok, Reels, Shorts, and LinkedIn clips.",
    tags: ["clip", "crop", "captions", "progress bar", "branding", "9:16 export"],
  },
  {
    icon: "◐",
    title: "Talking-head enhancement agents",
    desc: "Clean up webcam or creator footage with background removal, gaze correction, subtitles, color grading, and 4K export.",
    tags: ["bg removal", "gaze correction", "LUTs", "captions", "4K"],
  },
  {
    icon: "⊞",
    title: "Video-ad generation agents",
    desc: "Generate high-volume product, UGC, and paid-social video variants from structured inputs.",
    tags: ["text overlays", "layouts", "transitions", "audio mix", "render"],
  },
  {
    icon: "◰",
    title: "Course & webinar repurposing",
    desc: "Convert long educational videos into chapters, previews, clips, thumbnails, and localized variants.",
    tags: ["scene assembly", "captions", "audio replacement", "export suites"],
  },
  {
    icon: "⇄",
    title: "Localization pipelines",
    desc: "Swap audio tracks, burn translated subtitles, adjust layouts, and render per-locale variants.",
    tags: ["multi-audio", "TTS dub", "caption burn", "match render"],
  },
  {
    icon: "↑",
    title: "UGC normalization",
    desc: "Normalize messy user-uploaded footage before publishing: resize, transcode, fix levels, add branding, render to spec.",
    tags: ["transcode", "resize", "color adjust", "watermark", "composite"],
  },
];

function WorkflowCard({
  icon,
  title,
  desc,
  tags,
  index,
}: {
  icon: string;
  title: string;
  desc: string;
  tags: string[];
  index: number;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "32px 30px",
        borderRight: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
        background: hover ? "rgba(255,255,255,0.015)" : "transparent",
        transition: "background 0.2s",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            background: hover
              ? "rgba(255,122,26,0.12)"
              : "rgba(255,255,255,0.04)",
            border: `1px solid ${hover ? "rgba(255,122,26,0.3)" : "var(--line)"}`,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            color: hover ? "var(--orange)" : "var(--fg-2)",
            transition: "all 0.2s",
          }}
        >
          {icon}
        </div>
        <span
          className="mono"
          style={{
            fontSize: 10,
            color: "var(--fg-dim)",
            letterSpacing: "0.1em",
          }}
        >
          0{index + 1}
        </span>
      </div>
      <h3
        style={{
          fontSize: 17,
          marginBottom: 12,
          letterSpacing: "-0.01em",
          lineHeight: 1.25,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "var(--fg-2)",
          lineHeight: 1.55,
          marginBottom: 16,
          minHeight: 65,
        }}
      >
        {desc}
      </p>
      <div
        className="mono"
        style={{
          fontSize: 11,
          color: "var(--fg-mute)",
          lineHeight: 1.6,
          letterSpacing: "0.02em",
        }}
      >
        {tags.map((t, i) => (
          <span key={t}>
            {t}
            {i < tags.length - 1 && (
              <span style={{ color: "var(--fg-dim)" }}> · </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Workflows() {
  return (
    <section>
      <div className="section-tag">
        <span className="num-marker">04 / USE CASES</span>
      </div>
      <div className="wrap">
        <div style={{ maxWidth: 880, marginBottom: 56 }}>
          <h2>
            Workflows agents can
            <br />
            <span className="serif-i" style={{ color: "var(--fg-2)" }}>
              automate today.
            </span>
          </h2>
          <p className="lede" style={{ marginTop: 24 }}>
            From content pipelines to localization workflows, FrameLane enables
            any agent to produce and deliver video.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
            gap: 0,
            border: "1px solid var(--line)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {WORKFLOWS.map((w, i) => (
            <WorkflowCard key={i} {...w} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
