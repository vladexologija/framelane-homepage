import type { CompCell, ComparisonRow } from "@/lib/comparison-data";

function Check({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      <path
        d="M2 6 L5 9 L10 3"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Dash() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      <line
        x1="3"
        y1="6"
        x2="9"
        y2="6"
        stroke="var(--fg-dim)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Tilde() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      <path
        d="M2 6 Q4 4 6 6 T10 6"
        stroke="var(--fg-mute)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Cell({ value, highlight }: { value: CompCell; highlight: boolean }) {
  const [status, note] = value;
  const icons: Record<string, React.ReactNode> = {
    yes: <Check color="var(--green)" />,
    no: <Dash />,
    limited: <Tilde />,
    varies: <Tilde />,
    "n/a": null,
  };

  return (
    <div
      style={{
        padding: "14px 18px",
        borderLeft: "1px solid var(--line)",
        background: highlight ? "rgba(255,122,26,0.03)" : "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {icons[status]}
        <span
          className="mono"
          style={{
            fontSize: 11,
            color:
              status === "yes"
                ? "var(--green)"
                : status === "no"
                  ? "var(--fg-dim)"
                  : status === "n/a"
                    ? "var(--fg-mute)"
                    : "var(--fg-mute)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {status === "yes"
            ? "Yes"
            : status === "no"
              ? "No"
              : status === "n/a"
                ? "N/A"
                : status}
        </span>
      </div>
      {note && (
        <span style={{ fontSize: 11, color: "var(--fg-mute)", lineHeight: 1.3 }}>
          {note}
        </span>
      )}
    </div>
  );
}

/**
 * Presentational capability table. Renders FrameLane (highlighted) plus one or
 * more competitor columns. Used by the homepage <Comparisons> section (4 cols)
 * and the dedicated /compare/<competitor> pages (2 cols).
 */
export function ComparisonTable({
  cols,
  rows,
}: {
  cols: readonly string[];
  rows: ComparisonRow[];
}) {
  const gridTemplateColumns = `minmax(0, 1.7fr) repeat(${cols.length}, minmax(0, 1fr))`;

  return (
    <div className="comp-table-wrap">
      <div
        className="comp-table-inner"
        style={{
          border: "1px solid var(--line)",
          borderRadius: 8,
          overflow: "hidden",
          background: "var(--bg-2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns,
            borderBottom: "1px solid var(--line-strong)",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              fontSize: 11,
              fontFamily: "var(--font-geist-mono), monospace",
              color: "var(--fg-dim)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Capability
          </div>
          {cols.map((c, i) => (
            <div
              key={c}
              style={{
                padding: "18px 18px",
                textAlign: "center",
                fontSize: 13,
                fontWeight: 500,
                background: i === 0 ? "rgba(255,122,26,0.04)" : "transparent",
                color: i === 0 ? "var(--orange)" : "var(--fg-2)",
                borderLeft: "1px solid var(--line)",
                letterSpacing: "-0.005em",
              }}
            >
              {c}
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.map((row, ri) => (
          <div
            key={row.capability}
            style={{
              display: "grid",
              gridTemplateColumns,
              borderBottom:
                ri < rows.length - 1 ? "1px solid var(--line)" : "none",
            }}
          >
            <div
              style={{
                padding: "16px 24px",
                fontSize: 14,
                color: "var(--fg)",
                letterSpacing: "-0.005em",
              }}
            >
              {row.capability}
            </div>
            {row.cells.map((cell, ci) => (
              <Cell key={ci} value={cell} highlight={ci === 0} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
