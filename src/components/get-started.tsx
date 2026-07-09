"use client";

import { SITE } from "@/lib/constants";
import { useState } from "react";
import { ShaderBackdrop } from "@/components/shader-backdrop";

const CODE_SAMPLES = {
  curl: `# 1. Create a project from a composition
curl -X POST https://api.framelane.io/v1/projects \\
  -H "Authorization: Bearer $FRAMELANE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Launch teaser",
    "render_request": {
      "width": 1920, "height": 1080, "duration": 30,
      "elements": [
        { "type": "video", "id": "bg",
          "source_url": "https://storage.example.com/raw-footage.mp4",
          "in_point": 0, "out_point": 30 },
        { "type": "text", "id": "title", "text": "Hello World",
          "font_family": "Inter", "font_size": 48, "text_color": "#ffffff",
          "animation_preset": "typewriter",
          "time": 0, "duration": 30, "x": "50%", "y": "90%" }
      ]
    }
  }'
# => { "id": "proj_...", "version": 1 }

# 2. Edit with a targeted op (free validation rides along)
curl -X POST https://api.framelane.io/v1/projects/$PROJECT/ops \\
  -H "Authorization: Bearer $FRAMELANE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "ops": [{ "op": "set_fields", "id": "title",
        "fields": { "text": "Ship day" } }], "if_version": 1 }'

# 3. Preview cheaply, or dry_run: true to validate for free
curl -X POST https://api.framelane.io/v1/projects/$PROJECT/preview \\
  -H "Authorization: Bearer $FRAMELANE_API_KEY" \\
  -H "Content-Type: application/json" -d '{ "at": 1.0 }'

# 4. Render when it's valid, then poll and download
curl -X POST https://api.framelane.io/v1/projects/$PROJECT/renders \\
  -H "Authorization: Bearer $FRAMELANE_API_KEY"
curl https://api.framelane.io/v1/renders/{id} \\
  -H "Authorization: Bearer $FRAMELANE_API_KEY"`,

  mcp: `{
  "mcpServers": {
    "framelane": {
      "url": "https://mcp.framelane.io/mcp",
      "headers": {
        "Authorization": "Bearer \${FRAMELANE_API_KEY}"
      }
    }
  }
}`,

  typescript: `const options = {
  method: 'POST',
  headers: {Authorization: 'Bearer <token>', 'Content-Type': 'application/json'},
  body: JSON.stringify({
    width: 1920,
    height: 1080,
    duration: 15,
    frame_rate: 30,
    output_format: 'mp4',
    output_filename: 'my-render',
    background_color: '#000000ff',
    background_image_url: 'https://cdn.example.com/bg.jpg',
    alpha: false,
    elements: [
      {
        source_url: 'https://cdn.example.com/clip.mp4',
        lut_url: '<string>',
        lut_intensity: 100,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        exposure: 0,
        sharpness: 0,
        blur: 0,
        noise: 0,
        vignette: 0,
        hue_rotate: 0,
        crop_top: 0,
        crop_bottom: 0,
        crop_left: 0,
        crop_right: 0,
        border_radius: 0,
        border_color: '<string>',
        border_width: 0,
        shadow_color: '<string>',
        shadow_blur: 0,
        shadow_x: 0,
        shadow_y: 0,
        x: '50%',
        y: '50%',
        width: '100%',
        height: '100%',
        aspect_ratio: 123,
        x_anchor: '50%',
        y_anchor: '50%',
        x_rotation: '0°',
        y_rotation: '0°',
        z_rotation: '0°',
        x_scale: '100%',
        y_scale: '100%',
        flip_horizontal: false,
        flip_vertical: false,
        opacity: 100,
        z_index: 123,
        blend_mode: 'none',
        clip: false,
        color_overlay: '<string>',
        type: 'video',
        id: 'clip_01',
        name: '<string>',
        track: 127,
        time: 0,
        visible: true,
        in_point: 0,
        out_point: 6,
        speed: 1,
        volume: 100,
        fade_in_duration: 0,
        fade_out_duration: 0,
        effects: [],
        motion: []
      }
    ],
    transitions: [
      {
        type: 'fade',
        duration: 0.5,
        from_id: 'video_01',
        to_id: 'video_02',
        z_index: 1
      }
    ],
    metadata: {project_id: 'proj_123'},
    webhook_url: 'https://app.example.com/hooks/framelane',
    ingest_external: true
  })
};

fetch('https://api.framelane.io/v1/renders', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));`,

  python: `import requests

url = "https://api.framelane.io/v1/renders"

payload = {
    "width": 1920,
    "height": 1080,
    "duration": 15,
    "frame_rate": 30,
    "output_format": "mp4",
    "output_filename": "my-render",
    "background_color": "#000000ff",
    "background_image_url": "https://cdn.example.com/bg.jpg",
    "alpha": False,
    "elements": [
        {
            "source_url": "https://cdn.example.com/clip.mp4",
            "lut_url": "<string>",
            "lut_intensity": 100,
            "brightness": 0,
            "contrast": 0,
            "saturation": 0,
            "exposure": 0,
            "sharpness": 0,
            "blur": 0,
            "noise": 0,
            "vignette": 0,
            "hue_rotate": 0,
            "crop_top": 0,
            "crop_bottom": 0,
            "crop_left": 0,
            "crop_right": 0,
            "border_radius": 0,
            "border_color": "<string>",
            "border_width": 0,
            "shadow_color": "<string>",
            "shadow_blur": 0,
            "shadow_x": 0,
            "shadow_y": 0,
            "x": "50%",
            "y": "50%",
            "width": "100%",
            "height": "100%",
            "aspect_ratio": 123,
            "x_anchor": "50%",
            "y_anchor": "50%",
            "x_rotation": "0°",
            "y_rotation": "0°",
            "z_rotation": "0°",
            "x_scale": "100%",
            "y_scale": "100%",
            "flip_horizontal": False,
            "flip_vertical": False,
            "opacity": 100,
            "z_index": 123,
            "blend_mode": "none",
            "clip": False,
            "color_overlay": "<string>",
            "type": "video",
            "id": "clip_01",
            "name": "<string>",
            "track": 127,
            "time": 0,
            "visible": True,
            "in_point": 0,
            "out_point": 6,
            "speed": 1,
            "volume": 100,
            "fade_in_duration": 0,
            "fade_out_duration": 0,
            "effects": [],
            "motion": []
        }
    ],
    "transitions": [
        {
            "type": "fade",
            "duration": 0.5,
            "from_id": "video_01",
            "to_id": "video_02",
            "z_index": 1
        }
    ],
    "metadata": { "project_id": "proj_123" },
    "webhook_url": "https://app.example.com/hooks/framelane",
    "ingest_external": True
}
headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.text)`,
} as const;

type Lang = keyof typeof CODE_SAMPLES;

function highlightCode(code: string, lang: Lang): string {
  const keywords: Record<Lang, RegExp> = {
    python: /\b(from|import|client|print|def|return|if|else)\b/g,
    typescript:
      /\b(import|from|const|let|await|async|new|function|return|if|else|console)\b/g,
    curl: /\b(curl|GET|POST|PUT|DELETE)\b/g,
    mcp: /\b(true|false|null)\b/g,
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

  const installCmd = lang === "python" ? "pip install requests" : null;

  return (
    <section id="get-started" style={{ overflow: "hidden" }}>
      <ShaderBackdrop mode="subtle" />
      <div className="section-tag" style={{ zIndex: 1 }}>
        <span className="num-marker">06 / GET STARTED</span>
      </div>
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
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
              Install the SDK and start building with FrameLane: edit a project,
              preview it cheaply, and render when it&apos;s valid.
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
                <span style={{ color: "var(--orange)" }}>{installCmd}</span>
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
                  const disabled = false;
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
                      {k === "mcp" ? "MCP" : k}
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
