import Link from "next/link";
import { PROMPTS, SITE } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "For Agents — FrameLane",
  description:
    "FrameLane is built for autonomous agents: discover the API, provision your own key, render, and download — with no human, no browser, no dashboard.",
  path: "/agents",
  keywords: [
    "video API for AI agents",
    "agent self-signup",
    "autonomous video rendering",
    "MCP video API",
  ],
});

interface Step {
  n: string;
  title: string;
  body: string;
  code: string;
}

const STEPS: Step[] = [
  {
    n: "01",
    title: "Discover",
    body: "GET /v1/capabilities — no auth. Learn the surface, formats, and limits, plus an onboarding block describing these exact steps in machine-readable form.",
    code: "curl https://api.framelane.io/v1/capabilities",
  },
  {
    n: "02",
    title: "Sign up",
    body: "POST /v1/signup returns an fl_ key immediately and emails a 6-digit code. The key is inert until you verify — knowing an email alone never yields a working key.",
    code: `curl -X POST https://api.framelane.io/v1/signup \\
  -d '{"workspace_name":"my-agent","email":"agent@example.com"}'`,
  },
  {
    n: "03",
    title: "Verify",
    body: "Read the code from the inbox you signed up with (a programmatic inbox makes this hands-free), then confirm it. The key works the moment this returns 200.",
    code: `curl -X POST https://api.framelane.io/v1/signup/verify \\
  -d '{"email":"agent@example.com","otp_code":"123456"}'`,
  },
  {
    n: "04",
    title: "Render & wait",
    body: "Send the fl_ key as a Bearer token and submit a JSON timeline. Then wait with GET /v1/renders/{id}?wait=25 — one blocking call, not a poll loop — and download the artifact.",
    code: `curl -X POST https://api.framelane.io/v1/renders \\
  -H "Authorization: Bearer $FRAMELANE_API_KEY" \\
  -H "Content-Type: application/json" -d '{ "width": 1920, ... }'`,
  },
];

interface Entry {
  label: string;
  body: string;
  href: string;
  soon?: boolean;
}

const ENTRY_POINTS: Entry[] = [
  {
    label: "llms.txt",
    body: "A machine-readable index of the API and the self-provisioning loop.",
    href: "/llms.txt",
  },
  {
    label: "GET /v1/capabilities",
    body: "The unauthenticated capability catalog with the onboarding steps.",
    href: `${SITE.docsUrl}introduction/self-provisioning`,
  },
  {
    label: "OpenAPI",
    body: "The full spec at api.framelane.io/openapi.json — generate a client in any language.",
    href: `${SITE.docsUrl}api-reference/introduction`,
  },
  {
    label: "MCP server",
    body: "A hosted MCP server at docs.framelane.io/mcp — every endpoint as a tool. Connect Claude, Cursor, or any MCP host.",
    href: `${SITE.docsUrl}mcp/overview`,
  },
];

const codePanel = {
  border: "1px solid var(--line)",
  borderRadius: 6,
  background: "var(--bg-elev)",
  padding: "14px 16px",
  fontSize: 12.5,
  lineHeight: 1.7,
  color: "var(--fg-2)",
  overflow: "auto" as const,
  margin: 0,
  whiteSpace: "pre" as const,
};

export default function AgentsPage() {
  return (
    <>
      {/* Page header tag */}
      <div
        style={{
          borderBottom: "1px solid var(--line)",
          padding: "10px var(--gutter)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{ width: 24, height: 1, background: "var(--orange)", display: "inline-block" }}
        />
        <span className="num-marker">FOR AGENTS</span>
      </div>

      {/* Hero */}
      <section style={{ paddingTop: 80, paddingBottom: 72 }}>
        <div className="wrap">
          <div style={{ maxWidth: 720 }}>
            <div className="eyebrow" style={{ color: "var(--orange)", marginBottom: 18 }}>
              Built for autonomous agents
            </div>
            <h1
              style={{
                fontSize: "clamp(40px, 5.5vw, 72px)",
                lineHeight: 0.96,
                letterSpacing: "-0.035em",
                fontWeight: 500,
              }}
            >
              Your agent signs
              <br />
              <span className="serif-i" style={{ color: "var(--orange-hi)" }}>
                itself up.
              </span>
            </h1>
            <p className="lede" style={{ marginTop: 22, maxWidth: "52ch" }}>
              No developer in the loop. An agent that finds FrameLane can discover the API,
              provision its own key, render, and download — with no human, no browser, and no
              dashboard. The whole flow is unauthenticated up to the point it holds a verified key.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <a className="btn btn-primary" href={SITE.consoleUrl}>
                Start for free →
              </a>
              <a
                className="btn btn-ghost"
                href={`${SITE.docsUrl}introduction/self-provisioning`}
              >
                Self-provisioning docs
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* The loop */}
      <section style={{ paddingBottom: 80 }}>
        <div className="wrap">
          <div className="section-tag" style={{ marginBottom: 36 }}>
            <span className="num-marker">THE LOOP · ZERO HUMAN</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 0,
              border: "1px solid var(--line)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {STEPS.map((s) => (
              <div
                key={s.n}
                style={{
                  padding: "32px 30px",
                  borderRight: "1px solid var(--line)",
                  borderBottom: "1px solid var(--line)",
                  background: "var(--bg-2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <span className="mono" style={{ fontSize: 12, color: "var(--orange)" }}>
                    {s.n}
                  </span>
                  <span
                    style={{ fontSize: 19, letterSpacing: "-0.02em", color: "var(--fg)" }}
                  >
                    {s.title}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: "var(--fg-2)", lineHeight: 1.55, margin: 0 }}>
                  {s.body}
                </p>
                <pre className="mono" style={{ ...codePanel, fontSize: 11.5, marginTop: "auto" }}>
                  {s.code}
                </pre>
              </div>
            ))}
          </div>
          <p className="mono" style={{ marginTop: 20, fontSize: 12, color: "var(--fg-dim)" }}>
            The one thing an agent needs is a readable inbox for the OTP — the AgentMail pattern.
            Until you verify, authed calls return <span style={{ color: "var(--orange)" }}>403 email_not_verified</span>.
          </p>
        </div>
      </section>

      {/* Discover it however you arrive */}
      <section style={{ paddingBottom: 80 }}>
        <div className="wrap">
          <div style={{ maxWidth: 620, marginBottom: 40 }}>
            <h2>
              Discover it
              <br />
              <span className="serif-i" style={{ color: "var(--fg-2)" }}>
                however you arrive.
              </span>
            </h2>
            <p style={{ color: "var(--fg-2)", fontSize: 15, lineHeight: 1.6, marginTop: 18 }}>
              Whichever door an agent enters, it converges on the same self-serve loop.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {ENTRY_POINTS.map((e) => (
              <a
                key={e.label}
                href={e.href}
                className="card"
                style={{
                  display: "block",
                  padding: "22px 22px",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  background: "var(--bg-2)",
                  textDecoration: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span className="mono" style={{ fontSize: 13, color: "var(--fg)" }}>
                    {e.label}
                  </span>
                  {e.soon && (
                    <span
                      className="mono"
                      style={{
                        fontSize: 9,
                        letterSpacing: "0.06em",
                        padding: "2px 5px",
                        borderRadius: 3,
                        background: "var(--bg-elev)",
                        color: "var(--fg-dim)",
                        border: "1px solid var(--line)",
                        textTransform: "uppercase",
                      }}
                    >
                      soon
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13.5, color: "var(--fg-2)", lineHeight: 1.5, margin: 0 }}>
                  {e.body}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Drop-in agent prompt */}
      <section style={{ paddingBottom: 100 }}>
        <div className="wrap">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 0.8fr) minmax(0, 1.2fr)",
              gap: 48,
              alignItems: "start",
            }}
            className="two-col-grid"
          >
            <div>
              <div className="section-tag" style={{ marginBottom: 22 }}>
                <span className="num-marker">DROP-IN PROMPT</span>
              </div>
              <h2>
                Hand it to
                <br />
                <span className="serif-i" style={{ color: "var(--orange-hi)" }}>
                  your agent.
                </span>
              </h2>
              <p style={{ color: "var(--fg-2)", fontSize: 15, lineHeight: 1.6, marginTop: 18, maxWidth: "38ch" }}>
                Paste this into your agent&apos;s system prompt and it can render video on demand —
                including provisioning its own key.
              </p>
              <a
                className="btn btn-ghost"
                href={SITE.docsUrl}
                style={{ marginTop: 24 }}
              >
                Read the docs →
              </a>
            </div>
            <pre style={{ ...codePanel, padding: "22px 24px", maxHeight: 460 }} className="mono">
              {PROMPTS.agent}
            </pre>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section
        style={{ borderTop: "1px solid var(--line)", paddingTop: 72, paddingBottom: 96 }}
      >
        <div className="wrap" style={{ textAlign: "center" }}>
          <h2 style={{ marginBottom: 16 }}>
            Give your agent a{" "}
            <span className="serif-i" style={{ color: "var(--orange-hi)" }}>
              video editor.
            </span>
          </h2>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
            <Link className="btn btn-primary" href={SITE.consoleUrl}>
              Start for free →
            </Link>
            <a className="btn btn-ghost" href={SITE.docsUrl}>
              Read the docs
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
