"use client";

import { useState } from "react";

type FaqItemData = { q: string; a: string };

function FaqItem({
  item,
  idx,
  open,
  onToggle,
}: {
  item: FaqItemData;
  idx: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ borderBottom: "1px solid var(--line)" }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%",
          padding: "22px 0",
          display: "flex",
          alignItems: "center",
          gap: 20,
          textAlign: "left",
        }}
      >
        <span
          className="mono"
          style={{ fontSize: 11, color: "var(--fg-dim)", minWidth: 24 }}
        >
          {String(idx + 1).padStart(2, "0")}
        </span>
        <span
          style={{
            flex: 1,
            fontSize: 17,
            color: "var(--fg)",
            letterSpacing: "-0.01em",
          }}
        >
          {item.q}
        </span>
        <span
          style={{
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: open ? "var(--orange)" : "var(--fg-mute)",
            transition: "all 0.2s",
            transform: open ? "rotate(45deg)" : "rotate(0)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14">
            <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.5" />
            <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? 320 : 0,
          overflow: "hidden",
          transition: "max-height 0.32s ease",
        }}
      >
        <div
          style={{
            paddingLeft: 44,
            paddingBottom: 22,
            color: "var(--fg-2)",
            fontSize: 15,
            lineHeight: 1.65,
            maxWidth: "64ch",
          }}
        >
          {item.a}
        </div>
      </div>
    </div>
  );
}

/** Generic, data-driven FAQ accordion. The first item starts open. */
export function FaqAccordion({ items }: { items: FaqItemData[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div style={{ borderTop: "1px solid var(--line)" }}>
      {items.map((item, i) => (
        <FaqItem
          key={i}
          item={item}
          idx={i}
          open={open === i}
          onToggle={() => setOpen(open === i ? -1 : i)}
        />
      ))}
    </div>
  );
}
