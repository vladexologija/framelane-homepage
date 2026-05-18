import Link from "next/link";
import { SITE } from "@/lib/constants";
import { CodeTabs } from "@/components/code-tabs";

const ASCII_GRID = `+------+------+------+------+------+------+------+------+
|      |      |      |      |      |      |      |      |
+------+------+------+------+------+------+------+------+
|      |      |      |      |      |      |      |      |
+------+------+------+------+------+------+------+------+
|      |      |      |      |      |      |      |      |
+------+------+------+------+------+------+------+------+
|      |      |      |      |      |      |      |      |
+------+------+------+------+------+------+------+------+
|      |      |      |      |      |      |      |      |
+------+------+------+------+------+------+------+------+`;

export function CtaBanner() {
  return (
    <section className="border-t border-dashed border-muted-foreground/20">
      <div className="border-b border-dashed border-muted-foreground/20 px-6 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          [ Get started ]
        </span>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <pre
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden font-mono text-[10px] leading-tight text-muted-foreground/[0.08]"
          aria-hidden="true"
        >
          {ASCII_GRID}
        </pre>

        <div className="relative text-center">
          <h2 className="font-logo text-3xl sm:text-4xl lg:text-5xl">
            Get started in seconds
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Install the SDK and start building with FrameLane — from ingest to
            render in a single API call.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
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
        </div>

        <div className="relative mx-auto mt-16 max-w-2xl">
          <CodeTabs />
        </div>
      </div>
    </section>
  );
}
