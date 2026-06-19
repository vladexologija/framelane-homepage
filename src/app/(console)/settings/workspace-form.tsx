"use client";

import { useActionState } from "react";
import { updateWorkspaceName, deleteWorkspace } from "./actions";
import { useState } from "react";

const initialUpdateState = { success: false, error: null };

export function WorkspaceNameForm({ currentName }: { currentName: string }) {
  const [state, formAction, isPending] = useActionState(
    updateWorkspaceName,
    initialUpdateState
  );

  return (
    <form action={formAction} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
      <div style={{ flex: 1 }}>
        <label
          htmlFor="workspace-name"
          className="mono"
          style={{
            display: "block",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
            marginBottom: 8,
          }}
        >
          Workspace name
        </label>
        <input
          id="workspace-name"
          name="name"
          defaultValue={currentName}
          required
          minLength={2}
          maxLength={64}
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
        {state.success && (
          <p style={{ fontSize: 12, color: "var(--green)", marginTop: 6 }}>Name updated.</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="btn btn-ghost btn-sm"
        style={{ flexShrink: 0 }}
      >
        {isPending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

export function DeleteWorkspaceForm() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--fg-2)", marginBottom: 16, lineHeight: 1.5 }}>
        Permanently deletes your workspace, all API keys, and renders.
        This cannot be undone.
      </p>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 13,
          color: "var(--fg-2)",
          cursor: "pointer",
          marginBottom: 16,
          userSelect: "none",
        }}
      >
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          style={{ width: 14, height: 14, accentColor: "var(--red)" }}
        />
        I understand this is permanent and cannot be undone.
      </label>
      <form action={deleteWorkspace}>
        <button
          type="submit"
          disabled={!confirmed}
          style={{
            padding: "8px 16px",
            background: confirmed ? "rgba(255,107,107,0.12)" : "transparent",
            border: `1px solid ${confirmed ? "rgba(255,107,107,0.4)" : "var(--line)"}`,
            borderRadius: 4,
            fontSize: 13,
            color: confirmed ? "var(--red)" : "var(--fg-dim)",
            cursor: confirmed ? "pointer" : "not-allowed",
            transition: "all 0.15s",
          }}
        >
          Delete workspace
        </button>
      </form>
    </div>
  );
}
