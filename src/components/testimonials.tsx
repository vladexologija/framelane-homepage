const quotes = [
  {
    text: "FrameLane turned our 3-hour manual editing pipeline into a 90-second API call. Our agents handle thousands of videos a day now.",
    name: "Alex Chen",
    role: "CTO, ClipFactory",
    bg: "linear-gradient(135deg, #1f274a 0%, #26315d 50%, #304073 100%)",
  },
  {
    text: "We provision rendering pipelines per customer via FrameLane and never worry about codec hell again. Deliverability just works.",
    name: "Priya Sharma",
    role: "Co-Founder, ReelForge",
    bg: "linear-gradient(135deg, #222b52 0%, #332d73 50%, #1f274a 100%)",
  },
  {
    text: "The webhook lifecycle events let our agents react in real-time. We went from polling every 10 seconds to instant orchestration.",
    name: "Marcus Reid",
    role: "Lead Engineer, StreamOps",
    bg: "linear-gradient(135deg, #1f274a 0%, #20395c 50%, #222b52 100%)",
  },
];

export function Testimonials() {
  return (
    <section className="border-t border-dashed border-muted-foreground/20">
      <div className="border-b border-dashed border-muted-foreground/20 px-6 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          [ Testimonials ]
        </span>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h2 className="font-logo text-3xl sm:text-4xl">
          Trusted by builders
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {quotes.map((q) => (
            <blockquote
              key={q.name}
              className="relative flex min-h-[320px] flex-col justify-end overflow-hidden p-6"
              style={{ background: q.bg }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/30 to-transparent" />

              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              <div className="relative z-10">
                <p className="text-sm leading-relaxed text-white/90">
                  &ldquo;{q.text}&rdquo;
                </p>
                <footer className="mt-4 border-t border-white/10 pt-4">
                  <p className="font-mono text-xs font-semibold text-white">
                    {q.name}
                  </p>
                  <p className="font-mono text-xs text-white/60">{q.role}</p>
                </footer>
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
