import { cn } from "@/lib/cn";
import { DotGrid } from "@/components/dot-grid";
import { GlobeNetwork } from "@/components/globe-network";

const stats = [
  {
    value: "10M+",
    label: "Minutes rendered",
    sub: "Across the globe, and counting.",
    canvas: "globe" as const,
  },
  {
    value: "99.9%",
    label: "Uptime SLA",
    sub: "Multi-region, redundant infrastructure.",
    canvas: "dots" as const,
  },
  {
    value: "<60s",
    label: "Median cold-start",
    sub: "First frame in under a minute.",
    canvas: "dots" as const,
  },
  {
    value: "REST + SDK",
    label: "Developer-first",
    sub: "Typed SDKs, webhooks, OpenAPI spec.",
    canvas: "dots" as const,
  },
];

export function ScaleBlock() {
  return (
    <section className="border-t border-dashed border-muted-foreground/20">
      <div className="border-b border-dashed border-muted-foreground/20 px-6 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          [ By the numbers ]
        </span>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h2 className="font-logo text-3xl sm:text-4xl">
          Built for scale
        </h2>

        <div className="mt-14 grid gap-px bg-border sm:grid-cols-2">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "relative overflow-hidden bg-card p-8",
                i === 0 && "sm:col-span-1 sm:row-span-2"
              )}
            >
              {s.canvas === "globe" ? <GlobeNetwork /> : <DotGrid />}

              <div className="relative z-10">
                <p className="font-mono text-5xl font-bold tracking-tight text-foreground">
                  {s.value}
                </p>
                <p className="mt-3 font-mono text-xs font-semibold uppercase tracking-wider">
                  {s.label}
                </p>
                <p className="mt-2 text-sm text-muted">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
