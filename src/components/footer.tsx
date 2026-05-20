import Link from "next/link";
import { Logo } from "@/components/logo";
import { SITE } from "@/lib/constants";

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <div
        className="mono"
        style={{
          fontSize: 11,
          color: "var(--fg-dim)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            style={{ fontSize: 14, color: "var(--fg-2)" }}
          >
            {it.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", padding: "80px 0 40px" }}>
      <div className="wrap">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) repeat(3, minmax(0, 1fr))",
            gap: 48,
            marginBottom: 60,
          }}
        >
          <div>
            <Link href="/" aria-label={`${SITE.name} home`}>
              <Logo width={150} />
            </Link>
            <p
              style={{
                color: "var(--fg-2)",
                fontSize: 14,
                lineHeight: 1.6,
                marginTop: 18,
                maxWidth: "34ch",
              }}
            >
              {SITE.description}
            </p>
            <div
              className="mono"
              style={{ fontSize: 12, color: "var(--fg-mute)", marginTop: 22 }}
            >
              hello@framelane.io
            </div>
            <div
              className="mono"
              style={{
                fontSize: 12,
                color: "var(--fg-2)",
                marginTop: 8,
                padding: "8px 12px",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--line)",
                borderRadius: 4,
                display: "inline-block",
              }}
            >
              <span style={{ color: "var(--orange)" }}>$</span> npm install framelane
            </div>
          </div>

          <FooterCol
            title="Product"
            items={[
              { label: "Pricing", href: "/pricing" },
              { label: "Docs", href: SITE.docsUrl },
            ]}
          />
          <FooterCol
            title="Resources"
            items={[
              { label: "Blog", href: "/blog" },              
              { label: "Status", href: "https://status.framelane.io" },
            ]}
          />
          <FooterCol
            title="Company"
            items={[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ]}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: "1px solid var(--line)",
            fontSize: 12,
            color: "var(--fg-mute)",
          }}
        >
          <div className="mono">
            © 2026 ITIS, Ltd. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: 22 }}>
            {[
              ["GitHub", SITE.githubUrl],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                style={{ color: "var(--fg-mute)" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
