import {
  Clapperboard,
  Film,
  Megaphone,
  Globe,
  ShieldAlert,
} from "lucide-react";

const cases = [
  {
    icon: Film,
    title: "Auto Shorts from Longform",
    desc: "Let your agent identify highlights, trim to vertical, add captions, and publish short-form clips autonomously.",
  },
  {
    icon: Clapperboard,
    title: "Episode Assembly",
    desc: "Stitch chapters, intros, outros, and transitions into finished episodes without human editing.",
  },
  {
    icon: Megaphone,
    title: "UGC to Platform-Ready",
    desc: "Normalize user-generated footage: fix levels, add branding, render at multiple aspect ratios.",
  },
  {
    icon: Globe,
    title: "Batch Localization",
    desc: "Swap audio tracks, burn-in translated subtitles, and render per-locale variants at scale.",
  },
  {
    icon: ShieldAlert,
    title: "Compliance Edits",
    desc: "Blur faces, redact regions, overlay disclaimers — driven by policy rules your agent enforces.",
  },
];

export function UseCases() {
  return (
    <section className="border-t border-dashed border-muted-foreground/20">
      <div className="border-b border-dashed border-muted-foreground/20 px-6 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          [ Use cases ]
        </span>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h2 className="font-logo text-3xl sm:text-4xl">
          Powering every kind of video agent
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          From content pipelines to compliance workflows, FrameLane enables any
          agent to produce and deliver video.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-muted-foreground/20 bg-muted-foreground/10 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <div
              key={c.title}
              className="bg-background p-6 transition-colors hover:bg-card"
            >
              <div className="flex size-10 items-center justify-center border border-dashed border-muted-foreground/20">
                <c.icon
                  className="size-5 text-accent-foreground"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="mt-4 font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {c.desc}
              </p>
            </div>
          ))}
          <div className="hidden bg-background p-6 lg:block" />
        </div>
      </div>
    </section>
  );
}
