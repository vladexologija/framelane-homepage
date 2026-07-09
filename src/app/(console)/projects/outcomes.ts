/**
 * Result shapes the project mutation server actions RETURN.
 *
 * Server Actions must return expected failures as data rather than throw them:
 * Next.js redacts thrown Server Action errors in production (the client only
 * gets a generic message + digest), so a status code carried in a thrown error
 * can't be read on the client. Returned data is serialized normally, so an
 * outcome object survives the boundary and the client can branch on it.
 *
 * Read actions (getProjectAction, getRendersAction) still throw — their callers
 * only need "worked or not", not a structured status.
 */

export type CreateProjectOutcome =
  | { ok: true; id: string }
  | { ok: false; message: string };

export type DeleteOutcome = { ok: true } | { ok: false; message: string };

export type SaveOutcome =
  | { ok: true; version: number }
  // `conflict` is a stale-version 409: the caller should refresh the head.
  | { ok: false; conflict: boolean; message: string };

export type RenderOutcome =
  | { ok: true; render: { id: string; status: string } }
  | { ok: false; message: string };

export type RendersOutcome =
  | { ok: true; items: import("@/lib/api").Render[] }
  | { ok: false; message: string };
