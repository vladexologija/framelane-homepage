"use client";

import { useState } from "react";

export function ApiKeyBanner() {
  // Lazy initializer reads sessionStorage once on mount (no effect needed)
  const [apiKey, setApiKey] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const key = sessionStorage.getItem("fl_pending_api_key");
    if (key) sessionStorage.removeItem("fl_pending_api_key");
    return key;
  });
  const [copied, setCopied] = useState(false);

  if (!apiKey) return null;

  function copy() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      style={{
        marginBottom: 32,
        padding: "20px 24px",
        background: "rgba(123, 224, 170, 0.06)",
        border: "1px solid rgba(123, 224, 170, 0.2)",
        borderRadius: 6,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--green)",
          }}
        />
        <span
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--green)",
          }}
        >
          Account created — save your API key
        </span>
      </div>
      <p
        style={{
          fontSize: 13,
          color: "var(--fg-2)",
          marginBottom: 16,
          lineHeight: 1.5,
        }}
      >
        This key is shown only once. Copy it now and store it somewhere safe.
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(0,0,0,0.3)",
          border: "1px solid var(--line-strong)",
          borderRadius: 4,
          padding: "10px 14px",
        }}
      >
        <code
          className="mono"
          style={{
            flex: 1,
            fontSize: 13,
            color: "var(--fg)",
            wordBreak: "break-all",
          }}
        >
          {apiKey}
        </code>
        <button
          onClick={copy}
          style={{
            flexShrink: 0,
            padding: "6px 12px",
            background: copied ? "rgba(123,224,170,0.15)" : "rgba(255,255,255,0.06)",
            border: "1px solid var(--line-strong)",
            borderRadius: 3,
            fontSize: 12,
            color: copied ? "var(--green)" : "var(--fg-2)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <button
        onClick={() => setApiKey(null)}
        style={{
          marginTop: 12,
          background: "none",
          border: "none",
          fontSize: 12,
          color: "var(--fg-dim)",
          cursor: "pointer",
          padding: 0,
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
