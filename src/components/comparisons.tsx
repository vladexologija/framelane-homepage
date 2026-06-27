import {
  COMPARISON_COLS,
  COMPARISON_ROWS,
  REMOTION_OBJECTIONS,
} from "@/lib/comparison-data";
import { ComparisonTable } from "@/components/comparison-table";

export function Comparisons() {
  return (
    <section>
      <div className="section-tag">
        <span className="num-marker">03 / WHY FRAMELANE</span>
      </div>
      <div className="wrap">
        <div
          className="two-col-grid"
          style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)", marginBottom: 56 }}
        >
          <h2>
            Built for real video,
            <br />
            <span className="serif-i" style={{ color: "var(--orange-hi)" }}>
              not just motion graphics.
            </span>
          </h2>
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
            {REMOTION_OBJECTIONS.map(({ tag, title, quote, counter }) => (
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
                  <span style={{ color: "var(--orange)", fontSize: 11 }}>
                    ↗
                  </span>
                  {counter}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <ComparisonTable cols={COMPARISON_COLS} rows={COMPARISON_ROWS} />
      </div>
    </section>
  );
}
