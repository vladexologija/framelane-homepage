import Link from "next/link";
import { PlayCircle } from "lucide-react";

const QUICKSTART_URL = "https://docs.framelane.io/introduction/quickstart";
// Walkthrough video — paste the Loom embed URL (https://www.loom.com/embed/…)
// here once recorded; until then a placeholder card is shown. Shared by the
// Renders page and the Dashboard's empty state.
const LOOM_EMBED_URL: string | null = null;

/** Empty state shown on Renders (and Dashboard) when the workspace has no
 * renders: a prompt to start, the quickstart link, and a walkthrough video. */
export function NoRenders() {
  return (
    <div className="card" style={{ padding: "48px", textAlign: "center" }}>
      <p
        style={{
          color: "var(--fg)",
          fontSize: 16,
          fontWeight: 500,
          marginBottom: 16,
        }}
      >
        No renders yet.
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          marginBottom: 28,
          fontSize: 13,
        }}
      >
        <Link href="/projects" style={{ color: "var(--orange)" }}>
          Create a project →
        </Link>
        <a
          href={QUICKSTART_URL}
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--orange)" }}
        >
          Read the quickstart →
        </a>
      </div>

      {/* Walkthrough video (Loom). Placeholder until LOOM_EMBED_URL is set. */}
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div
          style={{
            position: "relative",
            paddingBottom: "56.25%",
            height: 0,
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid var(--line)",
            background: "var(--bg-elev)",
          }}
        >
          {LOOM_EMBED_URL ? (
            <iframe
              src={LOOM_EMBED_URL}
              title="FrameLane walkthrough"
              allowFullScreen
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <PlayCircle size={44} style={{ color: "var(--orange)" }} />
              <span style={{ fontSize: 13, color: "var(--fg-mute)" }}>
                Walkthrough video — coming soon
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
