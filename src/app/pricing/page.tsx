import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Pricing — FrameLane",
  description:
    "Simple, predictable pricing based on rendered minutes, concurrent slots, and storage.",
};

interface Tier {
  name: string;
  price: string;
  period: string;
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
    period: "forever",
    description: "Try FrameLane with generous limits — no credit card required.",
    features: [
      "60 rendered minutes / month",
      "1 concurrent render slot",
      "5 GB asset storage",
      "Community support",
      "Webhook events",
      "All edit primitives",
    ],
    cta: "Start for free",
    href: SITE.consoleUrl,
  },
  {
    name: "Pro",
    price: "$99",
    period: "/ month",
    description: "For teams shipping video agents to production.",
    features: [
      "2,000 rendered minutes / month",
      "10 concurrent render slots",
      "100 GB asset storage",
      "Priority support",
      "99.9% uptime SLA",
      "Custom domains & branding",
      "Webhook verification",
      "Templated edits",
    ],
    cta: "Start Pro trial",
    href: SITE.consoleUrl,
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description:
      "Dedicated infrastructure, compliance, and white-glove onboarding.",
    features: [
      "Unlimited rendered minutes",
      "Unlimited concurrency",
      "Unlimited storage",
      "Dedicated account manager",
      "Custom SLA",
      "SOC 2 & HIPAA ready",
      "SSO / SAML",
      "On-prem / VPC deployment",
    ],
    cta: "Contact sales",
    href: "mailto:sales@framelane.dev",
  },
];

export default function PricingPage() {
  return (
    <>
      <div className="border-b border-dashed border-muted-foreground/20 px-6 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          [ Pricing ]
        </span>
      </div>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <h1 className="font-logo text-4xl sm:text-5xl">
              Simple, predictable pricing
            </h1>
            <p className="mt-4 text-lg text-muted">
              Pay for what you render. Scale up or down at any time.
            </p>
          </div>

          <div className="mt-16 grid gap-4 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "relative flex flex-col border p-8",
                  tier.highlighted
                    ? "border-accent bg-card"
                    : "border-border bg-card"
                )}
              >
                {tier.highlighted && (
                  <>
                    <span className="absolute -left-px -top-px h-3 w-3 border-l border-t border-accent" />
                    <span className="absolute -right-px -top-px h-3 w-3 border-r border-t border-accent" />
                    <span className="absolute -bottom-px -left-px h-3 w-3 border-b border-l border-accent" />
                    <span className="absolute -bottom-px -right-px h-3 w-3 border-b border-r border-accent" />
                  </>
                )}

                <h2 className="font-mono text-xs font-semibold uppercase tracking-wider">
                  {tier.name}
                </h2>
                <p className="mt-2 text-sm text-muted">{tier.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-bold tracking-tight">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="font-mono text-xs text-muted-foreground">
                      {tier.period}
                    </span>
                  )}
                </div>

                <ul className="mt-8 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-muted"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={cn(
                    "mt-8 block py-3 text-center font-mono text-sm font-medium uppercase tracking-wider transition-colors",
                    tier.highlighted
                      ? "bg-accent text-white hover:bg-accent/80"
                      : "border border-muted-foreground/30 text-muted hover:border-foreground hover:text-foreground"
                  )}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-12 font-mono text-xs text-muted-foreground">
            All plans include all edit primitives, webhook events, and API
            access. Overages billed at published per-minute rates.
          </p>
        </div>
      </section>
    </>
  );
}
