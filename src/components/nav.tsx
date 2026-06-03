import Link from "next/link";
import { Logo } from "@/components/logo";
import { SITE } from "@/lib/constants";

const NAV_LINKS = [
  ["Docs", SITE.docsUrl],
  ["Pricing", "/pricing"],
  ["Blog", "/blog"],
] as const;

export function Nav() {
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
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
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
            href={SITE.waitlistUrl}
            target="_blank"
            rel="noreferrer"
          >
            Request access →
          </a>
        </div>
      </div>
    </nav>
  );
}
