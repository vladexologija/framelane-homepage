# FrameLane Skill

> Edit and render video from an AI agent: create a project, preview it, render when it's
> valid. Get a key over REST, then drive everything through the authenticated MCP action
> server. No human, no browser.

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

## Step 3 — The editing loop (projects, preview, render)

FrameLane is a closed loop: create a project, apply targeted edits, validate them for free,
preview cheaply, and render only once the composition is valid. You never resend the whole
timeline to change one thing.

1. Read the `framelane://capabilities` resource to build a correct composition the first time.
2. `create_project` (from a RenderRequest, or empty) returns a project with a `version`.
3. `edit_project` applies atomic ops addressed by element id (shift, trim, swap_source,
   set_fields, add/remove, caption and transition ops). Pass `if_version` for optimistic
   concurrency. Every response carries `violations`, so you catch problems before spending.
4. `preview_project` returns a cheap, faithful preview: a frame, a window, or a
   composition-aware contact sheet. Pass `dry_run: true` for free validation only. Preview
   runs the same engine as the final render, so what you preview is what renders.
5. `render_project` bills only the final, valid render. Poll with `get_render` /
   `wait_for_render`, then `get_render_download` for a signed URL.

One-shot escape hatch: if you already have a complete timeline and don't need to iterate,
`create_render` (a JSON timeline of elements) renders it in a single call, then
`wait_for_render` and `get_render_download`.

AI tasks: `run_task` with `task_type` = `remove_background` | `gaze_redirect` |
`super_resolution` | `transcribe`, then `wait_for_task` / `get_task_download`.

## Conventions

- **Remote media:** set `ingest_external: true` and pass a public `source_url`; FrameLane
  copies it server-side — no separate upload.
- **Iterate for free, pay once:** edits and validation cost nothing and previews are cheap;
  you're billed only for the final render. `preview_project` (or `create_preview`) with
  `dry_run: true` returns violations before you spend.
- **Errors** are `{"error": {"code", "message", "details"}}` — branch on `code`
  (`quota_exceeded`, `email_not_verified`, `conflict`, `invalid_request`, `not_found`).
- **Free tier:** renders are metered per minute (edits, validation, and previews are free);
  over-cap → `402 quota_exceeded`.

## More

- Concise index: https://framelane.io/llms.txt
- Full docs: https://docs.framelane.io/ (append `.md` to any page for raw markdown)
- Capabilities (no auth): https://api.framelane.io/v1/capabilities
- MCP overview: https://docs.framelane.io/mcp/overview
