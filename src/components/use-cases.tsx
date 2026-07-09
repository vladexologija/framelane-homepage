"use client";

import { useEffect, useRef, useState } from "react";

function VolumeOffIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function VolumeOnIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

const USE_CASES = [
  {
    key: "layered",
    tab: "Layered video composition",
    title: "Layered video composition",
    prompt:
      "Stack two full-frame clips with vintage and bokeh effects, drop in a bordered PiP at second 30, sequence four text layers with fade, difference, overlay, and evaporate motion — export 3840×2160.",
    chips: [
      "Vintage effect",
      "Bokeh blur",
      "PiP overlay",
      "Text motion",
      "Difference blend",
      "4K export",
    ],
    desc: "Stack video layers with effects, add a picture-in-picture overlay, and sequence text with blend and dissolve motion, all in one project you edit, preview, then render.",
    videoUrl: "https://cdn-user.framelane.io/render/2b8b409a-b706-4f5a-a2b0-caf391740eae.mp4",
    aspectRatio: "16 / 9",
  },
  {
    key: "podcast",
    tab: "Video → TikTok captions",
    title: "Video → TikTok captions",
    prompt:
      "Take the section from 00:22:43 to 00:44:56, crop to vertical, add an opening title with Difference blend, then burn in word-timed captions — mix color, box, and glow styles across different fonts.",
    chips: [
      "Trim",
      "Word animation",
      "Difference blend",
      "Timed captions",
      "Multi-style lines",
      "1080×1920 vertical",
    ],
    desc: "Word-timed karaoke captions on a vertical clip: opening title, sequential caption lines, and multiple highlight styles in one project you edit, preview, then render.",
    videoUrl:
      "https://cdn-user.framelane.io/render/90860287-1407-4090-a025-120cb3b02180.mp4",
    aspectRatio: "9 / 16",
  },
  {
    key: "text-behind",
    tab: "Text behind the speaker",
    title: "Text behind the speaker",
    prompt:
      "Stack background video, giant title text, and a transparent speaker cutout with z-index layering, burn in color word-animation captions, and fade out a logo sting — export 3840×2160.",
    chips: [
      "z-index layering",
      "WebM cutout",
      "Word animation",
      "Title fade",
      "Logo sting",
      "4K export",
    ],
    desc: "Giant title text sits behind a cutout speaker, karaoke captions float on top, and a logo sting opens the clip, all in one project you edit, preview, then render.",
    videoUrl: "https://cdn-user.framelane.io/render/029302df-94be-4b1d-a60f-604342794d87.mp4",
    aspectRatio: "16 / 9",
  },
] as const;

type UseCase = (typeof USE_CASES)[number];

function VideoPreview({
  url,
  aspectRatio,
}: {
  url: string;
  aspectRatio: string;
}) {
  const isVertical = aspectRatio === "9 / 16";
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // The `muted` attribute is only honored on initial mount, so sync it imperatively.
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = muted;
  }, [muted]);

  return (
    <div
      className="card"
      style={{
        width: isVertical ? "50%" : "100%",
        margin: isVertical ? "0 auto" : undefined,
        minWidth: 0,
        padding: 12,
        background: "var(--bg-elev)",
        borderRadius: 8,
      }}
    >
      <div style={{ position: "relative" }}>
        <video
          ref={videoRef}
          src={url}
          autoPlay
          loop
          muted
          playsInline
          style={{
            display: "block",
            width: "100%",
            aspectRatio,
            borderRadius: 4,
            border: "1px solid var(--line-strong)",
            background: "#0A0E1F",
            objectFit: "cover",
          }}
        />
        <button
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 26,
            height: 26,
            borderRadius: 4,
            background: "rgba(0,0,0,0.4)",
            color: "rgba(255,255,255,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
          }}
        >
          {muted ? <VolumeOffIcon /> : <VolumeOnIcon />}
        </button>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 12,
          paddingTop: 10,
          borderTop: "1px solid var(--line)",
        }}
      >
        <span className="mono" style={{ fontSize: 11, color: "var(--fg-mute)" }}>
          proj_01HX5DG
        </span>
        <span className="mono" style={{ fontSize: 11, color: "var(--green)" }}>
          done ●  total 18.2s
        </span>
      </div>
    </div>
  );
}

export function UseCases() {
  const [active, setActive] = useState<string>("layered");
  const data = USE_CASES.find((u) => u.key === active) ?? USE_CASES[0];

  return (
    <section id="usecases">
      <div className="section-tag">
        <span className="num-marker">01 / EXAMPLES</span>
      </div>
      <div className="wrap">
        <div style={{ maxWidth: 880, marginBottom: 56 }}>
          <h2>
            What agents can make
            <br />
            <span className="serif-i" style={{ color: "var(--fg-2)" }}>
              with FrameLane.
            </span>
          </h2>
          <p className="lede" style={{ marginTop: 24 }}>
            Start with real footage. Let your agent edit and preview a project.
            FrameLane renders the final video.
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 0,
            borderBottom: "1px solid var(--line)",
            marginBottom: 32,
          }}
        >
          {USE_CASES.map((u) => (
            <button
              key={u.key}
              onClick={() => setActive(u.key)}
              style={{
                padding: "14px 0",
                marginRight: 32,
                fontSize: 14,
                color: active === u.key ? "var(--fg)" : "var(--fg-mute)",
                borderBottom: `2px solid ${active === u.key ? "var(--orange)" : "transparent"}`,
                marginBottom: -1,
                letterSpacing: "-0.005em",
                transition: "all 0.15s",
              }}
            >
              {u.tab}
            </button>
          ))}
        </div>

        <div
          className="fade-in two-col-grid"
          key={active}
          style={{ gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", gap: 48 }}
        >
          {/* Left */}
          <div>
            <div
              className="eyebrow"
              style={{ color: "var(--orange)", marginBottom: 14 }}
            >
              USE CASE
            </div>
            <h3
              style={{
                fontSize: 32,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                marginBottom: 24,
              }}
            >
              {data.title}
            </h3>

            <div
              style={{
                borderLeft: "2px solid var(--orange)",
                paddingLeft: 18,
                marginBottom: 26,
              }}
            >
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--orange)",
                  letterSpacing: "0.1em",
                  marginBottom: 8,
                }}
              >
                AGENT PROMPT
              </div>
              <p
                className="mono"
                style={{ fontSize: 13, lineHeight: 1.6, color: "var(--fg-2)" }}
              >
                &ldquo;{data.prompt}&rdquo;
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 24,
              }}
            >
              {data.chips.map((c) => (
                <span
                  key={c}
                  className="mono"
                  style={{
                    fontSize: 11,
                    padding: "5px 10px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--line)",
                    borderRadius: 3,
                    color: "var(--fg-2)",
                  }}
                >
                  {c}
                </span>
              ))}
            </div>

            <p
              style={{
                color: "var(--fg-2)",
                fontSize: 15,
                lineHeight: 1.6,
                maxWidth: "52ch",
              }}
            >
              {data.desc}
            </p>
          </div>

          {/* Right */}
          <div style={{ minWidth: 0, width: "100%" }}>
            <VideoPreview url={data.videoUrl} aspectRatio={data.aspectRatio} />
          </div>
        </div>
      </div>
    </section>
  );
}
