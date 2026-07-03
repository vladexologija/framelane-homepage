"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  AlertTriangle,
  Captions,
  Check,
  Copy,
  Eraser,
  Eye,
  Loader2,
  Play,
  Shapes,
  Sparkles,
  WrapText,
  Upload,
} from "lucide-react";
import type { Scene } from "@frametake/scene-schema";

import { FrametakeEditorClient } from "@/components/frametake-editor-client";
import { JsonEditor } from "@/components/json-editor";
import { DEFAULT_SCENE } from "./default-scene";
import type { EditorAsset, FrameTakeTheme } from "@/lib/editor-types";
import { sceneToRenderRequest } from "@/lib/sceneToRenderRequest";
import { renderRequestToScene, collectPreviewIssues } from "@/lib/renderRequestToScene";
import { validateRenderRequest, type Issue } from "@/lib/renderRequestSchema";
import { probeMedia, probeSourceUrlDuration } from "@/lib/probe-media";
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
  const [jsonDraft, setJsonDraft] = useState<string>(() =>
    JSON.stringify(sceneToRenderRequest(DEFAULT_SCENE), null, 2),
  );
  // Bumped only when JSON is loaded into the editor, to remount it with the new
  // scene (the editor reads `initialScene` once at mount). Canvas edits don't bump
  // it, so normal editing never remounts.
  const [loadKey, setLoadKey] = useState(0);
  const [render, setRender] = useState<{ id: string; status: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const applyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (applyTimer.current) clearTimeout(applyTimer.current);
  }, []);

  // Probed natural source lengths (seconds) keyed by source_url, so a clip with
  // no `out_point` previews at its real length instead of stretching to the
  // composition end. `0` marks a failed probe (don't retry). Persists across loads.
  const sourceDurations = useRef<Map<string, number>>(new Map());
  // Guards a slow probe from an older load applying its scene over a newer one.
  const applySeq = useRef(0);

  // In-flight uploads, so the playground can show a progress toast (the PUT of a
  // large clip can take a while and the editor gives no host-visible feedback).
  const [uploads, setUploads] = useState<{ id: number; name: string }[]>([]);
  const uploadId = useRef(0);

  // The host's uploader: probe duration/dimensions locally, reserve a signed URL
  // server-side (forwarding the probed metadata so the asset is immediately
  // ready/listable), PUT the bytes, and hand the editor an asset pointing at the
  // resulting CDN URL. Tracked in `uploads` for the progress toast.
  const onUpload = async (file: File): Promise<EditorAsset> => {
    const id = (uploadId.current += 1);
    setUploads((u) => [...u, { id, name: file.name }]);
    try {
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
    } finally {
      setUploads((u) => u.filter((x) => x.id !== id));
    }
  };

  const validation = useMemo(() => validateRenderRequest(jsonDraft), [jsonDraft]);
  // Schema/invariant issues + a warning per render feature the preview can't show
  // yet (unsupported motion, chroma_key) so a silently-dropped effect is visible.
  const issues = useMemo<Issue[]>(() => {
    if (!validation.jsonOk) return validation.issues;
    const previewDrops = collectPreviewIssues(validation.value).map(
      (d): Issue => ({ ...d, severity: "warning" }),
    );
    return [...validation.issues, ...previewDrops];
  }, [validation]);
  const parsed = validation.jsonOk
    ? (validation.value as {
        width?: number;
        height?: number;
        duration?: number;
        elements?: unknown[];
      })
    : null;
  const elementCount = Array.isArray(parsed?.elements) ? parsed!.elements.length : 0;
  const canRender = !pending && validation.jsonOk && elementCount > 0;

  // Load the current JSON into the visual editor + preview (best-effort Scene).
  // Video/audio elements with no `out_point` play to the end of their source
  // (renderer `trimEnd -1`); the JSON doesn't carry that length, so probe each
  // URL's duration (cached) before building, letting the mapper place the clip
  // at its real end instead of stretching it across the whole composition.
  const applyJsonToScene = useCallback(async (text: string) => {
    const v = validateRenderRequest(text);
    if (!v.jsonOk) return;
    const seq = ++applySeq.current;

    const req = v.value as { elements?: unknown };
    const targets = new Map<string, "VIDEO" | "AUDIO">();
    for (const el of Array.isArray(req.elements) ? req.elements : []) {
      if (!el || typeof el !== "object") continue;
      const { type, source_url: url, out_point: out } = el as {
        type?: unknown;
        source_url?: unknown;
        out_point?: unknown;
      };
      if (
        (type === "video" || type === "audio") &&
        typeof url === "string" &&
        url &&
        typeof out !== "number" &&
        !sourceDurations.current.has(url)
      ) {
        targets.set(url, type === "audio" ? "AUDIO" : "VIDEO");
      }
    }
    if (targets.size > 0) {
      await Promise.all(
        [...targets].map(async ([url, kind]) => {
          const d = await probeSourceUrlDuration(url, kind);
          sourceDurations.current.set(url, d ?? 0); // 0 = failed; skip next time
        }),
      );
      if (seq !== applySeq.current) return; // a newer load superseded this one
    }

    const next = renderRequestToScene(v.value, undefined, sourceDurations.current);
    if (next) {
      setScene(next);
      setLoadKey((k) => k + 1);
    }
  }, []);

  // User edits the JSON → debounce a load into the preview. (Programmatic value
  // syncs from a canvas edit / Format are tagged `ExternalChange` by
  // @uiw/react-codemirror and never reach onChange, so there's no echo to guard.)
  const onJsonChange = useCallback(
    (text: string) => {
      setJsonDraft(text);
      if (applyTimer.current) clearTimeout(applyTimer.current);
      applyTimer.current = setTimeout(() => void applyJsonToScene(text), 500);
    },
    [applyJsonToScene],
  );

  const onLoad = useCallback(() => {
    if (applyTimer.current) clearTimeout(applyTimer.current);
    void applyJsonToScene(jsonDraft);
  }, [applyJsonToScene, jsonDraft]);

  const onFormat = useCallback(() => {
    if (!validation.jsonOk) return;
    setJsonDraft(JSON.stringify(validation.value, null, 2)); // reformat only, no scene reload
  }, [validation]);

  // User edits the canvas → re-derive the JSON (the editor is truth for that edit).
  const onSceneChange = useCallback((next: Scene) => {
    setScene(next);
    if (applyTimer.current) clearTimeout(applyTimer.current); // cancel a pending JSON load
    setJsonDraft(JSON.stringify(sceneToRenderRequest(next), null, 2));
  }, []);

  const onRender = useCallback(() => {
    if (!validation.jsonOk) return;
    const body = validation.value;
    setError(null);
    startTransition(async () => {
      try {
        setRender(await createRenderAction(body));
      } catch (e) {
        console.error("[playground] render request failed", e);
        setError(e instanceof Error ? e.message : "Render failed");
      }
    });
  }, [validation]);

  return (
    <div style={{ height: "100vh", minWidth: 0 }}>
      <FrametakeEditorClient
        key={loadKey}
        initialScene={scene}
        onSceneChange={onSceneChange}
        media={{ assets: initialAssets, onUpload }}
        theme={CONSOLE_THEME}
        features={{ topbar: { history: false } }}
        brand={<Brand />}
        comingSoonTabs={COMING_SOON_TABS}
        asideHeader={
          <RenderRequestPanel
            value={jsonDraft}
            onChange={onJsonChange}
            issues={issues}
            jsonOk={validation.jsonOk}
            width={parsed?.width}
            height={parsed?.height}
            duration={parsed?.duration}
            elementCount={elementCount}
            render={render}
            error={error}
            onRender={onRender}
            onFormat={onFormat}
            onLoad={onLoad}
            canRender={canRender}
            pending={pending}
          />
        }
      />
      {uploads.length > 0 && <UploadingToast uploads={uploads} />}
    </div>
  );
}

/** Fixed bottom-center toast shown while one or more media uploads are in flight
 * (the editor gives no host-visible progress for a slow PUT). */
function UploadingToast({ uploads }: { uploads: { id: number; name: string }[] }) {
  const label =
    uploads.length === 1
      ? `Uploading ${uploads[0].name}…`
      : `Uploading ${uploads.length} files…`;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        borderRadius: 10,
        background: "var(--bg-elev-2)",
        border: "1px solid var(--line-strong)",
        color: "var(--fg)",
        fontSize: 13,
        fontWeight: 500,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.45)",
        zIndex: 1000,
        maxWidth: "min(90vw, 420px)",
      }}
    >
      <Loader2
        size={15}
        className="spin"
        style={{ color: "var(--orange)", flexShrink: 0 }}
        aria-hidden
      />
      <span
        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        {label}
      </span>
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

/** Small dark tooltip anchored below-right of its (relatively-positioned) parent.
 *  Below so the card's `overflow: hidden` top edge never clips it; right-anchored
 *  (grows leftward) so it stays inside the card for the right-aligned buttons. */
function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <span
      role="tooltip"
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        right: 0,
        padding: "4px 8px",
        borderRadius: 6,
        background: "var(--bg-elev-2)",
        border: "1px solid var(--line-strong)",
        color: "var(--fg)",
        fontSize: 11,
        fontWeight: 500,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        boxShadow: "0 6px 18px rgba(0, 0, 0, 0.4)",
        zIndex: 20,
      }}
    >
      {children}
    </span>
  );
}

/** Square icon-only action button with a styled hover tooltip. `label` is both
 *  the tooltip text and the button's accessible name. */
function IconButton({
  onClick,
  disabled,
  icon,
  label,
  active,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 30,
          height: 30,
          borderRadius: 8,
          border: "1px solid var(--line-strong)",
          background: "var(--bg-elev)",
          color: active ? "var(--green)" : "var(--fg)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition: "color 0.15s",
        }}
      >
        {icon}
      </button>
      {hover && <Tooltip>{label}</Tooltip>}
    </span>
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

function IssueRow({ issue }: { issue: Issue }) {
  const isErr = issue.severity === "error";
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        alignItems: "flex-start",
        fontSize: 11.5,
        lineHeight: 1.45,
        color: isErr ? "var(--red)" : "var(--orange)",
      }}
    >
      <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
      <span>
        {issue.path && (
          <span className="mono" style={{ opacity: 0.75 }}>
            {issue.path}:{" "}
          </span>
        )}
        {issue.message}
      </span>
    </div>
  );
}

function RenderRequestPanel({
  value,
  onChange,
  issues,
  jsonOk,
  width,
  height,
  duration,
  elementCount,
  render,
  error,
  onRender,
  onFormat,
  onLoad,
  canRender,
  pending,
}: {
  value: string;
  onChange: (v: string) => void;
  issues: Issue[];
  jsonOk: boolean;
  width?: number;
  height?: number;
  duration?: number;
  elementCount: number;
  render: { id: string; status: string } | null;
  error: string | null;
  onRender: () => void;
  onFormat: () => void;
  onLoad: () => void;
  canRender: boolean;
  pending: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

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
            Request body
          </span>
          <RenderButton disabled={!canRender} pending={pending} onClick={onRender} />
        </div>

        <div
          style={{
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span className="mono" style={{ fontSize: 11, color: "var(--fg-dim)" }}>
            POST /v1/renders
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <IconButton onClick={onFormat} disabled={!jsonOk} icon={<WrapText size={14} aria-hidden />} label="Format" />
            <IconButton onClick={onLoad} disabled={!jsonOk} icon={<Upload size={14} aria-hidden />} label="Load into preview" />
            <IconButton
              onClick={copy}
              active={copied}
              icon={copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
              label={copied ? "Copied" : "Copy request"}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          {jsonOk ? (
            <>
              <Chip>{width && height ? `${width} × ${height}` : "auto size"}</Chip>
              <Chip>{formatDuration(duration)}</Chip>
              <Chip>{`${elementCount} element${elementCount === 1 ? "" : "s"}`}</Chip>
            </>
          ) : (
            <Chip>invalid JSON</Chip>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          borderTop: "1px solid var(--line)",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg)",
        }}
      >
        <JsonEditor value={value} onChange={onChange} />
      </div>

      {(errors.length > 0 || warnings.length > 0) && (
        <div
          style={{
            maxHeight: 140,
            overflow: "auto",
            borderTop: "1px solid var(--line)",
            padding: "8px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            flexShrink: 0,
          }}
        >
          {errors.slice(0, 20).map((iss, i) => (
            <IssueRow key={`e${i}`} issue={iss} />
          ))}
          {warnings.slice(0, 20).map((iss, i) => (
            <IssueRow key={`w${i}`} issue={iss} />
          ))}
        </div>
      )}

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

// `sec` is a raw JSON value (jsonOk only means JSON.parse succeeded, not that the
// schema passed), so guard the type — a quoted number would otherwise throw on
// `.toFixed` and crash the whole panel.
function formatDuration(sec: unknown): string {
  if (typeof sec !== "number" || !Number.isFinite(sec)) return "auto duration";
  return `${Number.isInteger(sec) ? sec : sec.toFixed(1)}s`;
}

