import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FrameLane — Closed Beta",
  description:
    "FrameLane is currently in closed beta. Request early access to the video editing API for AI agents.",
};

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 11V7a4 4 0 0 1 8 0v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3 8l9 6 9-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const steps = [
  {
    num: "01",
    text: "How you heard about FrameLane",
  },
  {
    num: "02",
    text: "What you're building or planning to build",
  },
  {
    num: "03",
    text: "We'll send your API key + schedule a guided intro",
  },
];

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px var(--gutter) 120px",
        position: "relative",
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 500,
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255, 122, 26, 0.13) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >


        {/* Badge */}
        <div
          className="pill"
          style={{
            marginBottom: 28,
            borderColor: "rgba(255, 122, 26, 0.35)",
            color: "var(--orange-hi)",
            gap: 8,
          }}
        >
          <LockIcon />
          <span>Closed Beta</span>
        </div>

        {/* Heading */}
        <h2
          style={{
            fontSize: "clamp(28px, 5vw, 42px)",
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            textAlign: "center",
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          We&apos;re not open{" "}
          <span className="serif-i" style={{ color: "var(--fg-2)" }}>
            yet
          </span>
        </h2>

        {/* Subtext */}
        <p
          style={{
            fontSize: 16,
            color: "var(--fg-mute)",
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: 380,
            marginBottom: 48,
          }}
        >
          FrameLane is in closed beta. Drop us an email and we&apos;ll get you
          set up — usually within a day.
        </p>

        {/* Card */}
        <div
          className="card"
          style={{
            width: "100%",
            padding: "32px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Steps */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: 0 }}
          >
            {steps.map((step, i) => (
              <div
                key={step.num}
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  paddingBottom: i < steps.length - 1 ? 20 : 0,
                  paddingTop: i > 0 ? 20 : 0,
                  borderTop:
                    i > 0 ? "1px solid var(--line)" : "none",
                }}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--orange)",
                    letterSpacing: "0.1em",
                    minWidth: 24,
                    paddingTop: 2,
                  }}
                >
                  {step.num}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: "var(--fg-2)",
                    lineHeight: 1.5,
                  }}
                >
                  {step.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href="mailto:hello@framelane.io?subject=FrameLane%20Beta%20Access&body=Hi%20FrameLane%20team%2C%0A%0AHow%20I%20heard%20about%20FrameLane%3A%0A%0AWhat%20I%27m%20planning%20to%20build%3A%0A"
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              gap: 10,
              height: 48,
              fontSize: 15,
            }}
          >
            <MailIcon />
            Email hello@framelane.io
            <ArrowIcon />
          </a>

          <p
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--fg-dim)",
              textAlign: "center",
              letterSpacing: "0.04em",
            }}
          >
            No form. Just a short email — we reply fast.
          </p>
        </div>

        {/* Back link */}
        <Link
          href="/"
          style={{
            marginTop: 32,
            fontSize: 13,
            color: "var(--fg-mute)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "color 0.15s ease",
          }}
        >
          ← Back to homepage
        </Link>
      </div>
    </div>
  );
}
