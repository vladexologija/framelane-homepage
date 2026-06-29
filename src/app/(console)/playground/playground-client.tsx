"use client";

import { useMemo, useState, useTransition } from "react";
import { Captions, Check, Copy, Eraser, Eye, Play, Shapes, Sparkles } from "lucide-react";
import type { Scene } from "@frametake/scene-schema";

import { FrametakeEditorClient } from "@/components/frametake-editor-client";
import { DEFAULT_SCENE } from "./default-scene";
import type { EditorAsset, FrameTakeTheme } from "@/lib/editor-types";
import {
  sceneToRenderRequest,
  type RenderRequest,
} from "@/lib/sceneToRenderRequest";
import { createRenderAction, createUploadAction } from "./actions";

// The console's design tokens handed straight to the editor's public theme API —
// no CSS file, no internal token names, no import-order tricks.
const CONSOLE_THEME: FrameTakeTheme = {
  background: "var(--bg)",
  surface: "var(--bg-2)",
  surfaceElevated: "var(--bg-elev)",
  surfaceRaised: "var(--bg-elev-2)",
  text: "var(--fg)",
  textMuted: "var(--fg-2)",
  textFaint: "var(--fg-mute)",
  onAccent: "#0a0e1f",
  accent: "var(--orange)",
  accentHover: "var(--orange-hi)",
  accentDim: "var(--orange-soft)",
  success: "var(--green)",
  danger: "var(--red)",
  border: "var(--line)",
  borderMuted: "var(--line)",
  borderStrong: "var(--line-strong)",
  playhead: "var(--orange)",
  clipBg: "var(--bg-elev)",
  clipTextBg: "var(--bg-elev-2)",
  clipTextFg: "var(--fg-2)",
  clipImageBg: "var(--bg-elev-2)",
  clipImageFg: "var(--fg-2)",
  clipAudioBg: "rgba(123, 224, 170, 0.1)",
  clipAudioFg: "var(--green)",
  fontSans: "var(--font-geist-sans), system-ui, sans-serif",
  fontMono: "var(--font-geist-mono), ui-monospace, monospace",
};

export function PlaygroundClient({
  initialAssets,
}: {
  initialAssets: EditorAsset[];
}) {
  const [scene, setScene] = useState<Scene>(() => DEFAULT_SCENE);
  const [render, setRender] = useState<{ id: string; status: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // The host's uploader: probe duration/dimensions locally, reserve a signed URL
  // server-side (forwarding the probed metadata so the asset is immediately
  // ready/listable), PUT the bytes, and hand the editor an asset pointing at the
  // resulting CDN URL.
  const onUpload = async (file: File): Promise<EditorAsset> => {
    const kind = file.type.startsWith("audio") ? "AUDIO" : "VIDEO";
    const probed = await probeMedia(file, kind).catch(() => null);
    const { upload_url, source_url } = await createUploadAction(
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
    return {
      id: source_url,
      kind,
      filename: file.name,
      status: "READY",
      durationSec: probed?.duration ?? null,
      fileUrl: source_url,
    };
  };

  const request = useMemo(() => sceneToRenderRequest(scene), [scene]);
  const json = useMemo(() => JSON.stringify(request, null, 2), [request]);

  const onRender = () => {
    setError(null);
    startTransition(async () => {
      try {
        setRender(await createRenderAction(request));
      } catch (e) {
        console.error("[playground] render request failed", e);
        setError(e instanceof Error ? e.message : "Render failed");
      }
    });
  };

  const canRender = !pending && request.elements.length > 0;

  return (
    <div style={{ height: "100vh", minWidth: 0 }}>
      <FrametakeEditorClient
        initialScene={scene}
        onSceneChange={setScene}
        media={{ assets: initialAssets, onUpload }}
        theme={CONSOLE_THEME}
        features={{ topbar: { history: false } }}
        brand={<Brand />}
        comingSoonTabs={COMING_SOON_TABS}
        asideHeader={
          <RenderRequestPanel
            request={request}
            json={json}
            render={render}
            error={error}
            onRender={onRender}
            canRender={canRender}
            pending={pending}
          />
        }
      />
    </div>
  );
}

function Brand() {
  return (
    <span style={{ display: "inline-flex", gap: 12, alignItems: "baseline" }}>
      <span style={{ fontWeight: 600, color: "var(--fg)" }}>Playground</span>
      <a
        href="https://docs.framelane.io/introduction/quickstart"
        target="_blank"
        rel="noreferrer"
        style={{ fontSize: 13, fontWeight: 400, color: "var(--orange)" }}
      >
        Read the quickstart →
      </a>
    </span>
  );
}

// AI features not yet wired into the playground — surfaced as disabled "Soon" tabs
// beside the editor's Video/Audio/Text/Images insert tabs. The editor renders them
// from this host-supplied list (see the `comingSoonTabs` prop).
const COMING_SOON_TABS = [
  { label: "Captions", icon: <Captions size={20} /> },
  { label: "Graphics", icon: <Shapes size={20} /> },
  { label: "Background Removal", icon: <Eraser size={20} /> },
  { label: "Gaze Correction", icon: <Eye size={20} /> },
  { label: "AI Image & Video", icon: <Sparkles size={20} /> },
];

function RenderButton({
  disabled,
  pending,
  onClick,
}: {
  disabled: boolean;
  pending: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 8,
        border: "none",
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        background: "var(--orange)",
        color: "#0a0e1f",
      }}
    >
      <Play size={13} fill="#0a0e1f" strokeWidth={0} aria-hidden />
      {pending ? "Rendering…" : "Render"}
    </button>
  );
}

function CopyButton({
  copied,
  onClick,
}: {
  copied: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Copy request"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 8,
        border: "1px solid var(--line-strong)",
        background: "var(--bg-elev)",
        color: copied ? "var(--green)" : "var(--fg)",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "color 0.15s",
      }}
    >
      {copied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/** Transient bottom-center toast shown when the request is copied. */
function CopiedToast() {
  return (
    <div
      role="status"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        borderRadius: 10,
        background: "var(--bg-elev-2)",
        border: "1px solid var(--line-strong)",
        color: "var(--fg)",
        fontSize: 13,
        fontWeight: 500,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.45)",
        zIndex: 1000,
      }}
    >
      <Check size={15} style={{ color: "var(--green)" }} aria-hidden />
      Request copied to clipboard
    </div>
  );
}

function RenderRequestPanel({
  request,
  json,
  render,
  error,
  onRender,
  canRender,
  pending,
}: {
  request: RenderRequest;
  json: string;
  render: { id: string; status: string } | null;
  error: string | null;
  onRender: () => void;
  canRender: boolean;
  pending: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const curl = useMemo(
    () =>
      [
        "curl -X POST https://api.framelane.io/v1/renders \\",
        '  -H "Authorization: Bearer $FRAMELANE_API_KEY" \\',
        '  -H "Content-Type: application/json" \\',
        `  -d '${json}'`,
      ].join("\n"),
    [json],
  );

  const copy = () => {
    void navigator.clipboard.writeText(curl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      style={{
        // Inset from the editor's right-column edges so the card border doesn't
        // double up with the topbar's bottom border + the column's left border.
        margin: 12,
        borderRadius: 12,
        border: "1px solid var(--line)",
        background: "var(--bg-2)",
        overflow: "hidden",
        // Fill the remaining sidebar height; the curl <pre> scrolls inside.
        display: "flex",
        flexDirection: "column",
        flex: "1 1 auto",
        minHeight: 360,
      }}
    >
      <div style={{ padding: "14px 14px 10px", flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>
            Request
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RenderButton
              disabled={!canRender}
              pending={pending}
              onClick={onRender}
            />
            <CopyButton copied={copied} onClick={copy} />
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--fg-dim)" }}>
            POST /v1/renders
          </span>
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          <Chip>{`${request.width} × ${request.height}`}</Chip>
          <Chip>{`${formatDuration(request.duration)}`}</Chip>
          <Chip>{`${request.elements.length} element${request.elements.length === 1 ? "" : "s"}`}</Chip>
        </div>
      </div>

      <pre
        className="mono"
        style={{
          margin: 0,
          padding: 14,
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          borderTop: "1px solid var(--line)",
          background: "var(--bg)",
          fontSize: 12,
          lineHeight: 1.6,
          color: "var(--fg-2)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {highlightCurl(curl)}
      </pre>

      {(render || error) && (
        <div
          style={{
            padding: "8px 14px",
            borderTop: "1px solid var(--line)",
            fontSize: 12,
            flexShrink: 0,
            color: error ? "var(--red)" : "var(--green)",
          }}
        >
          {error ?? `${render?.status} · ${render?.id}`}
        </div>
      )}

      {copied && <CopiedToast />}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="mono"
      style={{
        padding: "3px 8px",
        borderRadius: 6,
        border: "1px solid var(--line)",
        background: "var(--bg-elev)",
        fontSize: 11,
        color: "var(--fg-2)",
      }}
    >
      {children}
    </span>
  );
}

function formatDuration(sec: number): string {
  return `${Number.isInteger(sec) ? sec : sec.toFixed(1)}s`;
}

// Lightweight syntax highlighter for the curl + embedded JSON — no dependency,
// just tokenises into colored <span>s so the request body reads like a code block.
const CODE_COLOR: Record<string, string> = {
  url: "#cfa978",
  str: "#cfa978",
  key: "#8b9bd4",
  num: "var(--green)",
  lit: "var(--orange-hi)",
  flag: "var(--orange)",
  cmd: "var(--fg)",
  method: "var(--orange-hi)",
};

function highlightCurl(code: string): React.ReactNode[] {
  const re =
    /(https?:\/\/[^\s'"]+)|("(?:[^"\\]|\\.)*")|(?<=\s)(-[A-Za-z])(?=\s)|\b(curl)\b|\b(POST|GET|PUT|PATCH|DELETE)\b|\b(true|false|null)\b|\b(\d+(?:\.\d+)?)\b/g;
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    if (m.index > last) out.push(code.slice(last, m.index));
    let type: string;
    let val = m[0];
    if (m[1]) type = "url";
    else if (m[2]) {
      val = m[2];
      type = /^\s*:/.test(code.slice(re.lastIndex)) ? "key" : "str";
    } else if (m[3]) type = "flag";
    else if (m[4]) type = "cmd";
    else if (m[5]) type = "method";
    else if (m[6]) type = "lit";
    else type = "num";
    out.push(
      <span
        key={key++}
        style={{
          color: CODE_COLOR[type],
          fontWeight: type === "cmd" || type === "method" ? 600 : undefined,
        }}
      >
        {val}
      </span>,
    );
    last = re.lastIndex;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

interface ProbedMedia {
  duration: number;
  width: number | null;
  height: number | null;
}

/** Read a media file's duration (and pixel dimensions for video) in-browser from
 * a local object URL. Resolves within `timeoutMs` (or rejects) so a file that
 * never loads can't hang upload. */
function probeMedia(
  file: File,
  kind: "VIDEO" | "AUDIO",
  timeoutMs = 5000,
): Promise<ProbedMedia> {
  return new Promise((resolve, reject) => {
    const el = document.createElement(kind === "AUDIO" ? "audio" : "video");
    const url = URL.createObjectURL(file);
    let done = false;
    const finish = (cb: () => void) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      el.removeAttribute("src");
      cb();
    };
    const timer = setTimeout(
      () => finish(() => reject(new Error("probe timed out"))),
      timeoutMs,
    );
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      const d = el.duration;
      const v = el as HTMLVideoElement;
      const width = v.videoWidth || null;
      const height = v.videoHeight || null;
      finish(() =>
        Number.isFinite(d) && d > 0
          ? resolve({ duration: d, width, height })
          : reject(new Error("no duration")),
      );
    };
    el.onerror = () => finish(() => reject(new Error("probe failed")));
    el.src = url;
  });
}
