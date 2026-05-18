"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const snippets = [
  {
    lang: "Python",
    code: `from framelane import FrameLane

client = FrameLane()

# Upload an asset
asset = client.assets.upload("raw-footage.mp4")

# Create a render job
job = client.jobs.create(
    assets=[asset.id],
    edits=[
        {"type": "trim", "start": 0, "end": 30},
        {"type": "caption", "style": "subtitles"},
        {"type": "overlay", "src": "logo.png", "position": "bottom-right"},
    ],
    output={"format": "mp4", "resolution": "1080p"},
)

# Poll or use webhooks for completion
result = client.jobs.wait(job.id)
print(result.output_url)`,
  },
  {
    lang: "TypeScript",
    code: `import { FrameLane } from "framelane";

const client = new FrameLane();

// Upload an asset
const asset = await client.assets.upload("raw-footage.mp4");

// Create a render job
const job = await client.jobs.create({
  assets: [asset.id],
  edits: [
    { type: "trim", start: 0, end: 30 },
    { type: "caption", style: "subtitles" },
    { type: "overlay", src: "logo.png", position: "bottom-right" },
  ],
  output: { format: "mp4", resolution: "1080p" },
});

// Poll or use webhooks for completion
const result = await client.jobs.wait(job.id);
console.log(result.outputUrl);`,
  },
  {
    lang: "cURL",
    code: `# Upload an asset
curl -X POST https://api.framelane.dev/v1/assets \\
  -H "Authorization: Bearer $FRAMELANE_API_KEY" \\
  -F file=@raw-footage.mp4

# Create a render job
curl -X POST https://api.framelane.dev/v1/jobs \\
  -H "Authorization: Bearer $FRAMELANE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "assets": ["ast_abc123"],
    "edits": [
      {"type": "trim", "start": 0, "end": 30},
      {"type": "caption", "style": "subtitles"}
    ],
    "output": {"format": "mp4", "resolution": "1080p"}
  }'`,
  },
];

export function CodeTabs() {
  const [active, setActive] = useState(0);

  return (
    <div className="relative">
      <div className="absolute inset-0 translate-x-3 translate-y-3 border border-muted-foreground/10 bg-card/50" />
      <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 border border-muted-foreground/15 bg-card/70" />

      <div className="relative border border-muted-foreground/20 bg-card">
        <div className="flex border-b border-muted-foreground/20">
          {snippets.map((s, i) => (
            <button
              key={s.lang}
              onClick={() => setActive(i)}
              className={cn(
                "relative px-4 py-2.5 font-mono text-xs transition-colors",
                i === active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-muted"
              )}
            >
              {s.lang}
              {i === active && (
                <span className="absolute inset-x-0 -bottom-px h-px bg-accent" />
              )}
            </button>
          ))}
        </div>

        <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-muted">
          <code>{snippets[active].code}</code>
        </pre>
      </div>
    </div>
  );
}
