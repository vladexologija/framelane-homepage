import posthog from "posthog-js";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

// No key (local dev / preview / CI) → no-op. No init, no junk events.
if (posthogKey) {
  try {
    posthog.init(posthogKey, {
      // Reverse proxy via /ingest (rewrites in next.config.ts). Override via env.
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "/ingest",
      // PostHog app UI host (US) — needed for the toolbar when api_host is relative.
      ui_host: "https://us.posthog.com",
      // SPA-aware auto pageview + pageleave capture for the App Router.
      defaults: "2025-05-24",
      // Session replay OFF at launch — console surfaces show secrets.
      disable_session_recording: true,
    });
  } catch {
    // Never let analytics setup break the app.
  }
}
