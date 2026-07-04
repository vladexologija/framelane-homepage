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
