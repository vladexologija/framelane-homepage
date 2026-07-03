"use client";

import dynamic from "next/dynamic";

// CodeMirror touches `window`/DOM at module load, so load it client-only (the
// same discipline as frametake-editor-client.tsx).
export const JsonEditor = dynamic(() => import("./json-editor-impl"), {
  ssr: false,
  loading: () => (
    <div
      className="mono"
      style={{ padding: 14, fontSize: 12, color: "var(--fg-dim)", flex: 1, minHeight: 0 }}
    >
      Loading editor…
    </div>
  ),
});
