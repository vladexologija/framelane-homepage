"use server";

import { createRender, createUpload } from "@/lib/api";
import type { CreateUploadResult, UploadMeta } from "@/lib/api";
import type { RenderRequest } from "@/lib/sceneToRenderRequest";

/**
 * Server actions the Playground client calls. They run on the server, where
 * `apiFetch` attaches the signed-in user's Clerk session token and calls the
 * FrameLane API directly — keeping the backend call server-side.
 */

export async function createUploadAction(
  contentType: string,
  filename: string,
  meta?: UploadMeta,
): Promise<CreateUploadResult> {
  return createUpload(contentType, filename, meta);
}

export async function createRenderAction(
  body: RenderRequest,
): Promise<{ id: string; status: string }> {
  return createRender(body);
}
