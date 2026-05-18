"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  {
    q: "What is FrameLane?",
    a: "FrameLane is an API-first video editing platform built for AI agents. While traditional video tools are designed for human editors, FrameLane exposes every editing primitive — trim, caption, overlay, render — as composable API calls so agents can produce video autonomously.",
  },
  {
    q: "Which video formats do you support?",
    a: "We accept all major containers and codecs on ingest (MP4, MOV, WebM, MKV, ProRes, H.264, H.265, AV1, and more). Output defaults to MP4/H.264 but you can specify format, resolution, bitrate, and codec in the job payload.",
  },
  {
    q: "How does pricing work?",
    a: "Pricing is based on minutes of rendered output, concurrent render slots, and storage. There's a generous free tier to get started. See the pricing page for details.",
  },
  {
    q: "Can I use my own custom assets and templates?",
    a: "Yes. Upload logos, fonts, graphics packs, and audio tracks as reusable assets. Create edit templates that your agents can apply across any number of source videos.",
  },
  {
    q: "How do I know when a render job finishes?",
    a: "You can poll the job status endpoint, or configure webhooks to receive real-time lifecycle events (queued, processing, progress, completed, failed). WebSocket support is on the roadmap.",
  },
  {
    q: "Is there an SLA?",
    a: "Pro and Enterprise plans include a 99.9% uptime SLA backed by multi-region infrastructure. Free-tier jobs run best-effort but still benefit from the same underlying platform.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="border-t border-dashed border-muted-foreground/20">
      <div className="border-b border-dashed border-muted-foreground/20 px-6 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          [ FAQ ]
        </span>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="font-logo text-3xl sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-muted">
              Everything you need to know about FrameLane.
            </p>
          </div>

          <div className="relative border border-dashed border-muted-foreground/20 p-6">
            <span className="absolute -left-[3px] -top-[3px] block h-1.5 w-1.5 bg-muted-foreground/30" />
            <span className="absolute -right-[3px] -top-[3px] block h-1.5 w-1.5 bg-muted-foreground/30" />
            <span className="absolute -bottom-[3px] -left-[3px] block h-1.5 w-1.5 bg-muted-foreground/30" />
            <span className="absolute -bottom-[3px] -right-[3px] block h-1.5 w-1.5 bg-muted-foreground/30" />

            <dl className="divide-y divide-dashed divide-muted-foreground/20">
              {items.map((item, i) => {
                const isOpen = openIndex === i;
                return (
                  <div key={item.q} className="py-4 first:pt-0 last:pb-0">
                    <dt>
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : i)}
                        className="flex w-full items-center justify-between text-left"
                      >
                        <span className="text-sm font-semibold">
                          {item.q}
                        </span>
                        {isOpen ? (
                          <Minus className="size-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <Plus className="size-4 shrink-0 text-muted-foreground" />
                        )}
                      </button>
                    </dt>
                    <dd
                      className={cn(
                        "overflow-hidden transition-all",
                        isOpen
                          ? "mt-3 max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      )}
                    >
                      <p className="text-sm leading-relaxed text-muted">
                        {item.a}
                      </p>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
