"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import type { FrameTakeEditorProps } from "@/lib/editor-types";
import "../../vendor/frametake-editor/style.css";

// The editor ships as a vendored prebuilt ES module (scripts/sync-editor.sh copies
// frametake-frontend/dist-embed → vendor/) with no bundled types, so the loaded
// component is cast to the host's contract (@/lib/editor-types). It's client-only:
// WebGPU/canvas, Redux, and `window` all require it.
const FrameTakeEditor = dynamic(
  async () => {
    const m = await import("../../vendor/frametake-editor/index.js");
    return m.FrameTakeEditor as unknown as ComponentType<FrameTakeEditorProps>;
  },
  { ssr: false },
);

export function FrametakeEditorClient(props: FrameTakeEditorProps) {
  return <FrameTakeEditor renderer="wasm-gpu" {...props} />;
}
