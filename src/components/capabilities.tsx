"use client";

import { useState } from "react";

const CAPS = [
  {
    key: "ingest",
    label: "Asset ingest",
    icon: "↓",
    desc: "Upload or reference video, audio, images, fonts, and LUTs. FrameLane handles metadata, proxies, transcoding, and problematic media inputs.",
    pills: [
      "MP4", "MOV", "WebM", "MKV", "ProRes", "H.264", "H.265", "AV1",
      "JPEG", "PNG", "WebP", "GIF", "MP3", "WAV", "AAC", "OGG", "LUT",
    ],
  },
  {
    key: "timeline",
    label: "Timeline editing",
    icon: "⊞",
    desc: "Build multi-scene timelines from clips, images, and audio. Precise frame-level control over every element.",
    pills: [
      "Trim", "Cut", "Split", "Merge", "Loop", "Reverse",
      "Crop", "Resize", "Rotate", "Flip", "Scale",
      "Speed change", "Freeze frame",
      "Frame-accurate cuts", "Aspect ratio conversion",
      "9:16", "16:9", "1:1", "4:5",
    ],
  },
  {
    key: "captions",
    label: "Captions & text",
    icon: "Aa",
    desc: "Add styled text, captions, per-word timing, animations and custom fonts to any layer.",
    pills: [
      "Subtitles", "Captions", "Word-level timing",
      "Font size", "Font weight",
      "Letter spacing", "Line height", "Text shadow", "Stroke",
      "Text animations", "Character animations",
      "Auto-wrap", "Active word color",
    ],
  },
  {
    key: "compositing",
    label: "Compositing",
    icon: "◫",
    desc: "Layer videos, images, overlays, watermarks, and backgrounds with full control over position, opacity, blending, and z-order.",
    pills: [
      "Multi-layer", "Z-ordering", "Opacity", "Blend modes",
      "Position XY", "Scale", "Rotation",
      "Rounded corners", "Border", "Drop shadow",
      "Logo overlay", "Sticker", "Background image",
      "Background video", "Chroma key",
    ],
  },
  {
    key: "effects",
    label: "Effects & color",
    icon: "◐",
    desc: "Apply GPU-accelerated effects, color grades, and artistic filters from tools like Premiere Pro / Final Cut Pro.",
    pills: [
      "LUT color grading", "Brightness",
      "Contrast", "Saturation", "Hue", "Temperature", "Tint",
      "Shadows", "Highlights", "Whites", "Blacks", "Clarity",
      "Vignette", "Sepia", "Film grain", "Invert", "Posterize",
      "Sharpen", "Blur", "Bokeh blur", "Lens flare",
      "Fisheye", "Chromatic aberration", "Halftone", "Pixelate", "Fade",
      "29 transitions", "Dissolve", "Wipe", "Slide", "Zoom", "Spin", "Page flip", "Ripple",
      "HDR input", "Tonemap",
    ],
  },
  {
    key: "ai",
    label: "AI video effects",
    icon: "✦",
    desc: "GPU-accelerated AI effects that run inside the render pipeline — no separate processing step required.",
    pills: [
      "Background removal",
      "Gaze correction", "Eye contact redirect",
      "Super resolution", "2× upscale", "4× upscale",
      "Transparent video export",
    ],
  },
  {
    key: "audio",
    label: "Audio",
    icon: "♪",
    desc: "Mix and replace audio.",
    pills: [
      "Multi-track mixing", "Volume control", "Fade in", "Fade out",
      "Trim audio", "Replace audio", "Extract audio", "Mute track",
      "Audio delay", "Audio speed",
      "Add music", "Add SFX", "Cross-fade", "Loop audio",
    ],
  },
  {
    key: "preview",
    label: "Render & preview",
    icon: "▶",
    desc: "Export production-ready video in multiple formats, resolutions, and delivery modes. Preview via WASM coming soon!",
    pills: [
      "MP4 export", "WebM export", "Alpha video", "MOV export",
      "1080p", "4K", "Custom resolution", "HDR",
      "H.264", "H.265", "VP9", "AV1", "Configurable bitrate",
    ],
  },
  {
    key: "delivery",
    label: "Delivery & webhooks",
    icon: "↑",
    desc: "Submit jobs, track progress, receive completion events, and retrieve final output URLs through a simple event model.",
    pills: [
      "REST API", "OpenAPI", "MCP", "NPM",
      "Webhook", "Priority queues",
      "CDN delivery", "Expiry control",
    ],
  },
] as const;

type CapKey = (typeof CAPS)[number]["key"];

export function Capabilities() {
  const [active, setActive] = useState<CapKey>("ingest");
  const cap = CAPS.find((c) => c.key === active) ?? CAPS[0];

  const endpointPath = (key: string) => {
    if (key === "preview") return "renders/preview";
    if (key === "delivery") return "webhooks";
    if (key === "ai") return "effects/ai";
    return key;
  };

  return (
    <section
      id="capabilities"
      style={{
        background:
          "linear-gradient(180deg, transparent, rgba(255,255,255,0.012), transparent)",
      }}
    >
      <div className="section-tag">
        <span className="num-marker">02 / PIPELINE</span>
      </div>
      <div className="wrap">
        <div style={{ maxWidth: 880, marginBottom: 56 }}>
          <h2>
            Everything an agent needs
            <br />
            <span className="serif-i" style={{ color: "var(--fg-2)" }}>
              to produce video.
            </span>
          </h2>
          <p className="lede" style={{ marginTop: 24 }}>
            A complete editing and rendering pipeline exposed through API, SDKs,
            and MCP.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: 0,
            border: "1px solid var(--line)",
            borderRadius: 8,
            overflow: "hidden",
            background: "var(--bg-2)",
          }}
        >
          {/* Sidebar */}
          <div
            style={{
              borderRight: "1px solid var(--line)",
              padding: "14px 0",
              background: "rgba(0,0,0,0.15)",
            }}
          >
            {CAPS.map((c, i) => (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 22px",
                  textAlign: "left",
                  color: active === c.key ? "var(--fg)" : "var(--fg-2)",
                  background:
                    active === c.key ? "rgba(255,122,26,0.06)" : "transparent",
                  borderLeft: `2px solid ${active === c.key ? "var(--orange)" : "transparent"}`,
                  transition: "all 0.15s",
                  fontSize: 14,
                }}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    width: 22,
                    color:
                      active === c.key ? "var(--orange)" : "var(--fg-dim)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: 14, letterSpacing: "-0.005em" }}>
                  {c.label}
                </span>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div
            key={cap.key}
            className="fade-in"
            style={{ padding: "40px 44px", minHeight: 380 }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: "rgba(255,122,26,0.1)",
                border: "1px solid rgba(255,122,26,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                color: "var(--orange)",
                marginBottom: 22,
              }}
            >
              {cap.icon}
            </div>

            <h3
              style={{
                fontSize: 28,
                letterSpacing: "-0.02em",
                marginBottom: 14,
              }}
            >
              {cap.label}
            </h3>
            <p
              style={{
                color: "var(--fg-2)",
                fontSize: 16,
                lineHeight: 1.6,
                maxWidth: "58ch",
                marginBottom: 24,
              }}
            >
              {cap.desc}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px 6px",
                marginBottom: 32,
              }}
            >
              {cap.pills.map((pill) => (
                <span
                  key={pill}
                  style={{
                    fontSize: 12,
                    padding: "3px 10px",
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--line)",
                    color: "var(--fg-2)",
                    letterSpacing: "0.01em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {pill}
                </span>
              ))}
            </div>

            <div
              className="mono"
              style={{
                padding: 16,
                background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--line)",
                borderRadius: 4,
                fontSize: 12,
                lineHeight: 1.7,
                color: "var(--fg-2)",
              }}
            >
              <span style={{ color: "var(--fg-dim)" }}>POST </span>
              <span style={{ color: "var(--orange)" }}>
                /v1/{endpointPath(cap.key)}
              </span>
              <span style={{ color: "var(--fg-dim)" }}>&nbsp; →&nbsp; </span>
              <span style={{ color: "var(--green)" }}>200 OK</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
