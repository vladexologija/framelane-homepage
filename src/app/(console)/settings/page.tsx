import type { Metadata } from "next";
import { getWorkspace } from "@/lib/api";
import { WorkspaceNameForm, DeleteWorkspaceForm } from "./workspace-form";

export const metadata: Metadata = { title: "Settings — FrameLane Console" };

export default async function SettingsPage() {
  let workspace = null;
  try {
    workspace = await getWorkspace();
  } catch {
    // API unavailable
  }

  const plan = workspace?.plan ?? "free";
  const planLabels: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    enterprise: "Enterprise",
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: 760 }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 4 }}>
          Settings
        </h1>
        <p style={{ fontSize: 13, color: "var(--fg-mute)" }}>
          Manage your workspace configuration.
        </p>
      </div>

      {/* Workspace info */}
      <div className="card" style={{ padding: "28px 32px", marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 20 }}>
          Workspace
        </h2>
        {workspace ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <WorkspaceNameForm currentName={workspace.name} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
              <div>
                <div className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-dim)", marginBottom: 6 }}>
                  Workspace ID
                </div>
                <div className="mono" style={{ fontSize: 12, color: "var(--fg-mute)" }}>
                  {workspace.id}
                </div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-dim)", marginBottom: 6 }}>
                  Plan
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: plan === "pro" ? "var(--orange)" : "var(--fg-2)",
                    fontWeight: 500,
                  }}
                >
                  {planLabels[plan] ?? plan}
                </div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-dim)", marginBottom: 6 }}>
                  Created
                </div>
                <div style={{ fontSize: 13, color: "var(--fg-2)" }}>
                  {new Date(workspace.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--fg-mute)" }}>
            Could not load workspace data.
          </p>
        )}
      </div>

      {/* Danger zone */}
      <div
        style={{
          border: "1px solid rgba(255,107,107,0.2)",
          borderRadius: 6,
          padding: "28px 32px",
          background: "rgba(255,107,107,0.02)",
        }}
      >
        <h2
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: "var(--red)",
            marginBottom: 20,
          }}
        >
          Danger zone
        </h2>
        <DeleteWorkspaceForm />
      </div>
    </div>
  );
}
