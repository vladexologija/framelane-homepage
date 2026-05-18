"use client";

import { useState } from "react";
import {
  Upload,
  Scissors,
  Captions,
  Volume2,
  Layers,
  LayoutTemplate,
  Image,
  ShieldCheck,
  Webhook,
} from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  {
    icon: Upload,
    title: "Asset Ingest",
    desc: "Upload any video, audio, or image format. Auto-transcode and normalize on arrival.",
    detail:
      "Support for MP4, MOV, WebM, MKV, ProRes, H.264, H.265, AV1, and more. Assets are stored in a CDN-backed object store with automatic transcoding pipelines.",
  },
  {
    icon: Scissors,
    title: "Timelines & Cuts",
    desc: "Define trim points, splice clips, and assemble multi-track timelines programmatically.",
    detail:
      "Frame-accurate cutting with sub-millisecond precision. Chain multiple edit operations into a single render pass for maximum efficiency.",
  },
  {
    icon: Captions,
    title: "Captions & Subtitles",
    desc: "Generate or burn-in subtitles with word-level timing and style control.",
    detail:
      "Automatic speech recognition with word-level timestamps. Customizable fonts, colors, positions, and animation styles for burned-in captions.",
  },
  {
    icon: Volume2,
    title: "Audio Mixing",
    desc: "Ducking, normalization, background music, and multi-track audio in one pass.",
    detail:
      "Professional-grade audio processing including loudness normalization (LUFS), automatic ducking, crossfades, and multi-track mixing.",
  },
  {
    icon: Layers,
    title: "Overlays & Graphics",
    desc: "Position logos, watermarks, lower-thirds, and animated graphics on any frame.",
    detail:
      "Pixel-perfect positioning with anchor points, keyframe animations, and transparency support. Layer any number of graphics on your timeline.",
  },
  {
    icon: LayoutTemplate,
    title: "Templated Edits",
    desc: "Create reusable edit templates your agents can apply across thousands of videos.",
    detail:
      "Define edit blueprints with variable slots. Your agents fill in the dynamic fields and FrameLane handles the rest at scale.",
  },
  {
    icon: Image,
    title: "Thumbnails & Sprites",
    desc: "Extract poster frames, sprite sheets, and preview strips from any render output.",
    detail:
      "Automatic keyframe extraction, custom timestamp selection, and sprite sheet generation for video player scrubbing previews.",
  },
  {
    icon: ShieldCheck,
    title: "Watermarking & DRM",
    desc: "Invisible forensic watermarks and visible branding applied at render time.",
    detail:
      "Forensic watermarks survive re-encoding, cropping, and screen capture. Combine with visible branding for layered content protection.",
  },
  {
    icon: Webhook,
    title: "Webhooks & Events",
    desc: "Real-time job lifecycle events delivered to your endpoint.",
    detail:
      "Subscribe to granular events: queued, processing, progress percentage, completed, failed. Retry policies and dead-letter queues included.",
  },
];

export function Capabilities() {
  const [active, setActive] = useState(0);
  const current = items[active];
  const Icon = current.icon;

  return (
    <section className="border-t border-dashed border-muted-foreground/20">
      <div className="border-b border-dashed border-muted-foreground/20 px-6 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          [ What we offer ]
        </span>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h2 className="font-logo text-3xl sm:text-4xl">
          Every primitive your agent needs
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          A complete, composable toolkit for automated video production — from
          raw footage to delivery-ready output.
        </p>

        <div className="mt-14 grid lg:grid-cols-[280px_1fr]">
          <div className="overflow-x-auto border border-dashed border-muted-foreground/20 lg:overflow-visible">
            <div className="flex lg:flex-col">
              {items.map((item, i) => (
                <button
                  key={item.title}
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex shrink-0 items-center gap-3 px-4 py-3 text-left font-mono text-xs transition-colors lg:w-full",
                    i > 0 &&
                      "border-l border-dashed border-muted-foreground/20 lg:border-l-0 lg:border-t",
                    i === active
                      ? "bg-accent/10 text-accent-foreground"
                      : "text-muted-foreground hover:bg-card-hover hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4 shrink-0" strokeWidth={1.5} />
                  <span className="whitespace-nowrap">{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border border-dashed border-muted-foreground/20 border-t-0 p-8 lg:border-l-0 lg:border-t lg:p-12">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center border border-dashed border-muted-foreground/20">
                <Icon
                  className="size-6 text-accent-foreground"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{current.title}</h3>
                <p className="mt-1 text-sm text-muted">{current.desc}</p>
              </div>
            </div>
            <p className="mt-6 leading-relaxed text-muted">{current.detail}</p>
            <div className="mt-8 grid grid-cols-3 gap-px">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 border border-dashed border-muted-foreground/10"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
