"use server";

import {
  ApiError,
  createProject,
  createProjectRender,
  createRender,
  createUpload,
  deleteProject,
  getProject,
  getRenders,
  saveProject,
  type CreateUploadResult,
  type Project,
  type UploadMeta,
} from "@/lib/api";
import type {
  CreateProjectOutcome,
  DeleteOutcome,
  RenderOutcome,
  RendersOutcome,
  SaveOutcome,
} from "./outcomes";

/**
 * Server actions the Projects console calls. They run on the server, where
 * `apiFetch` attaches the signed-in user's Clerk session token and calls the
 * FrameLane API directly (apiFetch is `server-only`, so the client editor + tabs
 * must go through these).
 *
 * Mutations return typed outcomes rather than throw: Next.js redacts thrown
 * Server Action errors in production, so the client couldn't otherwise read a
 * status (e.g. a 409 conflict). See ./outcomes.
 */

function toMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong";
}

// Seed a new project with valid canvas defaults (4K UHD, 30fps) rather than the
// API's all-null empty request, so the editor opens on a renderable composition.
const NEW_PROJECT_REQUEST = {
  width: 3840,
  height: 2160,
  frame_rate: 30,
  duration: 10,
  output_format: "mp4",
  background_color: "#000000ff",
  elements: [],
  transitions: [],
};

// ---- media + one-shot render (reused by the non-persisted Sample project) ----

export async function createUploadAction(
  contentType: string,
  filename: string,
  meta?: UploadMeta,
): Promise<CreateUploadResult> {
  return createUpload(contentType, filename, meta);
}

export async function createRenderAction(body: unknown): Promise<RenderOutcome> {
  try {
    return { ok: true, render: await createRender(body) };
  } catch (e) {
    console.error("[projects] one-shot render failed", e);
    return { ok: false, message: toMessage(e) };
  }
}

// ---- project lifecycle ----

/** Create an empty project. The client navigates into it on success. */
export async function createProjectAction(name?: string): Promise<CreateProjectOutcome> {
  try {
    const project = await createProject({
      name: name?.trim() || undefined,
      render_request: NEW_PROJECT_REQUEST,
    });
    return { ok: true, id: project.id };
  } catch (e) {
    console.error("[projects] create failed", e);
    return { ok: false, message: toMessage(e) };
  }
}

export async function deleteProjectAction(id: string): Promise<DeleteOutcome> {
  try {
    await deleteProject(id);
    return { ok: true };
  } catch (e) {
    console.error("[projects] delete failed", id, e);
    return { ok: false, message: toMessage(e) };
  }
}

/** Fetch the project head (used to reconcile after a 409). Throws on failure. */
export async function getProjectAction(id: string): Promise<Project> {
  return getProject(id, "full");
}

/** Persist the whole composition as the project head (replace_request op). */
export async function saveProjectAction(
  id: string,
  renderRequest: unknown,
  ifVersion?: number,
): Promise<SaveOutcome> {
  try {
    const result = await saveProject(id, renderRequest, ifVersion);
    return { ok: true, version: result.version };
  } catch (e) {
    console.error("[projects] save failed", id, e);
    return {
      ok: false,
      conflict: e instanceof ApiError && e.status === 409,
      message: toMessage(e),
    };
  }
}

/** Render the project's current head. Save first so the head is up to date. */
export async function createProjectRenderAction(id: string): Promise<RenderOutcome> {
  try {
    return { ok: true, render: await createProjectRender(id) };
  } catch (e) {
    console.error("[projects] project render failed", id, e);
    return { ok: false, message: toMessage(e) };
  }
}

/** Fetch the workspace renders for the editor's Renders tab. */
export async function getRendersAction(page = 1): Promise<RendersOutcome> {
  try {
    const { items } = await getRenders(page);
    return { ok: true, items };
  } catch (e) {
    console.error("[projects] load renders failed", e);
    return { ok: false, message: toMessage(e) };
  }
}
