"use client";

import { useActionState } from "react";
import { createApiKey } from "./actions";
import { useState } from "react";

const initialState = { key: null, name: "", error: null };

export function CreateKeyForm() {
  const [state, formAction, isPending] = useActionState(createApiKey, initialState);
  const [copied, setCopied] = useState(false);

  function copy(key: string) {
    navigator.clipboard.writeText(key).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      {/* New key revealed after creation */}
      {state.key && (
        <div
          style={{
            marginBottom: 24,
            padding: "20px 24px",
            background: "rgba(123,224,170,0.06)",
            border: "1px solid rgba(123,224,170,0.2)",
            borderRadius: 6,
          }}
        >
          <div className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--green)", marginBottom: 10 }}>
            New key created — save it now
          </div>
          <p style={{ fontSize: 13, color: "var(--fg-2)", marginBottom: 14, lineHeight: 1.5 }}>
            <strong style={{ color: "var(--fg)" }}>{state.name}</strong> — this key is shown only once.
          </p>
          <div style={{ display: "flex", gap: 10, alignItems: "center", background: "rgba(0,0,0,0.3)", border: "1px solid var(--line-strong)", borderRadius: 4, padding: "10px 14px" }}>
            <code className="mono" style={{ flex: 1, fontSize: 13, wordBreak: "break-all" }}>
              {state.key}
            </code>
            <button
              onClick={() => copy(state.key!)}
              style={{
                flexShrink: 0,
                padding: "6px 12px",
                background: copied ? "rgba(123,224,170,0.15)" : "rgba(255,255,255,0.06)",
                border: "1px solid var(--line-strong)",
                borderRadius: 3,
                fontSize: 12,
                color: copied ? "var(--green)" : "var(--fg-2)",
                cursor: "pointer",
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      <form
        action={formAction}
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: 1 }}>
          <label
            htmlFor="key-name"
            className="mono"
            style={{ display: "block", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-dim)", marginBottom: 8 }}
          >
            Key name
          </label>
          <input
            id="key-name"
            name="name"
            placeholder="e.g. Production server"
            required
            style={{
              width: "100%",
              height: 40,
              padding: "0 12px",
              background: "var(--bg-elev)",
              border: "1px solid var(--line-strong)",
              borderRadius: 4,
              color: "var(--fg)",
              fontSize: 13,
              outline: "none",
              fontFamily: "inherit",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--orange)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--line-strong)"; }}
          />
          {state.error && (
            <p style={{ fontSize: 12, color: "var(--red)", marginTop: 6 }}>{state.error}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary btn-sm"
          style={{ flexShrink: 0 }}
        >
          {isPending ? "Creating…" : "Create key"}
        </button>
      </form>
    </div>
  );
}
