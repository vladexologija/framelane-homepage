"use client";

import { SITE } from "@/lib/constants";
import { useState, useEffect, useRef } from "react";
import { HeroCanvas } from "@/components/hero-canvas";

const DEMO_VIDEO_URL =
  "https://cdn-user.framelane.io/render/029302df-94be-4b1d-a60f-604342794d87.mp4";

type Kind = "ok" | "active" | "pending" | "warn";

const PALETTE: Record<Kind, string> = {
  ok: "var(--green)",
  active: "var(--orange)",
  pending: "var(--fg-dim)",
  warn: "var(--orange)",
};
const ICONS: Record<Kind, string> = {
  ok: "✓",
  active: "▸",
  pending: "·",
  warn: "⚠",
};

function logLines(p: number) {
  const st = (a: number, d: number): Kind =>
    p >= d ? "ok" : p >= a ? "active" : "pending";
  const done = p >= 1;
  return [
    { t: "00:00", text: "edit applied: 0 violations", kind: (p >= 0.03 ? "ok" : "pending") as Kind },
    { t: "00:01", text: "preview ok: same engine as render", kind: (p >= 0.05 ? "ok" : "pending") as Kind },
    { t: "00:03", text: "1920×1080 h264 30 fps", kind: (p >= 0.07 ? "ok" : "pending") as Kind },
    { t: "00:03", text: "gpu: NVIDIA L4", kind: (p >= 0.09 ? "ok" : "pending") as Kind },
    { t: "00:04", text: "hdr detected", kind: (p >= 0.11 ? "ok" : "pending") as Kind },
    { t: "00:04", text: "stereo · loudness −14 LUFS", kind: (p >= 0.13 ? "ok" : "pending") as Kind },
    { t: "00:05", text: "dropped transition (×2)", kind: (p >= 0.14 ? "warn" : "pending") as Kind },
    { t: "00:05", text: "init decoders · 720 frames", kind: (p >= 0.16 ? "ok" : "pending") as Kind },
    { t: "00:06", text: "render frame 72 / 720", kind: st(0.16, 0.4) },
    { t: "00:08", text: "render frame 288 / 720", kind: st(0.4, 0.66) },
    { t: "00:11", text: "render frame 623 / 720", kind: st(0.66, 0.9) },
    { t: "00:--", text: "encode mp4 1080p (final render, billed)", kind: st(0.9, 0.97) },
    { t: "00:--", text: "upload", kind: st(0.97, 1) },
    { t: done ? "00:12" : "00:--", text: "done · total 4.2s", kind: (done ? "ok" : "pending") as Kind },
    { t: "00:--", text: "deliver via webhook", kind: (done ? "ok" : "pending") as Kind },
  ];
}

const S = { color: "#A3CFFF" }; // string literal
const N = { color: "#FFB87A" }; // number
const K = { color: "var(--orange)" }; // keyword

const CODE = (
  <>
    <span style={K}>curl</span> -X <span style={K}>POST</span> https://api.framelane.io/v1/renders \
    {"\n"}
    {"  "}-H <span style={S}>&quot;Authorization: Bearer $FRAMELANE_API_KEY&quot;</span> \{"\n"}
    {"  "}-H <span style={S}>&quot;Content-Type: application/json&quot;</span> \{"\n"}
    {"  "}-d {"'{"}
    {"\n"}
    {"    "}
    <span style={S}>&quot;width&quot;</span>: <span style={N}>1920</span>,{"\n"}
    {"    "}
    <span style={S}>&quot;height&quot;</span>: <span style={N}>1080</span>,{"\n"}
    {"    "}
    <span style={S}>&quot;duration&quot;</span>: <span style={N}>15</span>,{"\n"}
    {"    "}
    <span style={S}>&quot;elements&quot;</span>: [{"\n"}
    {"      {"}
    {"\n"}
    {"        "}
    <span style={S}>&quot;type&quot;</span>: <span style={S}>&quot;video&quot;</span>,{"\n"}
    {"        "}
    <span style={S}>&quot;source_url&quot;</span>: <span style={S}>&quot;raw.mp4&quot;</span>
    {"\n"}
    {"      },"}
    {"\n"}
    {"      {"}
    {"\n"}
    {"        "}
    <span style={S}>&quot;type&quot;</span>: <span style={S}>&quot;text&quot;</span>,{"\n"}
    {"        "}
    <span style={S}>&quot;text&quot;</span>: <span style={S}>&quot;Ship day&quot;</span>
    {"\n"}
    {"      }"}
    {"\n"}
    {"    "}]{"\n"}
    {"  }'"}
  </>
);

function Console() {
  const [stage, setStage] = useState<"idle" | "rendering" | "done">("idle");
  const [p, setP] = useState(0);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);

  const clear = () => {
    if (ivRef.current) clearInterval(ivRef.current);
    ivRef.current = null;
  };

  const start = () => {
    startedRef.current = true;
    clear();
    setStage("rendering");
    setP(0);
    const dur = 4800;
    const tick = 45;
    let elapsed = 0;
    ivRef.current = setInterval(() => {
      elapsed += tick;
      const np = elapsed / dur;
      if (np >= 1) {
        clear();
        setP(1);
        setStage("done");
      } else {
        setP(np);
      }
    }, tick);
  };

  // Auto-start 5s after mount, unless the visitor already hit Render.
  useEffect(() => {
    const auto = setTimeout(() => {
      if (!startedRef.current) start();
    }, 5000);
    return () => {
      clearTimeout(auto);
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const frame = Math.min(720, Math.round(p * 720));

  // Keep the log pinned to its newest line as the render advances.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stage !== "idle") el.scrollTop = el.scrollHeight;
  }, [p, stage]);

  return (
    <div
      className="card"
      style={{
        background: "var(--bg-elev)",
        borderRadius: 9,
        overflow: "hidden",
        alignSelf: "start",
        height: 540,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 14px",
          borderBottom: "1px solid var(--line)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{ width: 11, height: 11, borderRadius: "50%", background: "#3b3f55" }}
            />
          ))}
        </div>
        <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-mute)" }}>
          <span style={{ color: "var(--green)" }}>POST</span> /v1/renders
        </span>
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: "var(--fg-mute)" }}>
          ⧉ Copy
        </span>
      </div>

      {/* Idle: code + Render button */}
      {stage === "idle" && (
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", borderBottom: "1px solid var(--line)", background: "var(--bg-2)", flexShrink: 0 }}>
            {[
              ["cURL", true],
              ["TypeScript", false],
              ["Python", false],
              ["MCP", false],
            ].map(([label, active]) => (
              <span
                key={label as string}
                className="mono"
                title={active ? undefined : "Coming soon"}
                style={{
                  padding: "10px 12px",
                  fontSize: 11,
                  color: active ? "var(--fg)" : "var(--fg-mute)",
                  borderBottom: active ? "2px solid var(--orange)" : "2px solid transparent",
                  letterSpacing: "0.02em",
                  opacity: active ? 1 : 0.45,
                  cursor: active ? "default" : "not-allowed",
                }}
              >
                {label}
              </span>
            ))}
          </div>
          <pre
            className="mono"
            style={{
              margin: 0,
              padding: 16,
              fontSize: 11.5,
              lineHeight: 1.75,
              color: "var(--fg-2)",
              overflow: "auto",
              background: "transparent",
              flex: 1,
              minHeight: 0,
            }}
          >
            {CODE}
          </pre>
          <div style={{ borderTop: "1px solid var(--line)", background: "var(--bg-2)", padding: "14px 16px", flexShrink: 0 }}>
            <button
              onClick={start}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", height: 42 }}
            >
              ▶ Render
            </button>
          </div>
        </div>
      )}

      {/* Rendering & done: logs stay visible; video replaces the countdown */}
      {stage !== "idle" && (
        <div
          style={{
            padding: 16,
            background: "var(--bg-2)",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexShrink: 0 }}>
            <span
              className="mono"
              style={{
                fontSize: 9.5,
                letterSpacing: "0.14em",
                color: "var(--fg-dim)",
                textTransform: "uppercase",
              }}
            >
              Project log
            </span>
            {stage === "done" ? (
              <span style={{ color: "var(--green)", fontSize: 12 }}>✓</span>
            ) : (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--orange)",
                  animation: "pulse 1.2s ease-in-out infinite",
                }}
              />
            )}
            <span style={{ flex: 1 }} />
            <span className="mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
              {stage === "done" ? "total 4.2s" : `frame ${frame} / 720`}
            </span>
          </div>
          <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            <div className="mono" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {logLines(p).map((ln, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 9, fontSize: 11.5, lineHeight: 1.4, alignItems: "flex-start" }}
                >
                  <span style={{ color: "var(--fg-dim)", minWidth: 40 }}>{ln.t}</span>
                  <span style={{ color: PALETTE[ln.kind], minWidth: 10 }}>{ICONS[ln.kind]}</span>
                  <span style={{ color: ln.kind === "pending" ? "var(--fg-dim)" : "var(--fg-2)" }}>
                    {ln.text}
                  </span>
                </div>
              ))}
            </div>
            {/* Video preview — only after the render completes */}
            {stage === "done" && (
              <div style={{ marginTop: 14 }}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  borderRadius: 6,
                  overflow: "hidden",
                  border: "1px solid var(--line-strong)",
                  background: "#0A0E1F",
                }}
              >
                <video
                  src={DEMO_VIDEO_URL}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", top: 8, left: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    className="mono"
                    style={{
                      fontWeight: 600,
                      fontSize: 10,
                      letterSpacing: "0.03em",
                      color: "#fff",
                      background: "rgba(0,0,0,.45)",
                      padding: "1px 6px",
                      borderRadius: 2,
                    }}
                  >
                    00:12:04
                  </span>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function Hero() {
  return (
    <section style={{ position: "relative", overflow: "hidden", padding: "64px 0 72px" }}>
      {/* Shader render-pass backdrop */}
      <HeroCanvas mode="subtle" />
      {/* Left playhead rail */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: 2,
          background: "linear-gradient(180deg, var(--orange), transparent)",
          opacity: 0.55,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
        <div
          className="two-col-grid"
          style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 44, alignItems: "start" }}
        >
          {/* Left: copy */}
          <div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
              <span className="pill">
                <span className="dot" />
                v0.1 · public beta
              </span>
              <span className="eyebrow">Professional video production API for agents</span>
            </div>
            <h1
              style={{
                margin: 0,
                maxWidth: "18ch",
                fontSize: "clamp(42px, 5vw, 66px)",
                lineHeight: 1.0,
                letterSpacing: "-0.035em",
                fontWeight: 500,
              }}
            >
              Give your AI agent a professional{" "}
              <span style={{ color: "var(--orange-hi)" }}>video production engine</span>.
            </h1>
            <p className="lede" style={{ marginTop: 22, maxWidth: "56ch" }}>
              Your agent writes the plan, previews the result, and renders the video.
              <br />
              Built with Rust. GPU native. Timeline as state. No React. No browser. No
              Lambda.
            </p>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 26, flexWrap: "wrap" }}>
              <a className="btn btn-primary" href={SITE.consoleUrl}>
                Start rendering free →
              </a>
              <a className="btn btn-ghost" href={SITE.docsUrl}>
                View docs
              </a>
            </div>
            <div style={{ marginTop: 14, fontSize: 13, color: "var(--fg-mute)" }}>
              No credit card required · API + MCP · Preview before render
            </div>
          </div>

          {/* Right: stateful console */}
          <Console />
        </div>
      </div>
    </section>
  );
}
