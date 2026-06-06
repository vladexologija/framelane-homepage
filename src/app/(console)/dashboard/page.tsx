import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getUsage, getRenders } from "@/lib/api";
import { ApiKeyBanner } from "./api-key-banner";

export const metadata: Metadata = { title: "Dashboard — FrameLane Console" };

function PageHeader() {
  return (
    <div style={{ marginBottom: 32 }}>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: "-0.02em",
          marginBottom: 4,
        }}
      >
        Dashboard
      </h1>
      <p style={{ fontSize: 13, color: "var(--fg-mute)" }}>
        Overview of your workspace activity this month.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div
      className="card"
      style={{ padding: "20px 24px" }}
    >
      <div
        className="mono"
        style={{
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--fg-dim)",
          marginBottom: 12,
        }}
      >
        {label}
      </div>
      <div
        className="mono"
        style={{ fontSize: 32, fontWeight: 500, letterSpacing: "-0.03em", color: "var(--fg)" }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "var(--fg-mute)", marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    done: "var(--green)",
    processing: "var(--orange)",
    queued: "var(--fg-mute)",
    failed: "var(--red)",
  };
  return (
    <span
      className="mono"
      style={{
        fontSize: 11,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: colors[status] ?? "var(--fg-mute)",
      }}
    >
      {status}
    </span>
  );
}

export default async function DashboardPage() {
  const [usage, renders] = await Promise.allSettled([
    getUsage(),
    getRenders(),
  ]);

  const usageData = usage.status === "fulfilled" ? usage.value : null;
  const rendersData = renders.status === "fulfilled" ? renders.value : null;

  const minutesPct =
    usageData && usageData.render_minutes_limit
      ? Math.min(
          100,
          Math.round(
            (usageData.render_minutes_used / usageData.render_minutes_limit) * 100
          )
        )
      : 0;

  return (
    <div style={{ padding: "40px 48px", maxWidth: 900 }}>
      <PageHeader />

      {/* One-time API key banner (client component reads sessionStorage) */}
      <Suspense fallback={null}>
        <ApiKeyBanner />
      </Suspense>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 40,
        }}
      >
        <StatCard
          label="Render minutes"
          value={
            usageData
              ? usageData.render_minutes_limit
                ? `${usageData.render_minutes_used} / ${usageData.render_minutes_limit}`
                : `${usageData.render_minutes_used}`
              : "—"
          }
          sub={usageData && usageData.render_minutes_limit ? `${minutesPct}% of plan used` : undefined}
        />
        <StatCard
          label="Renders"
          value={usageData?.renders_count ?? "—"}
          sub="this billing period"
        />
        <StatCard
          label="Tasks"
          value={usageData?.tasks_count ?? "—"}
          sub="this billing period"
        />
      </div>

      {/* Render minutes progress bar */}
      {usageData && (
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Render minutes usage
            </span>
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-mute)" }}>
              {minutesPct}%
            </span>
          </div>
          <div
            style={{
              height: 4,
              background: "var(--bg-elev-2)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${minutesPct}%`,
                background: minutesPct > 85 ? "var(--red)" : "var(--orange)",
                borderRadius: 2,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Recent renders */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 500 }}>Recent renders</h2>
          <Link
            href="/renders"
            style={{ fontSize: 13, color: "var(--orange)" }}
          >
            View all →
          </Link>
        </div>

        {rendersData && rendersData.items.length > 0 ? (
          <div style={{ border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
            {rendersData.items.slice(0, 5).map((render, i) => (
              <div
                key={render.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 20px",
                  borderBottom:
                    i < Math.min(rendersData.items.length, 5) - 1
                      ? "1px solid var(--line)"
                      : "none",
                  background: "var(--bg-2)",
                }}
              >
                <span className="mono" style={{ fontSize: 12, color: "var(--fg-mute)" }}>
                  {render.id}
                </span>
                <StatusBadge status={render.status} />
                <span style={{ fontSize: 12, color: "var(--fg-dim)" }}>
                  {new Date(render.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 6,
              padding: "32px 20px",
              textAlign: "center",
              background: "var(--bg-2)",
            }}
          >
            <p style={{ fontSize: 14, color: "var(--fg-mute)" }}>
              No renders yet.{" "}
              <a
                href="https://docs.framelane.io"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--orange)" }}
              >
                Read the quickstart →
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
