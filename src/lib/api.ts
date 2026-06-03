import "server-only";
import { cookies } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.framelane.io";

// ---------- types ----------

export interface WorkspaceUsage {
  render_minutes_used: number;
  render_minutes_limit: number | null;
  renders_count: number | null;
  tasks_count: number;
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

export interface Task {
  id: string;
  type: string;
  status: "queued" | "processing" | "done" | "failed";
  created_at: string;
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
  const cookieStore = await cookies();
  const token = cookieStore.get("fl_api_key")?.value;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
    // Always fetch fresh data in the console
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text}`);
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
    tasks_count: (raw.tasks_count ?? raw.task_count ?? 0) as number,
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

export async function getTasksList(page = 1) {
  const raw = await apiFetch<PagedResponse<Task> | Task[]>(
    `/v1/tasks?page=${page}&limit=20`
  );
  const items = extractList<Task>(raw);
  const hasMore = !Array.isArray(raw) && (raw as PagedResponse<Task>).has_more;
  return { items, total: hasMore ? items.length + 1 : items.length };
}

export async function getApiKeys() {
  const raw = await apiFetch<PagedResponse<ApiKey> | ApiKey[]>("/v1/api-keys");
  return extractList<ApiKey>(raw);
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
