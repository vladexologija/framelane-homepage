import type { Metadata } from "next";
import { getUsage } from "@/lib/api";

export const metadata: Metadata = { title: "Usage — FrameLane Console" };

const PERIODS = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

export default async function UsagePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period = "30d" } = await searchParams;
  const validPeriod = PERIODS.find((p) => p.value === period)?.value ?? "30d";

  let usage = null;
  try {
    usage = await getUsage(validPeriod);
  } catch {
    // API unavailable
  }

  const pct =
    usage && usage.render_minutes_limit
      ? Math.min(
          100,
          Math.round((usage.render_minutes_used / usage.render_minutes_limit) * 100)
        )
      : 0;

  return (
    <div style={{ padding: "40px 48px", maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 4 }}>
            Usage
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-mute)" }}>
            Render minutes and activity breakdown.
          </p>
        </div>

        {/* Period selector */}
        <div style={{ display: "flex", gap: 4 }}>
          {PERIODS.map((p) => (
            <a
              key={p.value}
              href={`/usage?period=${p.value}`}
              className="mono"
              style={{
                padding: "6px 12px",
                borderRadius: 4,
                fontSize: 12,
                background:
                  validPeriod === p.value
                    ? "rgba(255,122,26,0.15)"
                    : "transparent",
                border:
                  validPeriod === p.value
                    ? "1px solid rgba(255,122,26,0.3)"
                    : "1px solid var(--line)",
                color:
                  validPeriod === p.value ? "var(--orange)" : "var(--fg-mute)",
                textDecoration: "none",
              }}
            >
              {p.label}
            </a>
          ))}
        </div>
      </div>

      {usage ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Render minutes */}
          <div className="card" style={{ padding: "28px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-dim)", marginBottom: 8 }}>
                  Render minutes
                </div>
                <div className="mono" style={{ fontSize: 40, fontWeight: 500, letterSpacing: "-0.04em" }}>
                  {usage.render_minutes_used}
                  {usage.render_minutes_limit != null && (
                    <span style={{ fontSize: 18, color: "var(--fg-mute)", fontWeight: 400 }}>
                      {" "}/ {usage.render_minutes_limit}
                    </span>
                  )}
                </div>
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 32,
                  fontWeight: 500,
                  color: pct > 85 ? "var(--red)" : "var(--orange)",
                }}
              >
                {pct}%
              </div>
            </div>
            <div style={{ height: 6, background: "var(--bg-elev-2)", borderRadius: 3, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: pct > 85 ? "var(--red)" : "var(--orange)",
                  borderRadius: 3,
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              <span style={{ fontSize: 12, color: "var(--fg-dim)" }}>
                Period: {new Date(usage.period_start).toLocaleDateString()} — {new Date(usage.period_end).toLocaleDateString()}
              </span>
              {usage.render_minutes_limit != null && (
                <span style={{ fontSize: 12, color: "var(--fg-mute)" }}>
                  {usage.render_minutes_limit - usage.render_minutes_used} min remaining
                </span>
              )}
            </div>
          </div>

          {/* Activity summary */}
          <div className="card" style={{ padding: "24px 28px" }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-dim)", marginBottom: 10 }}>
              Renders
            </div>
            <div className="mono" style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.04em" }}>
              {usage.renders_count ?? "—"}
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-mute)", marginTop: 4 }}>
              render jobs submitted
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "var(--fg-mute)", fontSize: 14 }}>
            No usage data available for this period.
          </p>
        </div>
      )}
    </div>
  );
}
