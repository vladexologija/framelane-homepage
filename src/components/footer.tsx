import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/constants";

const groups = [
  {
    title: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Docs", href: SITE.docsUrl },
      { label: "Console", href: SITE.consoleUrl },
      { label: "Changelog", href: `${SITE.docsUrl}/changelog` },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "API Reference", href: `${SITE.docsUrl}/api-reference` },
      { label: "Status", href: "https://status.framelane.dev" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-dashed border-muted-foreground/20">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex"
              aria-label={`${SITE.name} home`}
            >
              <Image
                src="/logo.png"
                alt={SITE.name}
                width={1024}
                height={576}
                className="h-auto w-[160px] sm:w-[190px]"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted">
              {SITE.description}
            </p>
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              hello@framelane.dev
            </p>
            <div className="mt-4 inline-flex items-center gap-2 border border-dashed border-muted-foreground/20 px-3 py-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-success">
                SOC 2
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                Type II Compliant
              </span>
            </div>
          </div>

          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {g.title}
              </h3>
              <ul className="space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-dashed border-muted-foreground/20 pt-8 sm:flex-row">
          <p className="font-mono text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} FrameLane, Inc. All rights
            reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href={SITE.githubUrl}
              className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub
            </Link>
            <Link
              href={SITE.discordUrl}
              className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Discord
            </Link>
            <Link
              href="https://x.com/framelane"
              className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              X
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
