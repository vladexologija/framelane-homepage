"use client";

import { useState } from "react";

const USE_CASES = [
  {
    key: "podcast",
    tab: "Podcast clip → TikTok",
    title: "Podcast clip → TikTok-ready short",
    prompt:
      "Find the best 45-second moment, crop to vertical, add karaoke captions, blur the background, add a progress bar, and render for TikTok.",
    chips: [
      "Trim",
      "0:30 clip",
      "Karaoke captions",
      "Progress bar",
      "Background blur",
      "1080×1920 vertical",
    ],
    desc: "Turn long-form video into platform-ready shorts — with captions, layouts, overlays, and export settings handled in one render job.",
    beforeLabel: "16:9 source",
    afterLabel: "9:16 short",
  },
  {
    key: "talking",
    tab: "Talking-head cleanup",
    title: "Webcam recording → studio-grade clip",
    prompt:
      "Remove the green-room background, fix uneven audio, generate burned-in subtitles, color-grade to neutral, export 4K MP4.",
    chips: [
      "Background removal",
      "Audio level",
      "Burned-in subs",
      "Neutral LUT",
      "4K export",
      "Noise reduction",
    ],
    desc: "Clean up creator and webcam footage with background removal, gaze correction, subtitles, color, and high-bitrate export.",
    beforeLabel: "raw webcam",
    afterLabel: "cleaned",
  },
  {
    key: "ad",
    tab: "Product ad variants",
    title: "One product shot → 12 ad variants",
    prompt:
      "From this product video and copy spreadsheet, generate twelve 6-second ads with different hooks, formats, and CTAs. Export 9:16, 1:1, 16:9.",
    chips: [
      "Variant matrix",
      "Dynamic text",
      "Layouts ×3",
      "Music beds",
      "Export ×3",
      "Per-locale",
    ],
    desc: "Generate high-volume product, UGC, and paid-social variants from structured inputs — text, layout, music, and CTA permutations.",
    beforeLabel: "master cut",
    afterLabel: "12 variants",
  },
] as const;

type UseCase = (typeof USE_CASES)[number];

function PreviewFrame({
  kind,
  side,
  label,
}: {
  kind: string;
  side: "before" | "after";
  label: string;
}) {
  const isVertical = kind === "podcast" && side === "after";
  const w = isVertical ? 86 : 160;
  const h = isVertical ? 152 : 90;
  const bg =
    side === "before"
      ? "linear-gradient(135deg, #2A2540, #1A1E40)"
      : "linear-gradient(135deg, #1F2A4D, #2A3060)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: w,
          height: h,
          background: bg,
          borderRadius: 4,
          position: "relative",
          overflow: "hidden",
          border: "1px solid var(--line-strong)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 8px, transparent 8px 16px)",
          }}
        />
        {side === "after" && (
          <>
            <div
              style={{
                position: "absolute",
                bottom: 8,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 8,
                fontWeight: 600,
                color: "var(--orange)",
                textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                whiteSpace: "nowrap",
              }}
            >
              ● CAPTION ●
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 2,
                background: "var(--orange)",
                width: "60%",
              }}
            />
          </>
        )}
        {kind === "ad" && side === "after" && (
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              fontSize: 7,
              color: "white",
              background: "var(--orange)",
              padding: "1px 4px",
              borderRadius: 2,
            }}
          >
            1/12
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="7" height="7" viewBox="0 0 7 7">
            <path d="M0 0 L7 3.5 L0 7 Z" fill="#0A0E1F" />
          </svg>
        </div>
      </div>
      <div
        className="mono"
        style={{
          fontSize: 10,
          color: "var(--fg-mute)",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function BeforeAfter({
  data,
}: {
  data: UseCase;
}) {
  return (
    <div
      className="card"
      style={{ padding: 22, background: "var(--bg-elev)", borderRadius: 8 }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 18,
        }}
      >
        <PreviewFrame kind={data.key} side="before" label={data.beforeLabel} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M4 11 L18 11 M14 6 L19 11 L14 16"
              stroke="var(--orange)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="mono" style={{ fontSize: 10, color: "var(--orange)" }}>
            render
          </span>
        </div>
        <PreviewFrame kind={data.key} side="after" label={data.afterLabel} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 18,
          paddingTop: 14,
          borderTop: "1px solid var(--line)",
        }}
      >
        <span className="mono" style={{ fontSize: 11, color: "var(--fg-mute)" }}>
          job_01HX5DG
        </span>
        <span className="mono" style={{ fontSize: 11, color: "var(--green)" }}>
          ● 0.18× realtime
        </span>
      </div>
    </div>
  );
}

export function UseCases() {
  const [active, setActive] = useState<string>("podcast");
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
            Start with real footage. Let your agent define the edit. FrameLane
            renders the final video.
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
          className="fade-in"
          key={active}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
            gap: 48,
            alignItems: "start",
          }}
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
          <BeforeAfter data={data} />
        </div>
      </div>
    </section>
  );
}
