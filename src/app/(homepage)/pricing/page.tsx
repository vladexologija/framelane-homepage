import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pricing — FrameLane",
  description:
    "Simple, predictable pricing based on rendered minutes, concurrent slots, and storage.",
};

interface Tier {
  name: string;
  price: string;
  period: string;
  note?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}

const tiers: Tier[] = [
  {
    name: "Free",
    price: "$0",
    period: "/ month",
    note: "No credit card required.",
    description:
      "For developers who want to evaluate FrameLane before committing.",
    features: [
      "25 render-minutes / month",
      "1080p output",
      "Watermarked exports",
      "JSON-based editing API",
      "MCP server included",
      "CPU rendering",
    ],
    cta: "Request access",
    href: SITE.waitlistUrl,
  },
  {
    name: "Pro",
    price: "$99",
    period: "/ month",
    note: "+$0.08 per render-minute over limit",
    description: "For teams shipping products that render real video at scale.",
    features: [
      "2,000 render-minutes / month",
      "4K output",
      "No watermark",
      "JSON-based editing API",
      "MCP server included",
      "Background removal",
      "Gaze correction",
      "GPU rendering on every job",
      "Email support",
    ],
    cta: "Request access",
    href: SITE.waitlistUrl,
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description:
      "For teams with high volume, compliance needs, or dedicated capacity requirements.",
    features: [
      "Unlimited render-minutes",
      "8K output",
      "Dedicated GPU instance",
      "Custom overage rate",
      "SLA guarantee",
      "Priority render queue",
      "Slack support channel",
      "Custom MSA / contracts",
    ],
    cta: "Talk To Us",
    href: "mailto:sales@framelane.io",
  },
];

function Check() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      style={{ flexShrink: 0, marginTop: 2 }}
    >
      <path
        d="M2 6 L5 9 L10 3"
        stroke="var(--green)"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <>
      {/* Page header tag */}
      <div
        style={{
          borderBottom: "1px solid var(--line)",
          padding: "10px var(--gutter)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            width: 24,
            height: 1,
            background: "var(--orange)",
            display: "inline-block",
          }}
        />
        <span className="num-marker">PRICING</span>
      </div>

      <section style={{ paddingTop: 80, paddingBottom: 120 }}>
        <div className="wrap">
          {/* Headline */}
          <div style={{ maxWidth: 640, marginBottom: 72 }}>
            <div
              className="eyebrow"
              style={{ color: "var(--orange)", marginBottom: 18 }}
            >
              Simple, predictable pricing
            </div>
            <h1
              style={{
                fontSize: "clamp(40px, 5.5vw, 72px)",
                lineHeight: 0.96,
                letterSpacing: "-0.035em",
                fontWeight: 500,
              }}
            >
              Pay for what you
              <br />
              <span className="serif-i" style={{ color: "var(--orange-hi)" }}>
                render.
              </span>
            </h1>
            <p className="lede" style={{ marginTop: 22 }}>
              Scale up or down at any time. No seat fees, no surprises.
            </p>
          </div>

          {/* Tier cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 0,
              border: "1px solid var(--line)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {tiers.map((tier, i) => (
              <div
                key={tier.name}
                style={{
                  padding: "40px 36px",
                  borderRight:
                    i < tiers.length - 1 ? "1px solid var(--line)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  background: tier.highlighted
                    ? "rgba(255,122,26,0.03)"
                    : "var(--bg-2)",
                }}
              >
                {/* Highlighted top border accent */}
                {tier.highlighted && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: "var(--orange)",
                    }}
                  />
                )}

                {/* Tier name */}
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: tier.highlighted ? "var(--orange)" : "var(--fg-dim)",
                    marginBottom: 14,
                  }}
                >
                  {tier.highlighted && (
                    <span
                      style={{
                        marginRight: 8,
                        padding: "2px 6px",
                        background: "var(--orange-soft)",
                        border: "1px solid rgba(255,122,26,0.3)",
                        borderRadius: 2,
                        fontSize: 9,
                        letterSpacing: "0.1em",
                        color: "var(--orange)",
                      }}
                    >
                      MOST POPULAR
                    </span>
                  )}
                  {tier.name}
                </div>

                {/* Price */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                    marginBottom: 10,
                  }}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: 48,
                      fontWeight: 500,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                      color: "var(--fg)",
                    }}
                  >
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span
                      className="mono"
                      style={{ fontSize: 12, color: "var(--fg-mute)" }}
                    >
                      {tier.period}
                    </span>
                  )}
                </div>

                {tier.note && (
                  <p
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "var(--fg-dim)",
                      marginBottom: 20,
                      marginTop: -4,
                    }}
                  >
                    {tier.note}
                  </p>
                )}

                <p
                  style={{
                    fontSize: 14,
                    color: "var(--fg-2)",
                    lineHeight: 1.55,
                    marginBottom: 32,
                  }}
                >
                  {tier.description}
                </p>

                {/* Features */}
                <ul
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginBottom: 36,
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 36px 0",
                  }}
                >
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        fontSize: 14,
                        color: "var(--fg-2)",
                        lineHeight: 1.4,
                      }}
                    >
                      <Check />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={tier.href}
                  className={tier.highlighted ? "btn btn-primary" : "btn btn-ghost"}
                  style={{
                    justifyContent: "center",
                    width: "100%",
                    height: 44,
                  }}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p
            className="mono"
            style={{
              marginTop: 28,
              fontSize: 12,
              color: "var(--fg-dim)",
              lineHeight: 1.6,
            }}
          >
            All plans include the JSON-based editing API and MCP server. Pro
            overages billed at $0.08 / render-minute.{" "}
          </p>

          {/* FAQ teaser */}
          <div
            style={{
              marginTop: 100,
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: 64,
              paddingTop: 64,
              borderTop: "1px solid var(--line)",
            }}
          >
            <div>
              <h2>
                Common
                <br />
                <span className="serif-i" style={{ color: "var(--fg-2)" }}>
                  questions.
                </span>
              </h2>
              <p
                style={{
                  color: "var(--fg-2)",
                  fontSize: 15,
                  lineHeight: 1.6,
                  marginTop: 18,
                  maxWidth: "40ch",
                }}
              >
                Don&apos;t see your question?{" "}
                <a href="mailto:hello@framelane.io" style={{ color: "var(--orange)" }}>
                  Email us →
                </a>
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--line)" }}>
              {[
                {
                  q: "What counts as a rendered minute?",
                  a: "One rendered minute equals one minute of output video produced. A 30-second clip counts as 0.5 rendered minutes regardless of source length or complexity.",
                },
                {
                  q: "What happens if I exceed my plan limits?",
                  a: "Overages are billed automatically at $0.04 per rendered minute (1080p). You can set a monthly cap in your dashboard to avoid surprises.",
                },
                {
                  q: "Can I change plans at any time?",
                  a: "Yes. Upgrades take effect immediately and are prorated. Downgrades apply at the next billing cycle.",
                },
                {
                  q: "Do unused minutes roll over?",
                  a: "No — included minutes reset at the start of each billing cycle. We recommend choosing a plan close to your expected monthly usage.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{ borderBottom: "1px solid var(--line)", padding: "22px 0" }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 20,
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: "var(--fg-dim)",
                        minWidth: 24,
                        marginTop: 2,
                      }}
                    >
                      0{i + 1}
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          color: "var(--fg)",
                          letterSpacing: "-0.01em",
                          marginBottom: 8,
                        }}
                      >
                        {item.q}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "var(--fg-2)",
                          lineHeight: 1.6,
                        }}
                      >
                        {item.a}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
