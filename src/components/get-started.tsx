"use client";

import { SITE } from "@/lib/constants";
import { useState } from "react";

const CODE_SAMPLES = {
  curl: `# 1. Create render
curl -X POST https://api.framelane.io/v1/renders \\
  -H "Authorization: Bearer $FRAMELANE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "width": 1920,
    "height": 1080,
    "duration": 30,
    "elements": [
      {
        "type": "video",
        "source_url": "https://storage.example.com/raw-footage.mp4",
        "in_point": 0, "out_point": 30
      },
      {
        "type": "text",
        "text": "Hello World",
        "font_family": "Inter",
        "font_size": 48,
        "text_color": "#ffffff",
        "animation_preset": "typewriter",
        "time": 0, "duration": 30,
        "x": "50%", "y": "90%"
      },
      {
        "type": "image",
        "id": "logo",
        "source_url": "https://storage.example.com/logo.png",
        "time": 0, "duration": 30,
        "x": "90%", "y": "10%",
        "width": "10%", "height": "10%",
        "z_index": 1
      }
    ]
  }'

# 2. Poll until completed and download the result
curl https://api.framelane.io/v1/renders/{id} \\
  -H "Authorization: Bearer $FRAMELANE_API_KEY"`,

  typescript: `import { Framelane } from "framelane";

const client = new Framelane({ apiKey: process.env.FRAMELANE_API_KEY });

const render = await client.renders.create({
  width: 1920,
  height: 1080,
  duration: 30,
  elements: [
    {
      type: "video",
      source_url: "https://cdn.framelane.io/raw-footage.mp4",
      in_point: 0,
      out_point: 30,
    },
    {
      type: "text",
      text: "Hello World",
      font_family: "Inter",
      font_size: 48,
      text_color: "#ffffff",
      animation_preset: "typewriter",
      time: 0,
      duration: 30,
      x: "50%",
      y: "90%",
    },
    {
      type: "image",
      id: "logo",
      source_url: "https://cdn.framelane.io/logo.png",
      time: 0,
      duration: 30,
      x: "90%",
      y: "10%",
      width: "10%",
      height: "10%",
      z_index: 1,
    },
  ],
});

const downloadUrl = await client.renders.download(render.id);
console.log(downloadUrl);`,

  python: `import asyncio, os
from framelane import AsyncFramelane

async def main():
    client = AsyncFramelane(api_key=os.environ["FRAMELANE_API_KEY"])
    render = await client.renders.create(
        width=1920,
        height=1080,
        duration=30,
        elements=[
            {
                "type": "video",
                "source_url": "https://cdn.framelane.io/raw-footage.mp4",
                "in_point": 0,
                "out_point": 30,
            },
            {
                "type": "text",
                "text": "Hello World",
                "font_family": "Inter",
                "font_size": 48,
                "text_color": "#ffffff",
                "animation_preset": "typewriter",
                "time": 0,
                "duration": 30,
                "x": "50%",
                "y": "90%",
            },
            {
                "type": "image",
                "id": "logo",
                "source_url": "https://cdn.framelane.io/logo.png",
                "time": 0,
                "duration": 30,
                "x": "90%",
                "y": "10%",
                "width": "10%",
                "height": "10%",
                "z_index": 1,
            },
        ],
    )

    download_url = await client.renders.download(render.id)
    print(download_url)

asyncio.run(main())`,
} as const;

type Lang = keyof typeof CODE_SAMPLES;

function highlightCode(code: string, lang: Lang): string {
  const keywords: Record<Lang, RegExp> = {
    python: /\b(from|import|client|print|def|return|if|else)\b/g,
    typescript:
      /\b(import|from|const|let|await|async|new|function|return|if|else|console)\b/g,
    curl: /\b(curl|GET|POST|PUT|DELETE)\b/g,
  };

  // Use placeholder slots so each regex pass can't corrupt previously
  // inserted <span> tags (e.g. the string regex matching style attributes,
  // or the comment regex matching #rrggbb colour values inside strings).
  const slots: string[] = [];
  // Prefix index with "s" so \b(\d+)\b can't match the digit inside the placeholder.
  const slot = (html: string) => {
    slots.push(html);
    return `\x01s${slots.length - 1}\x01`;
  };

  let out = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Comments: only lines whose first non-whitespace char is #
  out = out.replace(/^\s*#.*$/gm, (m) =>
    slot(`<span style="color:var(--fg-dim)">${m}</span>`)
  );

  // Strings
  out = out.replace(/("(?:[^"\\]|\\.)*")/g, (m) =>
    slot(`<span style="color:#A3CFFF">${m}</span>`)
  );

  // Numbers
  out = out.replace(/\b(\d+)\b/g, (m) =>
    slot(`<span style="color:#FFB87A">${m}</span>`)
  );

  // Keywords
  out = out.replace(keywords[lang], (m) =>
    slot(`<span style="color:var(--orange)">${m}</span>`)
  );

  // Restore all slots
  return out.replace(/\x01s(\d+)\x01/g, (_, i) => slots[parseInt(i)]);
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
  const [lang, setLang] = useState<Lang>("curl");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(CODE_SAMPLES[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const installCmd =
    lang === "python" ? "pip install" : lang !== "curl" ? "npm install" : null;

  return (
    <section id="get-started">
      <div className="section-tag">
        <span className="num-marker">06 / GET STARTED</span>
      </div>
      <div className="wrap">
        <div
          className="two-col-grid"
          style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.3fr)" }}
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
              <a className="btn btn-primary" href={SITE.consoleUrl}>
                Start for free →
              </a>
              <a className="btn btn-ghost" href={SITE.docsUrl}>
                Read the docs
              </a>
            </div>

            {installCmd && (<div
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
            </div>)}
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
                {(Object.keys(CODE_SAMPLES) as Lang[]).map((k) => {
                  const disabled = k !== "curl";
                  const active = lang === k;
                  return (
                    <button
                      key={k}
                      onClick={() => !disabled && setLang(k)}
                      disabled={disabled}
                      className="mono"
                      style={{
                        padding: "12px 18px",
                        fontSize: 12,
                        color: active
                          ? "var(--fg)"
                          : disabled
                          ? "var(--fg-mute)"
                          : "var(--fg-mute)",
                        background: active ? "var(--bg-elev)" : "transparent",
                        borderRight: "1px solid var(--line)",
                        borderBottom: active
                          ? "2px solid var(--orange)"
                          : "2px solid transparent",
                        letterSpacing: "0.04em",
                        cursor: disabled ? "default" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        opacity: disabled ? 0.45 : 1,
                      }}
                    >
                      {k}
                      {disabled && (
                        <span
                          style={{
                            fontSize: 9,
                            letterSpacing: "0.06em",
                            padding: "2px 5px",
                            borderRadius: 3,
                            background: "var(--bg-elev)",
                            color: "var(--fg-dim)",
                            border: "1px solid var(--line)",
                            textTransform: "uppercase",
                          }}
                        >
                          soon
                        </span>
                      )}
                    </button>
                  );
                })}
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
