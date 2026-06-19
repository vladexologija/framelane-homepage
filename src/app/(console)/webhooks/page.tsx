import type { Metadata } from "next";
import Link from "next/link";
import { getWebhooks } from "@/lib/api";

export const metadata: Metadata = { title: "Webhooks — FrameLane Console" };

export default async function WebhooksPage() {
  let webhooks = null;
  try {
    webhooks = await getWebhooks();
  } catch {
    // API unavailable
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 900 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 32,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 4 }}>
            Webhooks
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-mute)" }}>
            Receive HTTP notifications when renders complete.
          </p>
        </div>
        <a
          href="https://docs.framelane.io/webhooks"
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 13, color: "var(--orange)" }}
        >
          View docs →
        </a>
      </div>

      {webhooks && webhooks.length > 0 ? (
        <div style={{ border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 100px 120px",
              gap: 16,
              padding: "10px 20px",
              background: "var(--bg-elev)",
              borderBottom: "1px solid var(--line)",
            }}
          >
            {["Endpoint URL", "Events", "Status", "Last delivery"].map((h) => (
              <div
                key={h}
                className="mono"
                style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-dim)" }}
              >
                {h}
              </div>
            ))}
          </div>

          {webhooks.map((webhook, i) => (
            <div
              key={webhook.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 100px 120px",
                gap: 16,
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: i < webhooks.length - 1 ? "1px solid var(--line)" : "none",
                background: "var(--bg-2)",
              }}
            >
              <div>
                <div className="mono" style={{ fontSize: 12, color: "var(--fg)", marginBottom: 4, wordBreak: "break-all" }}>
                  {webhook.url}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      className="mono"
                      style={{
                        fontSize: 10,
                        padding: "2px 6px",
                        background: "var(--bg-elev-2)",
                        border: "1px solid var(--line)",
                        borderRadius: 2,
                        color: "var(--fg-mute)",
                      }}
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>
              <span style={{ fontSize: 13, color: "var(--fg-2)" }}>
                {webhook.events.length} event{webhook.events.length !== 1 ? "s" : ""}
              </span>
              <span
                className="mono"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: webhook.enabled ? "var(--green)" : "var(--fg-dim)",
                }}
              >
                {webhook.enabled ? "Active" : "Disabled"}
              </span>
              <span style={{ fontSize: 13, color: "var(--fg-2)" }}>
                {webhook.last_delivery_at
                  ? new Date(webhook.last_delivery_at).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "var(--fg-mute)", fontSize: 14, marginBottom: 16 }}>
            No webhooks configured.
          </p>
          <p style={{ color: "var(--fg-dim)", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
            Use{" "}
            <Link
              href="https://docs.framelane.io/api-reference/webhooks"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--fg-mute)" }}
            >
              <code className="mono">POST /v1/webhooks</code>
            </Link>{" "}
            via the API to register an endpoint.
          </p>
          <a
            href="https://docs.framelane.io/webhooks"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, color: "var(--orange)" }}
          >
            Learn about webhooks →
          </a>
        </div>
      )}
    </div>
  );
}
