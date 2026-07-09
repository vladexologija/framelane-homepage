import { notFound } from "next/navigation";
import { ApiError, getProject, getWorkspaceAssets, type WorkspaceAsset } from "@/lib/api";
import { filenameOf } from "@/lib/assets";
import type { EditorAsset } from "@/lib/editor-types";
import { ProjectEditorClient } from "./project-editor-client";

// Reads the signed-in user's Clerk token (via the API calls) — render
// per-request, never statically.
export const dynamic = "force-dynamic";

// The reserved id the Projects list uses for the non-persisted "Sample" project:
// it opens the editor seeded with the built-in default scene and renders through
// the one-shot POST /v1/renders path (no project row is created).
const SAMPLE_ID = "sample";

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

export default async function ProjectEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // The user's existing uploads seed the media library (stock clips are added by
  // the editor itself). A failure here just yields an empty library.
  let assets: EditorAsset[] = [];
  try {
    assets = (await getWorkspaceAssets()).map(toEditorAsset);
  } catch (e) {
    console.error("[project] failed to load workspace assets", e);
    assets = [];
  }

  // Sample: a non-persisted playground seeded with the default scene.
  if (id === SAMPLE_ID) {
    return (
      <ProjectEditorClient
        projectId={null}
        projectName="Sample project"
        initialVersion={null}
        initialRenderRequest={null}
        initialAssets={assets}
      />
    );
  }

  // Real project: load its head composition and open it in the editor.
  let project;
  try {
    project = await getProject(id, "full");
  } catch (e) {
    console.error("[project] failed to load project", id, e);
    // Only a genuine 404 means the project doesn't exist. A 500, network blip,
    // or expired token is transient and should surface as a real error, not a
    // misleading "not found".
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  return (
    <ProjectEditorClient
      projectId={project.id}
      projectName={project.name}
      initialVersion={project.version}
      initialRenderRequest={project.render_request ?? {}}
      initialAssets={assets}
    />
  );
}
