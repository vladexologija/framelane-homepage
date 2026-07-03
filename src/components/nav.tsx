"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { SITE } from "@/lib/constants";

const NAV_LINKS = [
  ["Docs", SITE.docsUrl],
  ["Pricing", "/pricing"],
  ["Blog", "/blog"],
] as const;

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      {open ? (
        <>
          <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(18px)",
        background: "rgba(10, 14, 31, 0.72)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        className="wrap"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        <Link href="/" aria-label={`${SITE.name} home`}>
          <Logo />
        </Link>

        {/* Desktop links — hidden below md (768px) */}
        <div className="hidden md:flex" style={{ gap: 28, alignItems: "center" }}>
          {NAV_LINKS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              style={{
                fontSize: 14,
                color: "var(--fg-2)",
                letterSpacing: "-0.005em",
                transition: "color 0.15s",
              }}
            >
              {label}
            </Link>
          ))}
          <a
            className="btn btn-primary btn-sm"
            href={SITE.consoleUrl}
            target="_blank"
            rel="noreferrer"
          >
            Start for free →
          </a>
        </div>

        {/* Hamburger — hidden at md and above */}
        <button
          className="flex md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            color: "var(--fg-2)",
            padding: 0,
          }}
        >
          <HamburgerIcon open={open} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderTop: "1px solid var(--line)",
            background: "rgba(10, 14, 31, 0.96)",
            padding: "8px 0 16px",
          }}
        >
          {NAV_LINKS.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "14px var(--gutter)",
                fontSize: 16,
                color: "var(--fg-2)",
                borderBottom: "1px solid var(--line)",
              }}
            >
              {label}
            </Link>
          ))}
          <div style={{ margin: "16px var(--gutter) 0" }}>
            <a
              className="btn btn-primary"
              href={SITE.consoleUrl}
              target="_blank"
              rel="noreferrer"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Start for free →
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
