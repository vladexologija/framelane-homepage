"use server";

import { createUpload } from "@/lib/api";
import type { CreateUploadResult, UploadMeta } from "@/lib/api";

/**
 * Reserve a signed upload URL for an asset uploaded from the Assets page. Runs
 * on the server, where `apiFetch` attaches the signed-in user's Clerk token.
 * (Mirror of the Playground's upload action — the client then PUTs the bytes to
 * `upload_url`.)
 */
export async function createUploadAction(
  contentType: string,
  filename: string,
  meta?: UploadMeta,
): Promise<CreateUploadResult> {
  return createUpload(contentType, filename, meta);
}
