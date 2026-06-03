"use client";

import { useEffect, useState } from "react";

const TARGETS = [
  { key: "browser", label: "Browser", api: "WebGPU", icon: "◐" },
  { key: "linux",   label: "Linux",   api: "Vulkan", icon: "◨" },
] as const;

type TargetKey = (typeof TARGETS)[number]["key"];

const SHADER_COLUMNS = Array.from({ length: 9 }, (_, i) => i);
const SHADER_PIXELS = Array.from({ length: 27 }, (_, i) => i);

function Connector({ branched }: { branched?: boolean }) {
  return (
    <div
      style={{
        height: 36,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="100%"
        height="36"
        viewBox="0 0 280 36"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%" }}
      >
        {!branched ? (
          <line
            x1="140" y1="0" x2="140" y2="36"
            stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="2 3"
          />
        ) : (
          <g stroke="var(--line-strong)" strokeWidth="1" fill="none" strokeDasharray="2 3">
            <line x1="140" y1="0" x2="140" y2="14" />
            <path d="M 35 30 L 35 24 Q 35 18 41 18 L 239 18 Q 245 18 245 24 L 245 30" />
            <line x1="35"  y1="30" x2="35"  y2="36" />
            <line x1="105" y1="18" x2="105" y2="36" />
            <line x1="175" y1="18" x2="175" y2="36" />
            <line x1="245" y1="30" x2="245" y2="36" />
          </g>
        )}
      </svg>
    </div>
  );
}

function PreviewConnector() {
  return (
    <div
      style={{
        height: 36,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="100%"
        height="36"
        viewBox="0 0 280 36"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%" }}
      >
        <g stroke="var(--line-strong)" strokeWidth="1" fill="none" strokeDasharray="2 3">
          <line x1="70" y1="0" x2="70" y2="14" />
          <line x1="210" y1="0" x2="210" y2="14" />
          <line x1="70" y1="14" x2="210" y2="14" />
          <line x1="140" y1="14" x2="140" y2="36" />
        </g>
      </svg>
    </div>
  );
}

function ShaderParallelGlyph() {
  return (
    <div
      aria-label="Fragment shader work distributed across many GPU cores"
      role="img"
      style={{
        marginTop: 14,
        padding: "14px 12px",
        border: "1px solid rgba(255,122,26,0.22)",
        borderRadius: 7,
        background: "rgba(0,0,0,0.18)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(9, 1fr)",
          gap: 3,
          marginBottom: 8,
        }}
      >
        {SHADER_PIXELS.map((i) => (
          <span
            key={i}
            style={{
              height: 4,
              borderRadius: 999,
              background: "var(--orange)",
              opacity: 0.16 + (i % 9) * 0.04,
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(9, 1fr)",
          gap: 3,
          color: "var(--fg-dim)",
          marginBottom: 8,
        }}
      >
        {SHADER_COLUMNS.map((i) => (
          <span
            key={i}
            className="mono"
            style={{
              textAlign: "center",
              fontSize: 12,
              lineHeight: 1,
              animation: `shaderDrop 1.8s ease-in-out infinite ${i * 0.08}s`,
              display: "block",
            }}
          >
            ↓
          </span>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(9, 1fr)",
          gap: 3,
          marginBottom: 8,
        }}
      >
        {SHADER_COLUMNS.map((i) => (
          <span
            key={i}
            style={{
              height: 20,
              borderRadius: 3,
              background: "linear-gradient(180deg, rgba(255,122,26,0.28), rgba(255,122,26,0.06))",
              border: "1px solid rgba(255,122,26,0.22)",
              boxShadow: i % 3 === 0 ? "0 0 14px rgba(255,122,26,0.18)" : undefined,
            }}
          />
        ))}
      </div>

      <div
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.08em",
          color: "var(--orange)",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        fragment shaders 
      </div>

      <style>{`
        @keyframes shaderDrop {
          0%, 100% { opacity: 0.28; transform: translateY(-2px); }
          50%      { opacity: 0.95; transform: translateY(2px); }
        }
      `}</style>
    </div>
  );
}

function OutputPreview({ target }: { target: TargetKey }) {
  const isBrowser = target === "browser";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 160,
        aspectRatio: "16 / 9",
        borderRadius: 3,
        background: "linear-gradient(135deg, #2A2540, #1A1E40, #2A3050)",
        position: "relative",
        overflow: "hidden",
        border: "1px solid var(--line-strong)",
        transition: "border-color 0.2s",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 4px, transparent 4px 8px)",
        }}
      />

      {isBrowser ? (
        <>
          {/* Browser chrome: nav bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 14,
              background: "rgba(0,0,0,0.55)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "0 5px",
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: i === 0 ? "#FF5F57" : i === 1 ? "#FEBC2E" : "#28C840",
                  flexShrink: 0,
                }}
              />
            ))}
            <div
              style={{
                flex: 1,
                height: 7,
                borderRadius: 2,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            />
          </div>

          {/* Canvas + right tools sidebar */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
            }}
          >
            <div style={{ flex: 1, position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "18%",
                  top: "28%",
                  width: "52%",
                  height: "38%",
                  borderRadius: 2,
                  border: "1px solid rgba(255,122,26,0.35)",
                  background: "rgba(255,122,26,0.08)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 2,
                  background: "var(--orange)",
                  width: "45%",
                }}
              />
            </div>
            <div
              style={{
                width: 22,
                borderLeft: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(0,0,0,0.35)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                paddingTop: 5,
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: i === 0 ? "rgba(255,122,26,0.25)" : "rgba(255,255,255,0.04)",
                  }}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Linux export: centered play + mp4 */}
          <button
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.92)",
              color: "#0A0E1F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
              paddingLeft: 1,
              border: "none",
              cursor: "default",
            }}
          >
            ▶
          </button>
          <span
            className="mono"
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              fontSize: 6,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--fg-mute)",
              padding: "1px 4px",
              borderRadius: 2,
              background: "rgba(0,0,0,0.45)",
              border: "1px solid var(--line)",
            }}
          >
            mp4
          </span>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 2,
              background: "var(--orange)",
              width: "72%",
            }}
          />
        </>
      )}
    </div>
  );
}

function EngineDiagram({
  activeTarget,
  setActiveTarget,
}: {
  activeTarget: TargetKey;
  setActiveTarget: (k: TargetKey) => void;
}) {
  return (
    <div
      className="card"
      style={{
        padding: 28,
        background: "var(--bg-elev)",
        borderRadius: 10,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Input */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          background: "rgba(0,0,0,0.3)",
          border: "1px solid var(--line)",
          borderRadius: 6,
          fontSize: 12,
        }}
      >
        <span className="mono" style={{ fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.1em" }}>
          IN
        </span>
        <span className="mono" style={{ fontSize: 12, color: "var(--fg-2)" }}>
          render_job.json
        </span>
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 10, color: "var(--fg-mute)" }}>
          {`{ elements, duration, format }`}
        </span>
      </div>

      <Connector />

      {/* Engine core */}
      <div
        style={{
          padding: "22px 20px",
          background: "linear-gradient(180deg, rgba(255,122,26,0.10), rgba(255,122,26,0.02))",
          border: "1px solid rgba(255,122,26,0.35)",
          borderRadius: 8,
          position: "relative",
        }}
      >
        <div
          className="mono"
          style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--orange)", marginBottom: 6 }}
        >
          FRAMELANE RENDERER
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ fontSize: 22, letterSpacing: "-0.02em", color: "var(--fg)" }}>
            Rust <span style={{ color: "var(--fg-mute)" }}>·</span> wgpu
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <span
                key={i}
                style={{
                  width: 3,
                  height: 14,
                  background: "var(--orange)",
                  opacity: 0.25,
                  animation: `engPulse 1.6s ease-in-out infinite ${i * 0.12}s`,
                  display: "inline-block",
                }}
              />
            ))}
          </div>
        </div>
        <ShaderParallelGlyph />
        <style>{`
          @keyframes engPulse {
            0%, 100% { opacity: 0.2; transform: scaleY(0.6); }
            50%       { opacity: 1;   transform: scaleY(1);   }
          }
        `}</style>
      </div>

      <Connector branched />

      {/* Platform targets + preview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        {TARGETS.map((t) => {
          const on = t.key === activeTarget;
          return (
            <button
              key={t.key}
              onMouseEnter={() => setActiveTarget(t.key)}
              style={{
                padding: "12px 8px",
                background: on ? "rgba(255,122,26,0.10)" : "rgba(0,0,0,0.22)",
                border: `1px solid ${on ? "rgba(255,122,26,0.40)" : "var(--line)"}`,
                borderRadius: 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                transition: "all 0.2s",
                cursor: "default",
              }}
            >
              <span style={{ fontSize: 16, color: on ? "var(--orange)" : "var(--fg-2)" }}>
                {t.icon}
              </span>
              <span style={{ fontSize: 12, color: "var(--fg)" }}>{t.label}</span>
              <span
                className="mono"
                style={{ fontSize: 10, color: on ? "var(--orange)" : "var(--fg-mute)", letterSpacing: "0.04em" }}
              >
                {t.api}
              </span>
            </button>
          );
        })}
      </div>

      <PreviewConnector />

      <div style={{ display: "flex", justifyContent: "center" }}>
        <OutputPreview target={activeTarget} />
      </div>
    </div>
  );
}

export function HowItWorks() {
  const [activeTarget, setActiveTarget] = useState<TargetKey>("browser");

  useEffect(() => {
    const id = setInterval(() => {
      setActiveTarget((t) => {
        const i = TARGETS.findIndex((x) => x.key === t);
        return TARGETS[(i + 1) % TARGETS.length].key;
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="how-it-works">
      <div className="section-tag">
        <span className="num-marker">03 / ENGINE</span>
      </div>
      <div className="wrap">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
            gap: 64,
            alignItems: "start",
          }}
        >
          {/* Left */}
          <div>
            <h2>
              How FrameLane
              <br />
              <span className="serif-i" style={{ color: "var(--orange-hi)" }}>
                works.
              </span>
            </h2>
            <p className="lede" style={{ marginTop: 24, maxWidth: "44ch" }}>
              The rendering engine is written in{" "}
              <span style={{ color: "var(--fg)" }}>Rust</span> and built on{" "}
              <span style={{ color: "var(--fg)" }}>wgpu</span>. The same
              codebase compiles to a native binary that runs on{" "}
              <span style={{ color: "var(--fg)" }}>Vulkan</span> on GCP GPU
              instances, and to{" "}
              <span style={{ color: "var(--fg)" }}>WebAssembly </span> that runs
              against the browser&apos;s GPU API in your web application.
            </p>
           
            {/* Stack pills */}
            <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(
                [
                  ["Rust",   "memory-safe core"],
                  ["wgpu",   "GPU abstraction"],
                  ["WebGPU", "in-browser preview"],
                  ["Vulkan", "Linux / GCP"],
                ] as [string, string][]
              ).map(([name, sub]) => (
                <div
                  key={name}
                  style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    gap: 2,
                    padding: "8px 12px",
                    border: "1px solid var(--line)",
                    borderRadius: 4,
                    background: "rgba(0,0,0,0.18)",
                  }}
                >
                  <span
                    className="mono"
                    style={{ fontSize: 12, color: "var(--fg)", letterSpacing: "0.01em" }}
                  >
                    {name}
                  </span>
                  <span style={{ fontSize: 10.5, color: "var(--fg-mute)" }}>{sub}</span>
                </div>
              ))}
            </div>

            {/* Bullet points */}
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "GPU-accelerated effects on every platform",
                "Fragment shaders with parallel control over every pixel",
                'No "looked fine in the browser" surprises',
              ].map((b) => (
                <div key={b} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ width: 16, height: 1, background: "var(--orange)", flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "var(--fg-2)" }}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <EngineDiagram activeTarget={activeTarget} setActiveTarget={setActiveTarget} />
        </div>
      </div>
    </section>
  );
}
