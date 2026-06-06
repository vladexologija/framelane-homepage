"use client";

import { SITE } from "@/lib/constants";
import { useState, useEffect, useRef } from "react";

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect
        x="3.5"
        y="3.5"
        width="9"
        height="9"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M5.5 3V2.5C5.5 1.7 6.2 1 7 1H11C11.8 1 12.5 1.7 12.5 2.5V8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogLine({
  t,
  c,
  pulse,
  children,
}: {
  t: string;
  c: "ok" | "active" | "pending" | "warn";
  pulse?: boolean;
  children: React.ReactNode;
}) {
  const colors = {
    ok: "var(--green)",
    active: "var(--orange)",
    pending: "var(--fg-dim)",
    warn: "var(--orange)",
  };
  const icons = {
    ok: "✓",
    active: "▸",
    pending: "·",
    warn: "⚠",
  };
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        color: c === "pending" ? "var(--fg-dim)" : "var(--fg-2)",
      }}
    >
      <span style={{ color: "var(--fg-dim)", minWidth: 36 }}>{t}</span>
      <span style={{ color: colors[c], minWidth: 8 }}>{icons[c]}</span>
      <span
        style={{
          animation: pulse ? "pulse 1.4s ease-in-out infinite" : "none",
        }}
      >
        {children}
      </span>
    </div>
  );
}

const DEMO_VIDEO_URL =
  "https://cdn-user.framelane.io/render/029302df-94be-4b1d-a60f-604342794d87.mp4";

function DemoConsole({ aspect }: { aspect: string }) {
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(0);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      void video.play();
    } else {
      video.pause();
    }
  }, [playing]);

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const pct = total > 0 ? (time / total) * 100 : 0;

  const aspectRatio: Record<string, number> = {
    "16:9": 16 / 9,
    "9:16": 9 / 16,
    "1:1": 1,
  };

  return (
    <div style={{ marginTop: 60, position: "relative" }}>
      <div
        className="card"
        style={{
          padding: 0,
          overflow: "hidden",
          borderRadius: 8,
          background: "var(--bg-elev)",
        }}
      >
        {/* Header strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 14px",
            borderBottom: "1px solid var(--line)",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: "#3b3f55",
                }}
              />
            ))}
          </div>
          <div
            className="mono"
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 11.5,
              color: "var(--fg-mute)",
            }}
          >
            <span style={{ color: "var(--fg-dim)" }}>
              console.framelane.io/render/
            </span>
            <span style={{ color: "var(--fg-2)" }}>job_01HX5DG</span>
          </div>
          <span className="pill" style={{ padding: "2px 8px" }}>
            <span className="dot" style={{ background: "var(--green)" }} />
            live
          </span>
        </div>

        {/* Body */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 280px",
            minHeight: 420,
          }}
        >
          {/* Player */}
          <div
            style={{
              padding: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "radial-gradient(circle at 50% 40%, rgba(255,122,26,0.04), transparent 60%)",
              position: "relative",
            }}
          >
            <div
              style={{
                aspectRatio: aspectRatio[aspect],
                maxHeight: 340,
                width: aspect === "9:16" ? "auto" : "100%",
                maxWidth: aspect === "9:16" ? 220 : "100%",
                background: "#0A0E1F",
                borderRadius: 6,
                position: "relative",
                overflow: "hidden",
                border: "1px solid var(--line)",
                transition: "all 0.3s ease",
              }}
            >
              <video
                ref={videoRef}
                src={DEMO_VIDEO_URL}
                autoPlay
                loop
                muted
                playsInline
                onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setTotal(e.currentTarget.duration)}
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <button
                onClick={() => setPlaying((p) => !p)}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.92)",
                  color: "#0A0E1F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {playing ? (
                  <svg width="14" height="14" viewBox="0 0 14 14">
                    <rect x="2" y="1" width="3" height="12" fill="currentColor" />
                    <rect x="9" y="1" width="3" height="12" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14">
                    <path d="M3 1 L12 7 L3 13 Z" fill="currentColor" />
                  </svg>
                )}
              </button>

              {/* Progress bar */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 3,
                  background: "rgba(255,255,255,0.15)",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: "var(--orange)",
                    transition: "width 0.1s linear",
                  }}
                />
              </div>

              {/* Watermark */}
              <div
                className="mono"
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  fontSize: 9,
                  color: "rgba(255,255,255,0.6)",
                  background: "rgba(0,0,0,0.4)",
                  padding: "2px 6px",
                  borderRadius: 2,
                  letterSpacing: "0.05em",
                }}
              >
                FRAMELANE
              </div>
            </div>

            {/* Timecode */}
            <div
              className="mono"
              style={{
                position: "absolute",
                bottom: 14,
                left: 32,
                right: 32,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "var(--fg-mute)",
              }}
            >
              <span>029302df.mp4</span>
              <span>
                {fmt(time)} / {fmt(total)}
              </span>
            </div>
          </div>

          {/* Log panel */}
          <div
            style={{
              borderLeft: "1px solid var(--line)",
              background: "var(--bg-2)",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: "var(--fg-dim)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Render log
            </div>
            <div className="mono" style={{ fontSize: 11, lineHeight: 1.65 }}>
              {(() => {
                const stage = pct < 33 ? 0 : pct < 66 ? 1 : 2;
                return (
                  <>
                    <LogLine t="00:00" c="ok">
                      downloading assets: 1.2 GB
                    </LogLine>
                    <LogLine t="00:03" c="ok">
                      1920×1080 h264 30 fps
                    </LogLine>
                    <LogLine t="00:03" c="ok">
                      gpu: NVIDIA L4 
                    </LogLine>
                    <LogLine t="00:04" c="ok">
                      hdr detected
                    </LogLine>
                    <LogLine t="00:04" c="ok">
                      stereo · loudness −14 LUFS
                    </LogLine>
                    <LogLine t="00:05" c="warn">
                      dropped transition (×2)
                    </LogLine>
                    <LogLine t="00:05" c="ok">
                      init decoders · 720 frames
                    </LogLine>
                    <LogLine
                      t="00:06"
                      c={stage > 0 ? "ok" : "active"}
                      pulse={stage === 0}
                    >
                      render frame 72 / 720
                    </LogLine>
                    <LogLine
                      t="00:08"
                      c={stage > 1 ? "ok" : stage === 1 ? "active" : "pending"}
                      pulse={stage === 1}
                    >
                      render frame 288 / 720
                    </LogLine>
                    <LogLine
                      t="00:11"
                      c={stage === 2 ? "active" : "pending"}
                      pulse={stage === 2}
                    >
                      render frame 623 / 720
                    </LogLine>
                    <LogLine t="00:--" c="pending">
                      encode → mp4 1080p
                    </LogLine>
                    <LogLine t="00:--" c="pending">
                      upload
                    </LogLine>
                    <LogLine t="00:--" c="pending">
                      done · total 38.2s 
                    </LogLine>
                    <LogLine t="00:--" c="pending">
                      deliver via webhook
                    </LogLine>
                  </>
                );
              })()}
            </div>
            <div
              style={{
                marginTop: "auto",
                paddingTop: 14,
                borderTop: "1px solid var(--line)",
              }}
            >
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--fg-dim)",
                  letterSpacing: "0.08em",
                }}
              >
                EST. COMPLETION
              </div>
              <div style={{ fontSize: 22, letterSpacing: "-0.02em", marginTop: 4 }}>
                00:18s
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const [aspect, setAspect] = useState("16:9");
  const [copied, setCopied] = useState(false);

  const promptText =
    "Find the best 45-second moment, crop to vertical, add karaoke captions, blur the background, add a progress bar, and render for TikTok.";

  const copyPrompt = () => {
    navigator.clipboard?.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section style={{ paddingTop: 80, paddingBottom: 60, overflow: "hidden" }}>
      <div className="wrap">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span className="pill">
              <span className="dot" />
              v0.1 · closed beta
            </span>
            <span className="eyebrow">Professional video production API for agents</span>
          </div>

          {/* Headline */}
          <h1 style={{ maxWidth: "14ch" }}>
            Give your AI agent
            <br />a professional{" "}
            <span
              className="serif-i"
              style={{ color: "var(--orange-hi)" }}
            >
              video production engine
            </span>
            .
          </h1>

          {/* Lede */}
          <p className="lede" style={{ marginTop: 18, maxWidth: "52ch" }}>
            Your agent writes the edit plan. FrameLane renders the video.
            <br />
            Built with Rust. GPU native.
            No React. No browser. No Lambda.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            <a className="btn btn-primary" href={SITE.waitlistUrl} target="_blank" rel="noreferrer">
              Request access →
            </a>
            <a className="btn btn-ghost" href={SITE.docsUrl}>
              View docs
            </a>
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 13,
              color: "var(--fg-mute)",
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span>No credit card required · API + MCP · Preview before render </span>
          </div>
        </div>

        <DemoConsole aspect={aspect} />
      </div>
    </section>
  );
}
