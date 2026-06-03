import type { Metadata } from "next";
import { getApiKeys } from "@/lib/api";
import { CreateKeyForm } from "./create-key-form";
import { revokeApiKey } from "./actions";

export const metadata: Metadata = { title: "API Keys — FrameLane Console" };

export default async function ApiKeysPage() {
  let keys = null;
  let keysError: string | null = null;
  try {
    keys = await getApiKeys();
  } catch (err) {
    keysError = err instanceof Error ? err.message : "Failed to load keys";
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 4 }}>
          API Keys
        </h1>
        <p style={{ fontSize: 13, color: "var(--fg-mute)" }}>
          Manage keys used to authenticate with{" "}
          <span className="mono">api.framelane.io</span>.
        </p>
      </div>

      {/* Create form */}
      <div
        className="card"
        style={{ padding: "28px 32px", marginBottom: 32 }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 20 }}>
          Create new key
        </h2>
        <CreateKeyForm />
      </div>

      {/* Keys list */}
      <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>
        Active keys
      </h2>

      {keysError && (
        <div className="card" style={{ padding: "16px 20px", marginBottom: 16, borderColor: "rgba(255,107,107,0.3)", background: "rgba(255,107,107,0.06)" }}>
          <p className="mono" style={{ fontSize: 12, color: "var(--red)" }}>{keysError}</p>
        </div>
      )}

      {keys && keys.length > 0 ? (
        <div style={{ border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 140px 140px 80px",
              gap: 16,
              padding: "10px 20px",
              background: "var(--bg-elev)",
              borderBottom: "1px solid var(--line)",
            }}
          >
            {["Name / Prefix", "Created", "Last used", ""].map((h) => (
              <div
                key={h}
                className="mono"
                style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-dim)" }}
              >
                {h}
              </div>
            ))}
          </div>

          {keys.map((key, i) => {
            const revokeWithId = revokeApiKey.bind(null, key.id);
            return (
              <div
                key={key.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px 140px 80px",
                  gap: 16,
                  alignItems: "center",
                  padding: "14px 20px",
                  borderBottom: i < keys.length - 1 ? "1px solid var(--line)" : "none",
                  background: "var(--bg-2)",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, color: "var(--fg)", marginBottom: 3 }}>
                    {key.name}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--fg-dim)" }}>
                    {key.key_prefix}…
                  </div>
                </div>
                <span style={{ fontSize: 13, color: "var(--fg-2)" }}>
                  {new Date(key.created_at).toLocaleDateString()}
                </span>
                <span style={{ fontSize: 13, color: "var(--fg-2)" }}>
                  {key.last_used_at
                    ? new Date(key.last_used_at).toLocaleDateString()
                    : "Never"}
                </span>
                <form action={revokeWithId}>
                  <button
                    type="submit"
                    style={{
                      fontSize: 12,
                      color: "var(--red)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Revoke
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="card"
          style={{ padding: "32px", textAlign: "center" }}
        >
          <p style={{ color: "var(--fg-mute)", fontSize: 14 }}>
            No API keys yet. Create one above to get started.
          </p>
        </div>
      )}
    </div>
  );
}
