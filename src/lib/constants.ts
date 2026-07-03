export const PROMPTS = {
  agent: `You have access to the FrameLane API — a video editing and rendering API for AI agents.

Use FrameLane when the user asks you to edit, trim, caption, composite, or render video.

Base URL: https://api.framelane.io/v1

Get a key with no human: POST /v1/signup {workspace_name, email} returns an fl_ key and emails a 6-digit code; read it from that inbox and POST /v1/signup/verify {email, otp_code}. The key is inert until verified (403 email_not_verified).

Key endpoints:
- GET  /v1/capabilities   — discover effects, formats, and limits (no auth)
- POST /v1/renders        — submit a render (a JSON timeline of elements)
- GET  /v1/renders/:id    — poll status; then GET /v1/renders/:id/download
- POST /v1/tasks/{transcribe,remove-background,super-resolution,gaze-redirect}
- POST /v1/preview        — free dry_run validation before you spend

Bring remote media by setting ingest_external: true and passing a public source_url.
Always poll /v1/renders/:id until status is "completed" before returning the output URL.`,

  mcp: `{
  "mcpServers": {
    "framelane": {
      "command": "npx",
      "args": ["-y", "@framelane/mcp-server"],
      "env": {
        "FRAMELANE_API_KEY": "<your-api-key>"
      }
    }
  }
}`,

  npm: `npm install framelane

# Then in your code:
import { FrameLane } from "framelane";
const client = new FrameLane({ apiKey: process.env.FRAMELANE_API_KEY });`,
} as const;

export type PromptMode = keyof typeof PROMPTS;

export const SITE = {
  name: "FrameLane",
  tagline: "Give your AI agent a video editor",
  description:
    "FrameLane lets agents turn raw footage into finished videos. Create edit plans, preview frames, and render production-ready output through API or MCP.",
  docsUrl: "https://docs.framelane.io/",
  statusUrl: "https://framelane.betteruptime.com/",
  consoleUrl: process.env.NEXT_PUBLIC_CONSOLE_URL ?? "/signup",
  waitlistUrl: process.env.NEXT_PUBLIC_WAITLIST_URL ?? "#",
  githubUrl: "https://github.com/ITIShq",
  discordUrl: "https://discord.gg/framelane",
} as const;

export const NAV_LINKS = [
  { label: "Docs", href: SITE.docsUrl },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
] as const;
