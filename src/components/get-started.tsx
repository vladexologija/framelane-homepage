"use client";

import { useState } from "react";

const CODE_SAMPLES = {
  python: `from framelane import FrameLane

client = FrameLane()

# Upload a source asset
asset = client.assets.upload("raw-footage.mp4")

# Create a render job
job = client.jobs.create(
    source=[asset.id],
    edits=[
        {"type": "trim", "start": 0, "end": 30},
        {"type": "caption", "style": "karaoke"},
        {"type": "overlay", "src": "logo.png", "position": "bottom-right"},
    ],
    output={"format": "mp4", "resolution": "1080p"},
)

# Poll or use webhooks for completion
result = client.jobs.wait(job.id)
print(result.output_url)`,

  typescript: `import { FrameLane } from "framelane";

const client = new FrameLane();

// Upload a source asset
const asset = await client.assets.upload("raw-footage.mp4");

// Create a render job
const job = await client.jobs.create({
  source: [asset.id],
  edits: [
    { type: "trim",    start: 0, end: 30 },
    { type: "caption", style: "karaoke" },
    { type: "overlay", src: "logo.png", position: "bottom-right" },
  ],
  output: { format: "mp4", resolution: "1080p" },
});

const result = await client.jobs.wait(job.id);
console.log(result.outputUrl);`,

  curl: `# Upload a source asset
curl -X POST https://api.framelane.io/v1/assets \\
  -H "Authorization: Bearer $FRAMELANE_KEY" \\
  -F "file=@raw-footage.mp4"

# Create a render job
curl -X POST https://api.framelane.io/v1/jobs \\
  -H "Authorization: Bearer $FRAMELANE_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "source": ["asset_01HX5DG"],
    "edits": [
      { "type": "trim", "start": 0, "end": 30 },
      { "type": "caption", "style": "karaoke" },
      { "type": "overlay", "src": "logo.png", "position": "bottom-right" }
    ],
    "output": { "format": "mp4", "resolution": "1080p" }
  }'`,
} as const;

type Lang = keyof typeof CODE_SAMPLES;

function highlightCode(code: string, lang: Lang): string {
  const keywords: Record<Lang, RegExp> = {
    python: /\b(from|import|client|print|def|return|if|else)\b/g,
    typescript:
      /\b(import|from|const|let|await|async|new|function|return|if|else|console)\b/g,
    curl: /\b(curl|GET|POST|PUT|DELETE)\b/g,
  };
  return code
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /(#.*$|^\s*#.*$)/gm,
      '<span style="color:var(--fg-dim)">$1</span>'
    )
    .replace(
      /("(?:[^"\\]|\\.)*")/g,
      '<span style="color:#A3CFFF">$1</span>'
    )
    .replace(
      /(\b\d+\b)/g,
      '<span style="color:#FFB87A">$1</span>'
    )
    .replace(
      keywords[lang],
      '<span style="color:var(--orange)">$1</span>'
    );
}

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

export function GetStarted() {
  const [lang, setLang] = useState<Lang>("python");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(CODE_SAMPLES[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const installCmd =
    lang === "python" ? "pip install" : lang === "curl" ? "brew install" : "npm install";

  return (
    <section id="get-started">
      <div className="section-tag">
        <span className="num-marker">06 / GET STARTED</span>
      </div>
      <div className="wrap">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.3fr)",
            gap: 64,
            alignItems: "start",
          }}
        >
          {/* Left */}
          <div>
            <h2>
              Get started
              <br />
              <span className="serif-i" style={{ color: "var(--orange-hi)" }}>
                in seconds.
              </span>
            </h2>
            <p
              className="lede"
              style={{ marginTop: 22, maxWidth: "42ch" }}
            >
              Install the SDK and start building with FrameLane — from ingest to
              render in a single API call.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              <a className="btn btn-primary" href="#">
                Start for free →
              </a>
              <a className="btn btn-ghost" href="#">
                Read the docs
              </a>
            </div>

            <div
              style={{
                marginTop: 38,
                padding: "18px 20px",
                border: "1px solid var(--line)",
                borderRadius: 6,
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <div
                className="mono"
                style={{
                  fontSize: 11,
                  color: "var(--fg-dim)",
                  letterSpacing: "0.1em",
                }}
              >
                $ INSTALL
              </div>
              <div
                className="mono"
                style={{ fontSize: 13, marginTop: 4, color: "var(--fg)" }}
              >
                <span style={{ color: "var(--orange)" }}>{installCmd}</span>{" "}
                framelane
              </div>
            </div>
          </div>

          {/* Code panel */}
          <div
            className="card"
            style={{
              background: "var(--bg-elev)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid var(--line)",
                background: "var(--bg-2)",
              }}
            >
              <div style={{ display: "flex" }}>
                {(Object.keys(CODE_SAMPLES) as Lang[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setLang(k)}
                    className="mono"
                    style={{
                      padding: "12px 18px",
                      fontSize: 12,
                      color: lang === k ? "var(--fg)" : "var(--fg-mute)",
                      background:
                        lang === k ? "var(--bg-elev)" : "transparent",
                      borderRight: "1px solid var(--line)",
                      borderBottom:
                        lang === k
                          ? "2px solid var(--orange)"
                          : "2px solid transparent",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <button
                onClick={copy}
                className="mono"
                style={{
                  marginLeft: "auto",
                  padding: "8px 14px",
                  fontSize: 11,
                  color: copied ? "var(--green)" : "var(--fg-mute)",
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <CopyIcon />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre
              className="mono"
              style={{
                margin: 0,
                padding: "22px 24px",
                fontSize: 12.5,
                lineHeight: 1.75,
                color: "var(--fg-2)",
                overflow: "auto",
                maxHeight: 480,
              }}
            >
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightCode(CODE_SAMPLES[lang], lang),
                }}
              />
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
