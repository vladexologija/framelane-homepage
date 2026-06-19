const COMPARISON_ROWS: [string, [string, string?][], [string, string?][], [string, string?][], [string, string?][]][] = [
  [
    "Timeline editing",
    [["yes"]],
    [["limited"]],
    [["yes", "Template only"]],
    [["yes", "Manual"]],
  ],
  [
    "GPU effects and animations",
    [["yes"]],
    [["no", "CSS only"]],
    [["no"]],
    [["no"]],
  ],
  [
    "AI background removal",
    [["yes", "In pipeline"]],
    [["no"]],
    [["no"]],
    [["no", "Separate"]],
  ],
  [
    "Gaze correction",
    [["yes"]],
    [["no"]],
    [["no"]],
    [["no"]],
  ],
  [
    "Preview = render output",
    [["yes", "WASM"]],
    [["yes", "Sometimes wrong"]],
    [["no"]],
    [["no"]],
  ],
  [
    "MCP / agent native",
    [["yes"]],
    [["no"]],
    [["no"]],
    [["no"]],
  ],
  [
    "4K + HDR tonemapping",
    [["yes"]],
    [["no", "Browser bound"]],
    [["limited"]],
    [["limited", "Manual"]],
  ],
  [
    "No browser required",
    [["yes"]],
    [["no", "Core architecture"]],
    [["yes"]],
    [["yes"]],
  ],
  [
    "Built with",
    [["Rust/WGPU"]],
    [["React"]],
    [["FFmpeg wrapper"]],
    [["C"]],
  ],
];

const COMPARISON_COLS = ["FrameLane", "Remotion", "Shotstack", "FFmpeg"];

function Check({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      <path
        d="M2 6 L5 9 L10 3"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Dash() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      <line
        x1="3"
        y1="6"
        x2="9"
        y2="6"
        stroke="var(--fg-dim)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Tilde() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      <path
        d="M2 6 Q4 4 6 6 T10 6"
        stroke="var(--fg-mute)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Cell({
  value,
  highlight,
}: {
  value: [string, string?][];
  highlight: boolean;
}) {
  const [status, note] = value[0];
  const icons: Record<string, React.ReactNode> = {
    yes: <Check color="var(--green)" />,
    no: <Dash />,
    limited: <Tilde />,
    varies: <Tilde />,
    "n/a": null,
  };

  return (
    <div
      style={{
        padding: "14px 18px",
        borderLeft: "1px solid var(--line)",
        background: highlight ? "rgba(255,122,26,0.03)" : "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {icons[status]}
        <span
          className="mono"
          style={{
            fontSize: 11,
            color:
              status === "yes"
                ? "var(--green)"
                : status === "no"
                  ? "var(--fg-dim)"
                  : status === "n/a"
                    ? "var(--fg-mute)"
                    : "var(--fg-mute)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {status === "yes" ? "Yes" : status === "no" ? "No" : status === "n/a" ? "N/A" : status}
        </span>
      </div>
      {note && (
        <span style={{ fontSize: 11, color: "var(--fg-mute)", lineHeight: 1.3 }}>
          {note}
        </span>
      )}
    </div>
  );
}

export function Comparisons() {
  return (
    <section>
      <div className="section-tag">
        <span className="num-marker">03 / WHY FRAMELANE</span>
      </div>
      <div className="wrap">
        <div
          className="two-col-grid"
          style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)", marginBottom: 56 }}
        >
          <h2>
            Built for real video,
            <br />
            <span className="serif-i" style={{ color: "var(--orange-hi)" }}>
              not just motion graphics.
            </span>
          </h2>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {[
              {
                tag: "GPU",
                title: "No GPU on Lambda",
                quote:
                  "Lambda and Vercel Sandbox do not have GPUs. You are limited to CPU-only rendering.",
                counter: "FrameLane renders on GPU. Every job.",
              },
              {
                tag: "Rendering",
                title: "CSS animations are forbidden",
                quote:
                  "CSS transitions or animations are FORBIDDEN — they will not render correctly.",                
                counter:
                  "FrameLane is GPU-native. No browser. No frame simulation. No flickering.",
              },
              {
                tag: "AI Agents",
                title: "Agents have to write React",
                quote:
                  "No React, no proprietary DSL. AI-first — agents already speak HTML/JSON.",
                counter:
                  "FrameLane is JSON-in, video-out. Any agent, any language, one API call.",
              },
              {
                tag: "Performance",
                title: "Grinds to a crawl with real video",
                quote:
                  "After about 20–30% of rendering 4k video is complete, it grinds to a crawl and renders at about 5fps and continues to slow.",                
                counter: "GPU decode, GPU encode, parallel rendering.",
              },
            ].map(({ tag, title, quote, counter }) => (
              <li
                key={tag}
                style={{
                  borderLeft: "1px solid var(--line-strong)",
                  paddingLeft: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--orange)",
                      border: "1px solid rgba(255,122,26,0.3)",
                      borderRadius: 3,
                      padding: "1px 6px",
                    }}
                  >
                    {tag}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--fg)",
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {title}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--fg-mute)",
                    lineHeight: 1.55,
                    fontStyle: "italic",
                    margin: 0,
                  }}
                >
                  {quote}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--green)",
                    lineHeight: 1.45,
                    margin: 0,
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                  }}
                >
                  <span style={{ color: "var(--orange)", fontSize: 11 }}>
                    ↗
                  </span>
                  {counter}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="comp-table-wrap">
        <div
          className="comp-table-inner"
          style={{
            border: "1px solid var(--line)",
            borderRadius: 8,
            overflow: "hidden",
            background: "var(--bg-2)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.7fr) repeat(4, minmax(0, 1fr))",
              borderBottom: "1px solid var(--line-strong)",
            }}
          >
            <div
              style={{
                padding: "18px 24px",
                fontSize: 11,
                fontFamily: "var(--font-geist-mono), monospace",
                color: "var(--fg-dim)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Capability
            </div>
            {COMPARISON_COLS.map((c, i) => (
              <div
                key={c}
                style={{
                  padding: "18px 18px",
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 500,
                  background: i === 0 ? "rgba(255,122,26,0.04)" : "transparent",
                  color: i === 0 ? "var(--orange)" : "var(--fg-2)",
                  borderLeft: "1px solid var(--line)",
                  letterSpacing: "-0.005em",
                }}
              >
                {c}
              </div>
            ))}
          </div>

          {/* Rows */}
          {COMPARISON_ROWS.map((row, ri) => (
            <div
              key={ri}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1.7fr) repeat(4, minmax(0, 1fr))",
                borderBottom:
                  ri < COMPARISON_ROWS.length - 1
                    ? "1px solid var(--line)"
                    : "none",
              }}
            >
              <div
                style={{
                  padding: "16px 24px",
                  fontSize: 14,
                  color: "var(--fg)",
                  letterSpacing: "-0.005em",
                }}
              >
                {row[0]}
              </div>
              {row.slice(1).map((cell, ci) => (
                <Cell key={ci} value={cell as [string, string?][]} highlight={ci === 0} />
              ))}
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
