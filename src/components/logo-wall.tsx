import { cn } from "@/lib/cn";

const logos = [
  "ClipFactory",
  "ReelForge",
  "StreamOps",
  "VidScale",
  "AutoCut",
  "PixelMind",
];

export function LogoWall() {
  return (
    <section className="border-t border-dashed border-muted-foreground/20">
      <div className="border-b border-dashed border-muted-foreground/20 px-6 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          [ Trusted by ]
        </span>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="mb-8 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Trusted by teams building with video agents
        </p>

        <div className="hidden md:block">
          <div className="relative border-y border-dashed border-muted-foreground/20">
            <div className="grid grid-cols-6">
              {logos.map((name, i) => (
                <div
                  key={name}
                  className={cn(
                    "relative flex items-center justify-center py-8",
                    i > 0 &&
                      "border-l border-dashed border-muted-foreground/20"
                  )}
                >
                  {i > 0 && (
                    <>
                      <span className="absolute -top-[5px] left-0 -translate-x-1/2 font-mono text-[10px] leading-none text-muted-foreground/40">
                        +
                      </span>
                      <span className="absolute -bottom-[5px] left-0 -translate-x-1/2 font-mono text-[10px] leading-none text-muted-foreground/40">
                        +
                      </span>
                    </>
                  )}
                  <span className="font-mono text-sm tracking-tight text-muted-foreground/60">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden md:hidden">
          <div className="animate-marquee flex gap-12 whitespace-nowrap">
            {[...logos, ...logos].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="font-mono text-sm tracking-tight text-muted-foreground/60"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
