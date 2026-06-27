import { getWorkspaceAssets, type WorkspaceAsset } from "@/lib/api";
import { filenameOf } from "@/lib/assets";
import type { EditorAsset } from "@/lib/editor-types";
import { PlaygroundClient } from "./playground-client";

// Reads the signed-in user's Clerk token (via getWorkspaceAssets) — render
// per-request, never statically (also avoids Next's build-time dynamic-usage
// probe tripping the catch).
export const dynamic = "force-dynamic";

const toEditorAsset = (a: WorkspaceAsset): EditorAsset => ({
  id: a.id,
  kind: a.kind === "audio" ? "AUDIO" : "VIDEO",
  filename: filenameOf(a.source_url),
  status: "READY",
  durationSec: a.duration,
  width: a.width,
  height: a.height,
  fileUrl: a.source_url,
});

export default async function PlaygroundPage() {
  // The user's existing uploads seed the media library (stock clips are added by
  // the editor itself). A failure here just yields an empty library — never blocks
  // the editor, which works fully in-memory.
  let assets: EditorAsset[] = [];
  try {
    assets = (await getWorkspaceAssets()).map(toEditorAsset);
  } catch (e) {
    console.error("[playground] failed to load workspace assets", e);
    assets = [];
  }

  return <PlaygroundClient initialAssets={assets} />;
}
