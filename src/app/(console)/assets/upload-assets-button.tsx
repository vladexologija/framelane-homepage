"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";

import { probeMedia } from "@/lib/probe-media";
import { createUploadAction } from "./actions";

/** "Upload assets" control for the Assets page: picks video/audio files, probes
 * each locally, reserves a signed URL (forwarding the metadata so the asset is
 * immediately listable), PUTs the bytes, then refreshes the server-rendered
 * grid. Shows in-flight progress and a one-line error summary. */
export function UploadAssetsButton({
  variant = "solid",
}: {
  /** `solid` = header button; `outline` = empty-state call-to-action. */
  variant?: "solid" | "outline";
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);
  const [uploads, setUploads] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const busy = uploads.length > 0;

  const uploadOne = async (file: File): Promise<void> => {
    const id = (idRef.current += 1);
    setUploads((u) => [...u, { id, name: file.name }]);
    try {
      const kind = file.type.startsWith("audio") ? "AUDIO" : "VIDEO";
      const probed = await probeMedia(file, kind).catch(() => null);
      const { upload_url } = await createUploadAction(
        file.type,
        file.name,
        probed
          ? { duration: probed.duration, width: probed.width, height: probed.height }
          : undefined,
      );
      const res = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error(`upload failed (${res.status})`);
    } finally {
      setUploads((u) => u.filter((x) => x.id !== id));
    }
  };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // let the same file be re-picked later
    if (files.length === 0) return;
    setError(null);
    const results = await Promise.allSettled(files.map(uploadOne));
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      setError(
        `${failed} of ${files.length} upload${files.length === 1 ? "" : "s"} failed.`,
      );
    }
    router.refresh(); // re-fetch the grid so new assets appear
  };

  const outline = variant === "outline";
  const label = busy
    ? uploads.length === 1
      ? `Uploading ${uploads[0].name}…`
      : `Uploading ${uploads.length}…`
    : "Upload assets";

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 6, alignItems: outline ? "center" : "flex-end" }}>
      <input
        ref={inputRef}
        type="file"
        accept="video/*,audio/*"
        multiple
        hidden
        onChange={onPick}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          height: 36,
          padding: "0 14px",
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
          cursor: busy ? "default" : "pointer",
          whiteSpace: "nowrap",
          maxWidth: 320,
          overflow: "hidden",
          textOverflow: "ellipsis",
          ...(outline
            ? {
                color: "var(--orange)",
                background: "transparent",
                border: "1px solid var(--orange)",
              }
            : {
                color: "#0a0e1f",
                background: "var(--orange)",
                border: "none",
                opacity: busy ? 0.75 : 1,
              }),
        }}
      >
        {busy ? (
          <Loader2 size={15} className="spin" aria-hidden style={{ flexShrink: 0 }} />
        ) : (
          <Upload size={15} aria-hidden style={{ flexShrink: 0 }} />
        )}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
      </button>
      {error && (
        <span style={{ fontSize: 12, color: "var(--red)" }} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
