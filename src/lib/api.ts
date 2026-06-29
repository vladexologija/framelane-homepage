import "server-only";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.framelane.io";

// ---------- types ----------

export interface WorkspaceUsage {
  render_minutes_used: number;
  render_minutes_limit: number | null;
  renders_count: number | null;
  egress_bytes: number;
  period_start: string;
  period_end: string;
}

export interface Render {
  id: string;
  status: "queued" | "processing" | "done" | "failed";
  created_at: string;
  duration_ms?: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at?: string;
  revoked_at?: string | null;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  created_at: string;
  enabled: boolean;
  last_delivery_at?: string;
}

export interface Workspace {
  id: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
  created_at: string;
}

// Paginated envelope the backend returns for list endpoints
interface PagedResponse<T> {
  data: T[];
  next_cursor: string | null;
  has_more: boolean;
}

// Normalize: handles { data: [] } envelope, plain arrays, and legacy { items: [] }
function extractList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const obj = raw as Record<string, unknown>;
  const list = obj.data ?? obj.items ?? obj.keys;
  return Array.isArray(list) ? (list as T[]) : [];
}

// ---------- core fetch ----------

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // First-party console auth: forward the signed-in user's Clerk session token.
  // The backend accepts either a Clerk JWT (→ maps to the workspace) or an `fl_`
  // API key. Requires clerkMiddleware, which runs via proxy.ts.
  const { getToken } = await auth();
  const token = await getToken();

  // Forward the browser's Origin to the API. This server action runs in Node,
  // so the browser's Origin would otherwise be lost. The API needs it to bind
  // GCS resumable-upload sessions to the requesting origin — GCS only emits
  // Access-Control-Allow-Origin on the direct-to-bucket PUT when the session was
  // initiated with the eventual client's Origin, so without this the browser's
  // upload PUT is blocked by CORS. Best-effort: headers() needs a request scope.
  let browserOrigin: string | null = null;
  try {
    browserOrigin = (await headers()).get("origin");
  } catch {
    // No request scope (e.g. during build) — nothing to forward.
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(browserOrigin ? { Origin: browserOrigin } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
    // Always fetch fresh data in the console
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text}`);
  }

  // 204 No Content (e.g. DELETE /v1/api-keys/{id}) has an empty body —
  // res.json() would throw "Unexpected end of JSON input".
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// ---------- endpoints ----------

export async function getUsage(period = "30d") {
  const raw = await apiFetch<Record<string, unknown>>(
    `/v1/workspace/usage?period=${period}`
  );
  return {
    render_minutes_used: (raw.render_minutes_used ?? raw.render_minutes ?? 0) as number,
    render_minutes_limit: (raw.render_minutes_limit ?? null) as number | null,
    renders_count: (raw.renders_count ?? null) as number | null,
    egress_bytes: (raw.egress_bytes ?? 0) as number,
    period_start: raw.period_start as string,
    period_end: raw.period_end as string,
  } satisfies WorkspaceUsage;
}

export async function getRenders(page = 1) {
  const raw = await apiFetch<PagedResponse<Render> | Render[]>(
    `/v1/renders?page=${page}&limit=20`
  );
  const items = extractList<Render>(raw);
  const hasMore = !Array.isArray(raw) && (raw as PagedResponse<Render>).has_more;
  return { items, total: hasMore ? items.length + 1 : items.length };
}

export async function getApiKeys() {
  const raw = await apiFetch<PagedResponse<ApiKey> | ApiKey[]>("/v1/api-keys");
  // The API returns every key for the workspace, including revoked ones. The
  // console's "Active keys" list should only show live keys, so drop any that
  // have been revoked — otherwise a just-revoked key lingers and revoke looks
  // like a no-op.
  return extractList<ApiKey>(raw).filter((k) => !k.revoked_at);
}

export async function getWebhooks() {
  const raw = await apiFetch<PagedResponse<Webhook> | Webhook[]>("/v1/webhooks");
  return extractList<Webhook>(raw);
}

export async function getWorkspace() {
  return apiFetch<Workspace>("/v1/workspace");
}

export async function createBillingPortalSession() {
  return apiFetch<{ url: string }>("/v1/billing/portal", { method: "POST" });
}

// ---------- playground: workspace media + uploads + renders ----------

export interface WorkspaceAsset {
  id: string;
  source_url: string;
  kind: "video" | "audio";
  duration: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
}

/** The signed-in workspace's ready video/audio uploads (GET /v1/workspace/assets). */
export async function getWorkspaceAssets() {
  const raw = await apiFetch<
    PagedResponse<WorkspaceAsset> | WorkspaceAsset[]
  >("/v1/workspace/assets?limit=100");
  return extractList<WorkspaceAsset>(raw);
}

export interface CreateUploadResult {
  upload_url: string;
  source_url: string;
  expires_at: string;
}

export interface UploadMeta {
  duration?: number | null;
  width?: number | null;
  height?: number | null;
}

/** Reserve a signed upload URL (POST /v1/uploads); the client PUTs bytes to it.
 * Pass client-probed `meta` (duration/width/height) so the asset is immediately
 * ready/listable instead of waiting on the server-side metadata pipeline. */
export async function createUpload(
  contentType: string,
  filename?: string,
  meta?: UploadMeta,
) {
  return apiFetch<CreateUploadResult>("/v1/uploads", {
    method: "POST",
    body: JSON.stringify({
      content_type: contentType,
      filename,
      duration: meta?.duration ?? undefined,
      width: meta?.width ?? undefined,
      height: meta?.height ?? undefined,
    }),
  });
}

/** Submit a composition to render (POST /v1/renders). */
export async function createRender(body: unknown) {
  return apiFetch<{ id: string; status: string }>("/v1/renders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
