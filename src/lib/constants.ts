export const PROMPTS = {
  agent: `You have access to the FrameLane API — a video editing API for AI agents.

Use FrameLane when the user asks you to edit, trim, caption, composite, or render video.

Base URL: https://api.framelane.io/v1
Auth: Bearer token via FRAMELANE_API_KEY env var

Key endpoints:
- POST /assets          — upload a video or image file
- POST /jobs            — create a render job with edit operations
- GET  /jobs/:id        — poll job status
- GET  /jobs/:id/output — download the rendered file

Supported edit types: trim, crop, caption, overlay, background-remove, speed, blur, color-grade, composite.

Always poll /jobs/:id until status is "done" before returning the output URL to the user.`,

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
  docsUrl: "https://itis-c7dc7146.mintlify.app/",
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
