import Link from "next/link";
import { SITE } from "@/lib/constants";
import { comparisonFor } from "@/lib/comparison-data";
import type { LandingPageContent } from "@/lib/landing-pages";
import { ComparisonTable } from "@/components/comparison-table";
import { EngineDeepDive } from "@/components/engine-deep-dive";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbLd, softwareApplicationLd } from "@/lib/seo";

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        fontSize: 14,
        color: "var(--fg-2)",
        lineHeight: 1.45,
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        style={{ flexShrink: 0, marginTop: 4 }}
      >
        <path
          d="M2 6 L5 9 L10 3"
          stroke="var(--green)"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </li>
  );
}

function Ctas() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <a
        className="btn btn-primary"
        href={SITE.waitlistUrl}
        target="_blank"
        rel="noreferrer"
      >
        Request access →
      </a>
      <a className="btn btn-ghost" href={SITE.docsUrl}>
        View docs
      </a>
    </div>
  );
}

export function LandingPage({ content }: { content: LandingPageContent }) {
  const { cols, rows } = comparisonFor(content.competitor, content.tableCapabilities);

  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd(),
          breadcrumbLd(content.breadcrumb),
        ]}
      />

      {/* Breadcrumb bar */}
      <nav
        aria-label="Breadcrumb"
        style={{
          borderBottom: "1px solid var(--line)",
          padding: "10px var(--gutter)",
        }}
      >
        <ol
          className="mono"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            listStyle: "none",
            margin: 0,
            padding: 0,
            fontSize: 11,
            letterSpacing: "0.04em",
            color: "var(--fg-mute)",
          }}
        >
          {content.breadcrumb.map((b, i) => (
            <li key={b.path} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {i > 0 && <span style={{ color: "var(--fg-dim)" }}>/</span>}
              {i < content.breadcrumb.length - 1 ? (
                <Link href={b.path} style={{ color: "var(--fg-mute)" }}>
                  {b.name}
                </Link>
              ) : (
                <span style={{ color: "var(--orange)" }}>{b.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 72, paddingBottom: 48 }}>
        <div className="wrap">
          <div style={{ maxWidth: 760 }}>
            <span className="pill" style={{ marginBottom: 22 }}>
              <span className="dot" />
              {content.eyebrow}
            </span>
            <h1 style={{ marginTop: 18 }}>
              {content.h1}
              {content.h1Accent && (
                <>
                  {" "}
                  <span className="serif-i" style={{ color: "var(--orange-hi)" }}>
                    {content.h1Accent}
                  </span>
                </>
              )}
            </h1>
            <p className="lede" style={{ marginTop: 22, maxWidth: "60ch" }}>
              {content.lede}
            </p>
            <div style={{ marginTop: 30 }}>
              <Ctas />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          {content.benefits.map((b, i) => (
            <div
              key={i}
              style={{
                borderTop: "1px solid var(--line)",
                padding: "48px 0",
              }}
            >
              <div
                className="two-col-grid"
                style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.3fr)", gap: 48 }}
              >
                <div>
                  {b.eyebrow && (
                    <div className="num-marker" style={{ marginBottom: 16 }}>
                      {b.eyebrow}
                    </div>
                  )}
                  <h2 style={{ fontSize: "clamp(26px, 3vw, 40px)", lineHeight: 1.08 }}>
                    {b.heading}
                    {b.accent && (
                      <>
                        {" "}
                        <span
                          className="serif-i"
                          style={{ color: "var(--orange-hi)" }}
                        >
                          {b.accent}
                        </span>
                      </>
                    )}
                  </h2>
                </div>
                <div>
                  <p className="lede" style={{ maxWidth: "56ch" }}>
                    {b.body}
                  </p>
                  {b.bullets && (
                    <ul
                      style={{
                        listStyle: "none",
                        margin: "22px 0 0",
                        padding: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {b.bullets.map((bullet) => (
                        <Bullet key={bullet}>{bullet}</Bullet>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Competitor-specific, sourced limitations */}
      {content.issues && content.issues.items.length > 0 && (
        <section>
          <div className="section-tag">
            <span className="num-marker">THE GAPS</span>
          </div>
          <div className="wrap">
            <div
              className="two-col-grid"
              style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)" }}
            >
              <div>
                <h2>
                  {content.issues.heading}
                  <br />
                  <span className="serif-i" style={{ color: "var(--orange-hi)" }}>
                    {content.issues.accent}
                  </span>
                </h2>
                {content.issues.intro && (
                  <p
                    style={{
                      marginTop: 20,
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "var(--fg-mute)",
                      maxWidth: "40ch",
                    }}
                  >
                    {content.issues.intro}
                  </p>
                )}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                {content.issues.items.map(({ tag, title, quote, counter, source }) => (
                  <li
                    key={tag}
                    style={{
                      borderLeft: "1px solid var(--line-strong)",
                      paddingLeft: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        className="mono"
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "var(--orange)",
                          border: "1px solid rgba(255,122,26,0.3)",
                          borderRadius: 3,
                          padding: "1px 6px",
                        }}
                      >
                        {tag}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--fg)",
                          letterSpacing: "-0.005em",
                        }}
                      >
                        {title}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--fg-mute)",
                        lineHeight: 1.55,
                        fontStyle: "italic",
                        margin: 0,
                      }}
                    >
                      {quote}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--green)",
                        lineHeight: 1.45,
                        margin: 0,
                        display: "flex",
                        alignItems: "baseline",
                        gap: 6,
                      }}
                    >
                      <span style={{ color: "var(--orange)", fontSize: 11 }}>↗</span>
                      {counter}
                    </p>
                    {source && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer nofollow"
                        className="mono"
                        style={{
                          fontSize: 10.5,
                          color: "var(--fg-dim)",
                          letterSpacing: "0.02em",
                          marginTop: 2,
                        }}
                      >
                        Source: {source.label} ↗
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Comparison table */}
      <section>
        <div className="section-tag">
          <span className="num-marker">SIDE BY SIDE</span>
        </div>
        <div className="wrap">
          <div style={{ maxWidth: 720, marginBottom: 40 }}>
            <h2>
              FrameLane vs{" "}
              <span className="serif-i" style={{ color: "var(--orange-hi)" }}>
                {content.competitor}.
              </span>
            </h2>
            <p className="lede" style={{ marginTop: 20 }}>
              {content.comparisonIntro}
            </p>
          </div>
          <ComparisonTable cols={cols} rows={rows} />
        </div>
      </section>

      {/* How FrameLane renders, the Rust / wgpu / shader pipeline */}
      <EngineDeepDive />

      {/* CTA */}
      <section>
        <div className="wrap">
          <div
            className="card"
            style={{
              padding: "56px 48px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h2 style={{ maxWidth: "18ch" }}>
              {content.ctaHeading}
              {content.ctaAccent && (
                <>
                  {" "}
                  <span className="serif-i" style={{ color: "var(--orange-hi)" }}>
                    {content.ctaAccent}
                  </span>
                </>
              )}
            </h2>
            <p
              className="lede"
              style={{ marginTop: 18, marginBottom: 30, maxWidth: "48ch" }}
            >
              {content.ctaBody}
            </p>
            <Ctas />
          </div>
        </div>
      </section>
    </>
  );
}
