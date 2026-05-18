export const SITE = {
  name: "FrameLane",
  tagline: "Video Editing API for AI Agents",
  description:
    "FrameLane gives AI agents their own video production pipeline. Ingest assets, define edits, render at scale — all via API.",
  docsUrl: "https://docs.framelane.dev",
  consoleUrl: "https://console.framelane.dev",
  githubUrl: "https://github.com/framelane",
  discordUrl: "https://discord.gg/framelane",
} as const;

export const NAV_LINKS = [
  { label: "Docs", href: SITE.docsUrl },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
] as const;
