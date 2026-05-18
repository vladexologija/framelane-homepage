"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SITE, NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/cn";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-dashed border-muted-foreground/20 bg-background">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center"
          aria-label={`${SITE.name} home`}
        >
          <Image
            src="/logo.png"
            alt={SITE.name}
            width={1024}
            height={576}
            priority
            className="h-auto w-[120px] sm:w-[145px] md:w-[160px]"
          />
        </Link>

        <div className="hidden items-center gap-5 lg:gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={SITE.consoleUrl}
            className="bg-accent px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider text-white transition-colors hover:bg-accent/80"
          >
            Start for free
          </Link>
        </div>

        <button
          className="text-muted-foreground md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <div
        className={cn(
          "overflow-hidden border-t border-dashed border-muted-foreground/20 bg-background transition-all md:hidden",
          open ? "max-h-64" : "max-h-0 border-t-0"
        )}
      >
        <div className="flex flex-col gap-4 px-6 py-5">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={SITE.consoleUrl}
            className="mt-1 bg-accent px-4 py-2 text-center font-mono text-xs font-medium uppercase tracking-wider text-white"
          >
            Start for free
          </Link>
        </div>
      </div>
    </header>
  );
}
