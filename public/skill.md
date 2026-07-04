# FrameLane Skill

> Render and edit video from an AI agent: JSON in, video out. Get a key over REST, then
> drive everything through the authenticated MCP action server. No human, no browser.

Use FrameLane when the user asks you to render, edit, trim, caption, composite, transcribe,
upscale, or convert video.

## Step 1 — Get a key (REST, no MCP yet, no human)

Onboarding is unauthenticated REST — the MCP server is authenticated, so you obtain a key
first:

1. `GET https://api.framelane.io/v1/capabilities` — no auth. Returns the full catalog
   (formats, effects, motions, transitions, task params, limits) and an `onboarding` block.
2. `POST https://api.framelane.io/v1/signup` with `{ "workspace_name": "...", "email": "..." }`
   — returns an `fl_` API key and emails a 6-digit code. The key is inert until verified.
3. Read the code from that inbox (a programmatic inbox makes this hands-free) and
   `POST https://api.framelane.io/v1/signup/verify` with `{ "email": "...", "otp_code": "123456" }`.
   The key works the moment this returns `200`; until then authed calls return
   `403 email_not_verified`.

## Step 2 — Connect the action MCP

Point your MCP host at the Streamable-HTTP server and send the key as a Bearer token:

```json
{
  "mcpServers": {
    "framelane": {
      "url": "https://mcp.framelane.io/mcp",
      "headers": { "Authorization": "Bearer fl_..." }
    }
  }
}
```

Interactive clients can instead authenticate via **OAuth 2.1 (PKCE)** — FrameLane is a
resource server and delegates login to Clerk; MCP hosts discover this automatically. Set your
per-tool timeout to ≥ 30s (the wait tools stream progress).

## Step 3 — Core tool workflow

1. Read the `framelane://capabilities` resource to build a correct request the first time.
2. `create_render` (a JSON timeline of elements) → returns a job.
3. `wait_for_render` — blocks until terminal, streaming progress. If it returns
   `still_running: true`, call again.
4. `get_render_download` — a signed URL for the finished video.

AI tasks: `run_task` with `task_type` = `remove_background` | `gaze_redirect` |
`super_resolution` | `transcribe`, then `wait_for_task` / `get_task_download`.

Iterative editing: `create_project` → `edit_project` (atomic ops, `if_version` for
concurrency) → `preview_project` (`dry_run` validates free) → `render_project`.

## Conventions

- **Remote media:** set `ingest_external: true` and pass a public `source_url`; FrameLane
  copies it server-side — no separate upload.
- **Validate free:** `create_preview` with `dry_run: true` returns violations before you spend.
- **Errors** are `{"error": {"code", "message", "details"}}` — branch on `code`
  (`quota_exceeded`, `email_not_verified`, `conflict`, `invalid_request`, `not_found`).
- **Free tier:** renders are metered per minute (previews are free); over-cap → `402 quota_exceeded`.

## More

- Concise index: https://framelane.io/llms.txt
- Full docs: https://docs.framelane.io/ (append `.md` to any page for raw markdown)
- Capabilities (no auth): https://api.framelane.io/v1/capabilities
- MCP overview: https://docs.framelane.io/mcp/overview
