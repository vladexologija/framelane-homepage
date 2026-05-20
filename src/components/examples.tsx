"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

/* ─── Visual mockups (sized for the 2/3 panel) ──────────────────────────── */

function PodcastVisual() {
  const wave = [3, 5, 4, 7, 5, 8, 4, 9, 6, 5, 7, 4, 8, 5, 4, 6, 3, 7, 5, 4];
  return (
    <div className="flex items-center justify-center gap-6">
      {/* Before — 16:9 podcast */}
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
          Before
        </span>
        <div
          className="relative overflow-hidden border border-muted-foreground/20 bg-[#0d1224]"
          style={{ width: "200px", aspectRatio: "16/9" }}
        >
          <div className="absolute inset-0 flex items-center gap-3 p-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-muted-foreground/25" />
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="h-1.5 w-3/4 rounded bg-muted-foreground/20" />
              <div className="h-1.5 w-1/2 rounded bg-muted-foreground/10" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex h-7 items-end gap-px px-2 pb-1">
            {wave.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-muted-foreground/25"
                style={{ height: `${h * 2.2}px` }}
              />
            ))}
          </div>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground/40">16:9 podcast</span>
      </div>

      <ArrowRight className="size-5 shrink-0 text-accent-foreground" />

      {/* After — 9:16 TikTok */}
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
          After
        </span>
        <div
          className="relative overflow-hidden border border-muted-foreground/20"
          style={{
            width: "90px",
            height: "160px",
            background: "radial-gradient(ellipse at 50% 25%, #2a3461 0%, #0f1224 100%)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 35%, rgba(141,150,184,0.18) 0%, transparent 55%)",
            }}
          />
          {/* person */}
          <div className="absolute left-1/2 top-6 h-14 w-14 -translate-x-1/2 rounded-full bg-muted-foreground/35" />
          <div className="absolute left-1/2 top-[82px] h-8 w-[72px] -translate-x-1/2 rounded-t-full bg-muted-foreground/25" />
          {/* karaoke caption */}
          <div className="absolute bottom-10 left-1.5 right-1.5 rounded bg-black/75 px-2 py-1">
            <div className="flex gap-1">
              <div className="h-2 w-5 rounded bg-accent/90" />
              <div className="h-2 flex-1 rounded bg-foreground/35" />
            </div>
          </div>
          {/* progress bar */}
          <div className="absolute bottom-5 left-2 right-2 h-0.5 rounded-full bg-foreground/10">
            <div className="h-full w-[42%] rounded-full bg-accent/70" />
          </div>
          {/* right icons */}
          <div className="absolute right-1.5 top-8 flex flex-col gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
            <div className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
            <div className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          </div>
          <span className="absolute left-1.5 top-1 font-mono text-[8px] text-accent-foreground/50">
            9:16
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground/40">TikTok ready</span>
      </div>
    </div>
  );
}

function TalkingHeadVisual() {
  return (
    <div className="flex items-center justify-center gap-6">
      {/* Before */}
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
          Before
        </span>
        <div
          className="relative overflow-hidden border border-muted-foreground/20 bg-[#1a1510]"
          style={{ width: "200px", aspectRatio: "16/9" }}
        >
          {[
            { l: "6%", t: "12%", w: 28, h: 16 },
            { l: "64%", t: "18%", w: 22, h: 13 },
            { l: "70%", t: "52%", w: 30, h: 14 },
            { l: "10%", t: "55%", w: 20, h: 20 },
          ].map((s, i) => (
            <div
              key={i}
              className="absolute rounded bg-muted-foreground/10"
              style={{ left: s.l, top: s.t, width: s.w, height: s.h }}
            />
          ))}
          <div className="absolute left-1/2 top-3 h-12 w-12 -translate-x-1/2 rounded-full bg-muted-foreground/30" />
          <div className="absolute left-1/2 top-[54px] h-8 w-20 -translate-x-1/2 rounded-t-full bg-muted-foreground/20" />
          <span className="absolute left-2 top-1 font-mono text-[8px] text-red-400/70">● REC</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground/40">raw webcam</span>
      </div>

      <ArrowRight className="size-5 shrink-0 text-accent-foreground" />

      {/* After */}
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
          After
        </span>
        <div
          className="relative overflow-hidden border border-muted-foreground/20"
          style={{
            width: "200px",
            aspectRatio: "16/9",
            background: "radial-gradient(ellipse at 55% 35%, #2d1b69 0%, #0a0e1a 80%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{ background: "linear-gradient(to bottom, transparent 40%, #3d1040 100%)" }}
          />
          <div className="absolute left-1/2 top-3 h-12 w-12 -translate-x-1/2 rounded-full bg-muted-foreground/45" />
          <div className="absolute left-1/2 top-[54px] h-8 w-20 -translate-x-1/2 rounded-t-full bg-muted-foreground/35" />
          {/* subtitle bar */}
          <div className="absolute bottom-2 left-3 right-3 rounded bg-black/80 px-2.5 py-1">
            <div className="flex gap-1.5">
              <div className="h-1.5 flex-1 rounded bg-foreground/70" />
              <div className="h-1.5 w-12 rounded bg-foreground/35" />
            </div>
          </div>
          {/* 4K badge */}
          <div className="absolute right-2 top-2 rounded border border-accent/40 bg-accent/10 px-1.5 py-px">
            <span className="font-mono text-[9px] font-semibold text-accent-foreground">4K</span>
          </div>
          {/* gaze indicator */}
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-success/15 px-1.5 py-px">
            <div className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="font-mono text-[8px] text-success/80">gaze</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground/40">4K · color graded</span>
      </div>
    </div>
  );
}

const adVariants = [
  { bg: "#1a2a5e", cta: "#faa329", ctaText: "Buy Now", ratio: "1:1", n: "001" },
  { bg: "#1a1a3a", cta: "#22c55e", ctaText: "Try Free", ratio: "16:9", n: "002" },
  { bg: "#0f2040", cta: "#60a5fa", ctaText: "Shop Now", ratio: "4:5", n: "003" },
  { bg: "#1a3020", cta: "#f472b6", ctaText: "Learn More", ratio: "9:16", n: "004" },
];

function AdVariantsVisual() {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
        100 variants rendered
      </span>
      <div className="grid grid-cols-2 gap-2.5">
        {adVariants.map((v) => (
          <div
            key={v.n}
            className="relative overflow-hidden border border-muted-foreground/15"
            style={{ width: "140px", height: "106px", backgroundColor: v.bg }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2">
              <div className="h-3 w-16 rounded bg-foreground/15" />
              <div className="h-2 w-10 rounded bg-foreground/10" />
            </div>
            <div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2.5 py-0.5 font-mono text-[9px] font-bold text-black"
              style={{ backgroundColor: v.cta }}
            >
              {v.ctaText}
            </div>
            <span className="absolute left-1.5 top-1 font-mono text-[8px] text-foreground/25">
              #{v.n}
            </span>
            <span className="absolute right-1.5 top-1 font-mono text-[8px] text-foreground/30">
              {v.ratio}
            </span>
          </div>
        ))}
      </div>
      <span className="font-mono text-[10px] text-muted-foreground/40">4 formats · 25 per format</span>
    </div>
  );
}

/* ─── Tab data ───────────────────────────────────────────────────────────── */

const tabs = [
  {
    step: "01",
    label: "Podcast → TikTok",
    title: "Podcast clip → TikTok-ready short",
    description:
      "Turn any long-form recording into a vertical short with captions, background blur, and a progress bar — one render job.",
    pills: ["Trim", "9:16 crop", "Karaoke captions", "Background blur", "1080×1920"],
    Visual: PodcastVisual,
  },
  {
    step: "02",
    label: "Talking Head Cleanup",
    title: "Raw webcam → polished talking head",
    description:
      "Background removal, gaze correction, color grading, and 4K export — AI effects run inside the render pipeline.",
    pills: ["Background removal", "Gaze correction", "LUT / color grade", "4K output"],
    Visual: TalkingHeadVisual,
  },
  {
    step: "03",
    label: "Product Ad Variants",
    title: "One product video → 100 ad variants",
    description:
      "Feed structured inputs — headlines, colors, CTAs, music, aspect ratios — and batch-render every variant at once.",
    pills: ["Image overlays", "Text animations", "Audio", "Batch rendering", "Multi-aspect"],
    Visual: AdVariantsVisual,
  },
];

/* ─── Section ────────────────────────────────────────────────────────────── */

export function Examples() {
  const [active, setActive] = useState(0);
  const tab = tabs[active];
  const Visual = tab.Visual;

  return (
    <section className="border-t border-dashed border-muted-foreground/20 bg-card">
      <div className="border-b border-dashed border-muted-foreground/20 px-6 py-2">
        <span className="font-mono text-xs text-muted-foreground">[ Examples ]</span>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h2 className="font-logo text-3xl sm:text-4xl">What agents can make with FrameLane</h2>
        <p className="mt-4 max-w-2xl text-muted">
          Start with real footage. Let your agent define the edit. FrameLane renders the final video.
        </p>

        {/* Tab panel — 1/3 tabs | 2/3 visual */}
        <div className="mt-12 overflow-hidden border border-dashed border-muted-foreground/20 lg:grid lg:grid-cols-[1fr_2fr]">
          {/* Left: tab list */}
          <div className="flex flex-col border-b border-dashed border-muted-foreground/20 lg:border-b-0 lg:border-r">
            {tabs.map((t, i) => (
              <button
                key={t.step}
                onClick={() => setActive(i)}
                className={cn(
                  "group relative flex flex-col gap-3 p-6 text-left transition-colors",
                  i > 0 && "border-t border-dashed border-muted-foreground/20",
                  active === i ? "bg-card" : "bg-background hover:bg-card/50"
                )}
              >
                {/* active accent line */}
                {active === i && (
                  <span className="absolute bottom-0 left-0 top-0 w-[2px] bg-accent lg:bottom-auto lg:left-0 lg:right-0 lg:top-auto lg:h-[2px] lg:w-auto" />
                )}

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground/50">{t.step}</span>
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      active === i
                        ? "text-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {t.label}
                  </span>
                </div>

                {/* expanded content for active tab */}
                {active === i && (
                  <>
                    <h3 className="font-logo text-lg leading-snug">{t.title}</h3>
                    <p className="text-sm leading-relaxed text-muted">{t.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.pills.map((pill) => (
                        <span
                          key={pill}
                          className="border border-dashed border-muted-foreground/20 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Right: visual output */}
          <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden bg-background/40 p-10">
            {/* subtle dot grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #8d96b8 1px, transparent 1px), linear-gradient(to bottom, #8d96b8 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <Visual />
          </div>
        </div>
      </div>
    </section>
  );
}
