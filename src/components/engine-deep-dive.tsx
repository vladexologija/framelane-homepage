// Shared "how FrameLane renders" section for the compare pages. Content is
// first-party (the engine architecture described in our own GPU-native blog
// post), Rust + wgpu compositor, FFmpeg NVDEC decode/encode, one GPU pass per
// frame, and the same compositor compiled to WASM/WebGPU so preview == render.

const STACK: [string, string][] = [
  ["Rust", "memory-safe core"],
  ["wgpu", "GPU abstraction"],
  ["WebGPU", "in-browser preview"],
  ["Vulkan", "Linux / GCP"],
  ["FFmpeg", "NVDEC decode + encode"],
];

const PIPELINE: { step: string; title: string; body: string }[] = [
  {
    step: "01",
    title: "Project edit in",
    body: "Your agent applies a targeted edit to a project, validates it for free, and previews it cheaply before this render pipeline ever runs. No React to bundle, no DSL to learn, describe the edit, send it. (One-shot POST /v1/renders is the fast path for a whole timeline in one call.)",
  },
  {
    step: "02",
    title: "Hardware decode",
    body: "A Rust service pulls your assets and hands video to FFmpeg for hardware NVDEC decode on the GPU, not CPU frame-grabbing.",
  },
  {
    step: "03",
    title: "One GPU pass per frame",
    body: "Decoded clips and timeline logic flow into a wgpu compositor. Clips stacked, captions animated, color grades applied, in a single pass, on the GPU.",
  },
  {
    step: "04",
    title: "Fragment shaders",
    body: "Effects run as fragment shaders with parallel control over every pixel, more than 40 of them, so quality holds at 4K instead of degrading.",
  },
  {
    step: "05",
    title: "Encode + deliver",
    body: "Finished frames go back through FFmpeg for hardware encode, muxed with mixed audio, and the MP4 lands in storage, delivered by webhook.",
  },
];

export function EngineDeepDive() {
  return (
    <section>
      <div className="section-tag">
        <span className="num-marker">UNDER THE HOOD</span>
      </div>
      <div className="wrap">
        <div
          className="two-col-grid"
          style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)" }}
        >
          {/* Left: narrative + stack */}
          <div>
            <h2>
              GPU-native,
              <br />
              <span className="serif-i" style={{ color: "var(--orange-hi)" }}>
                end to end.
              </span>
            </h2>
            <p className="lede" style={{ marginTop: 22, maxWidth: "46ch" }}>
              The rendering engine is written in <span style={{ color: "var(--fg)" }}>Rust</span>{" "}
              on <span style={{ color: "var(--fg)" }}>wgpu</span>. The same compositor compiles to a
              native <span style={{ color: "var(--fg)" }}>Vulkan</span> binary on GCP GPU instances
              and to <span style={{ color: "var(--fg)" }}>WebAssembly</span> on WebGPU for the
              browser, so the preview you approve is the frame that renders. Preview runs this same
              engine, so it doubles as the free validate-before-you-pay step: edit and preview a
              project as much as you want, and pay only for the final render once it is valid.
            </p>

            <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {STACK.map(([name, sub]) => (
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
                  <span className="mono" style={{ fontSize: 12, color: "var(--fg)" }}>
                    {name}
                  </span>
                  <span style={{ fontSize: 10.5, color: "var(--fg-mute)" }}>{sub}</span>
                </div>
              ))}
            </div>

            <p
              className="mono"
              style={{ marginTop: 28, fontSize: 12, color: "var(--fg-mute)", lineHeight: 1.6 }}
            >
              <span style={{ color: "var(--green)" }}>~4s</span> to render a 10-second 4K clip with
              captions, animations and audio on a GCP L4.
            </p>
          </div>

          {/* Right: pipeline */}
          <div
            className="card"
            style={{ padding: "8px 0", background: "var(--bg-2)" }}
          >
            {PIPELINE.map((p, i) => (
              <div
                key={p.step}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "18px 24px",
                  borderTop: i > 0 ? "1px solid var(--line)" : "none",
                }}
              >
                <span
                  className="mono"
                  style={{ fontSize: 12, color: "var(--orange)", minWidth: 22, paddingTop: 2 }}
                >
                  {p.step}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      color: "var(--fg)",
                      letterSpacing: "-0.01em",
                      marginBottom: 6,
                    }}
                  >
                    {p.title}
                  </div>
                  <div style={{ fontSize: 13.5, color: "var(--fg-2)", lineHeight: 1.6 }}>
                    {p.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
