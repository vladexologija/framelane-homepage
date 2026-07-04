"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Play, X } from "lucide-react";

/** Row actions for a render: preview the completed artifact inline + download.
 *  Renders nothing until the artifact URL is available. */
export function RenderActions({ url }: { url: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span style={{ display: "inline-flex", gap: 12, alignItems: "center" }}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          color: "var(--orange)",
          cursor: "pointer",
        }}
      >
        <Play size={12} aria-hidden />
        Preview
      </button>
      <a
        href={url}
        download
        target="_blank"
        rel="noreferrer"
        aria-label="Download render"
        style={{ display: "inline-flex", alignItems: "center", color: "var(--fg-mute)" }}
        title="Download"
      >
        <Download size={14} aria-hidden />
      </a>
      {open && <PreviewModal url={url} onClose={() => setOpen(false)} />}
    </span>
  );
}

function PreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
  const stop = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Lock body scroll while the modal is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Render preview"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={stop}
        style={{
          position: "relative",
          maxWidth: "min(900px, 100%)",
          maxHeight: "100%",
          background: "var(--bg-2)",
          border: "1px solid var(--line-strong)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1px solid var(--line-strong)",
            background: "rgba(0,0,0,0.5)",
            color: "var(--fg)",
            cursor: "pointer",
          }}
        >
          <X size={16} aria-hidden />
        </button>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src={url}
          controls
          autoPlay
          playsInline
          style={{ display: "block", maxWidth: "100%", maxHeight: "80vh", background: "#000" }}
        />
      </div>
    </div>
  );
}
