import Link from "next/link";
import { SITE } from "@/lib/constants";
import { CodeTabs } from "@/components/code-tabs";

export function Hero() {
  return (
    <section className="relative">
      <div className="border-b border-dashed border-muted-foreground/20 px-6 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          [ Video editing API ]
        </span>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="inline-block border border-dashed border-muted-foreground/20 px-3 py-1">
              <span className="font-mono text-xs text-accent-foreground">
                Video production primitives for agents
              </span>
            </div>

            <h1 className="font-logo mt-6 text-4xl sm:text-5xl lg:text-6xl">
              {SITE.tagline}
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted">
              {SITE.description}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href={SITE.consoleUrl}
                className="inline-flex items-center justify-center bg-accent px-6 py-3 font-mono text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-accent/80"
              >
                Start for free
              </Link>
              <Link
                href={SITE.docsUrl}
                className="group relative inline-flex items-center justify-center border border-muted-foreground/30 px-6 py-3 font-mono text-sm uppercase tracking-wider text-muted transition-colors hover:border-foreground hover:text-foreground"
              >
                <span className="absolute -left-px -top-px h-2.5 w-2.5 border-l border-t border-foreground/50 group-hover:border-foreground" />
                <span className="absolute -right-px -top-px h-2.5 w-2.5 border-r border-t border-foreground/50 group-hover:border-foreground" />
                <span className="absolute -bottom-px -left-px h-2.5 w-2.5 border-b border-l border-foreground/50 group-hover:border-foreground" />
                <span className="absolute -bottom-px -right-px h-2.5 w-2.5 border-b border-r border-foreground/50 group-hover:border-foreground" />
                Read the docs
              </Link>
            </div>

            <p className="mt-4 font-mono text-xs text-muted-foreground">
              No credit card required
            </p>
          </div>

          <div className="relative pt-2">
            <CodeTabs />
          </div>
        </div>
      </div>
    </section>
  );
}
