import type { Metadata } from "next";
import { getWorkspaceAssets, type WorkspaceAsset } from "@/lib/api";
import { AssetsGrid } from "./assets-grid";

export const metadata: Metadata = { title: "Assets — FrameLane Console" };

// Reads the signed-in user's Clerk token (via getWorkspaceAssets) — render
// per-request, never statically.
export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  let assets: WorkspaceAsset[] | null = null;
  try {
    assets = await getWorkspaceAssets();
  } catch (e) {
    console.error("[assets] failed to load workspace assets", e);
    assets = null; // distinguishes an API failure from a genuinely empty library
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1100 }}>
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            marginBottom: 4,
          }}
        >
          Assets
        </h1>
        <p style={{ fontSize: 13, color: "var(--fg-mute)" }}>
          Every video and audio file you&rsquo;ve uploaded to this workspace.
        </p>
      </div>

      {assets === null ? (
        <div
          className="card"
          style={{ padding: "48px", textAlign: "center" }}
        >
          <p
            style={{ color: "var(--fg-mute)", fontSize: 14, marginBottom: 12 }}
          >
            Couldn&rsquo;t load your assets right now.
          </p>
          <p style={{ color: "var(--fg-dim)", fontSize: 13 }}>
            Refresh the page to try again.
          </p>
        </div>
      ) : assets.length === 0 ? (
        <div
          className="card"
          style={{ padding: "48px", textAlign: "center" }}
        >
          <p
            style={{ color: "var(--fg-mute)", fontSize: 14, marginBottom: 12 }}
          >
            No assets yet.
          </p>
          <a href="/playground" style={{ fontSize: 13, color: "var(--orange)" }}>
            Upload media in the Playground →
          </a>
        </div>
      ) : (
        <AssetsGrid assets={assets} />
      )}
    </div>
  );
}
