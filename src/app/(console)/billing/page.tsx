import type { Metadata } from "next";
import { getUsage, getWorkspace } from "@/lib/api";
import { BillingPortalButton } from "./billing-portal-button";

export const metadata: Metadata = { title: "Billing — FrameLane Console" };

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

const PLAN_PRICES: Record<string, string> = {
  free: "$0 / month",
  pro: "$99 / month",
  enterprise: "Custom",
};

export default async function BillingPage() {
  const [workspaceResult, usageResult] = await Promise.allSettled([
    getWorkspace(),
    getUsage(),
  ]);

  const workspace = workspaceResult.status === "fulfilled" ? workspaceResult.value : null;
  const usage = usageResult.status === "fulfilled" ? usageResult.value : null;

  const plan = workspace?.plan ?? "free";
  const minutesPct = usage
    ? Math.min(100, Math.round((usage.render_minutes_used / (usage.render_minutes_limit || 1)) * 100))
    : 0;

  return (
    <div style={{ padding: "40px 48px", maxWidth: 760 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 4 }}>
          Billing
        </h1>
        <p style={{ fontSize: 13, color: "var(--fg-mute)" }}>
          Manage your plan, view usage, and update payment details.
        </p>
      </div>

      {/* Current plan */}
      <div className="card" style={{ padding: "28px 32px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-dim)", marginBottom: 8 }}>
              Current plan
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  color: plan === "pro" ? "var(--orange)" : "var(--fg)",
                }}
              >
                {PLAN_LABELS[plan] ?? plan}
              </span>
              <span className="mono" style={{ fontSize: 13, color: "var(--fg-mute)" }}>
                {PLAN_PRICES[plan] ?? ""}
              </span>
            </div>
          </div>
          {plan !== "enterprise" && (
            <a
              href="/pricing"
              style={{
                fontSize: 13,
                color: "var(--orange)",
                border: "1px solid rgba(255,122,26,0.3)",
                padding: "8px 14px",
                borderRadius: 4,
                textDecoration: "none",
              }}
            >
              {plan === "free" ? "Upgrade →" : "Change plan →"}
            </a>
          )}
        </div>

        {usage && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--fg-2)" }}>
                Render minutes used this period
              </span>
              <span className="mono" style={{ fontSize: 13, color: "var(--fg)" }}>
                {usage.render_minutes_used} / {usage.render_minutes_limit}
              </span>
            </div>
            <div style={{ height: 4, background: "var(--bg-elev-2)", borderRadius: 2, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${minutesPct}%`,
                  background: minutesPct > 85 ? "var(--red)" : "var(--orange)",
                  borderRadius: 2,
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Paddle portal */}
      {plan !== "free" && (
        <div className="card" style={{ padding: "28px 32px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
            Manage billing
          </h2>
          <p style={{ fontSize: 13, color: "var(--fg-2)", marginBottom: 20, lineHeight: 1.5 }}>
            Update payment details, download invoices, or cancel your subscription via the Paddle billing portal.
          </p>
          <BillingPortalButton />
        </div>
      )}

      {plan === "free" && (
        <div
          style={{
            padding: "20px 24px",
            background: "rgba(255,122,26,0.04)",
            border: "1px solid rgba(255,122,26,0.15)",
            borderRadius: 6,
          }}
        >
          <p style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.6 }}>
            You&apos;re on the free plan. Upgrade to Pro for a dedicated render queue, plus no watermarks, more render minutes, and GPU rendering.{" "}
            <a href="/pricing" style={{ color: "var(--orange)" }}>
              View pricing →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
