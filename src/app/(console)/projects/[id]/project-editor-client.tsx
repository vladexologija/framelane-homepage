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
} from "lucide-react";
import { createEmptyScene, type Scene } from "@frametake/scene-schema";

import { FrametakeEditorClient, FrametakeInspector } from "@/components/frametake-editor-client";
import { JsonEditor } from "@/components/json-editor";
import { DEFAULT_SCENE } from "../default-scene";
import type { EditorAsset, FrameTakeTheme } from "@/lib/editor-types";
import { sceneToRenderRequest } from "@/lib/sceneToRenderRequest";
import { minimizeRenderRequest } from "@/lib/minimizeRenderRequest";
import { renderRequestToScene, collectPreviewIssues } from "@/lib/renderRequestToScene";
import { validateRenderRequest, type Issue } from "@/lib/renderRequestSchema";
import { probeMedia, probeSourceUrlDuration } from "@/lib/probe-media";
import {
  createRenderAction,
  createProjectRenderAction,
  createUploadAction,
  getProjectAction,
  saveProjectAction,
} from "../actions";
import { ProjectRendersTab } from "./project-renders-tab";

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

// How long editing stays quiet before an edit is auto-persisted, so a burst of
// keystrokes/canvas tweaks coalesces into one save. Real projects only — the
// non-persisted Sample is never saved.
const AUTOSAVE_DELAY_MS = 1000;

type RightTab = "body" | "renders" | "inspector";

export function ProjectEditorClient({
  projectId,
  projectName,
  initialVersion,
  initialRenderRequest,
  initialAssets,
}: {
  /** A real project id, or `null` for the non-persisted Sample project. */
  projectId: string | null;
  projectName: string;
  initialVersion: number | null;
  /** The stored RenderRequest (object), or `null` to seed the sample default scene. */
  initialRenderRequest: unknown | null;
  initialAssets: EditorAsset[];
}) {
  const isSample = projectId === null;

  // Seed the canvas + JSON draft. The sample opens on the built-in default scene;
  // a real project opens on its stored RenderRequest (falling back to an empty
  // canvas if it can't be mapped).
  const [scene, setScene] = useState<Scene>(() =>
    isSample
      ? DEFAULT_SCENE
      : renderRequestToScene(initialRenderRequest) ?? createEmptyScene(),
  );
  // The panel opens on the MINIMAL request — every field left at its API default
  // is stripped (see minimizeRenderRequest), so a stored request the API returns
  // fully-expanded, or the seeded sample, reads as just its essentials instead of
  // ~45 fields of default noise per element. Still renders identically.
  const [jsonDraft, setJsonDraft] = useState<string>(() =>
    JSON.stringify(
      minimizeRenderRequest(
        isSample ? sceneToRenderRequest(DEFAULT_SCENE) : (initialRenderRequest ?? {}),
      ),
      null,
      2,
    ),
  );
  // Always-current jsonDraft, read inside async save handlers so an edit that
  // lands while a save is in flight isn't falsely marked as saved.
  const jsonDraftRef = useRef(jsonDraft);
  useEffect(() => {
    jsonDraftRef.current = jsonDraft;
  }, [jsonDraft]);
  // Bumped only when JSON is loaded into the editor, to remount it with the new
  // scene (the editor reads `initialScene` once at mount). Canvas edits don't bump
  // it, so normal editing never remounts.
  const [loadKey, setLoadKey] = useState(0);
  const [render, setRender] = useState<{ id: string; status: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Project persistence state (real projects only).
  const [version, setVersion] = useState<number | null>(initialVersion);
  const versionRef = useRef(version);
  useEffect(() => {
    versionRef.current = version;
  }, [version]);
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  // True while a save (autosave or the pre-render save) is in flight, so a queued
  // autosave never fires a second, overlapping save against the same version.
  const savingRef = useRef(false);

  // The right-column tab + a signal to pull fresh renders after we submit one.
  const [tab, setTab] = useState<RightTab>("body");
  const [rendersSignal, setRendersSignal] = useState(0);

  // Reveal the inspector tab the moment an element is selected on the canvas or
  // timeline (the editor fires this via its `onSelect` prop). Deselection leaves
  // the tab in place — the inspector shows its own "select an element" state.
  const onSelect = useCallback((focusedId: string | null) => {
    if (focusedId) setTab("inspector");
  }, []);

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

  // In-flight uploads, so the editor can show a progress toast (the PUT of a
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

  const markDirty = useCallback(() => {
    if (!isSample) {
      setDirty(true);
      setSaveState("idle");
    }
  }, [isSample]);

  // Load the current JSON into the visual editor + preview (best-effort Scene).
  // Video/audio elements with no `out_point` play to the end of their source
  // (renderer `trimEnd -1`); the JSON doesn't carry that length, so probe each
  // URL's duration (cached) before building, letting the mapper place the clip
  // at its real end instead of stretching it across the whole composition.
  const applyJsonToScene = useCallback(async (text: string) => {
    const v = validateRenderRequest(text);
    if (!v.jsonOk) return;

    // Auto-format: once typing settles, normalize the draft to canonical 2-space
    // JSON. Runs off the same debounce as the preview load, so it never reflows
    // text mid-keystroke. Programmatic value updates are tagged ExternalChange by
    // the editor and don't echo back through onChange, so this can't loop.
    const formatted = JSON.stringify(v.value, null, 2);
    if (formatted !== text) setJsonDraft(formatted);

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
      // The remount gives the editor a fresh store with no selection, so the
      // Inspector tab would show its empty state. If a debounced JSON edit lands
      // right after a canvas click switched us there, fall back to the body tab
      // rather than stranding the user on an empty inspector hiding their JSON.
      setTab((t) => (t === "inspector" ? "body" : t));
    }
  }, []);

  // User edits the JSON → debounce a load into the preview. (Programmatic value
  // syncs from a canvas edit / Format are tagged `ExternalChange` by
  // @uiw/react-codemirror and never reach onChange, so there's no echo to guard.)
  const onJsonChange = useCallback(
    (text: string) => {
      setJsonDraft(text);
      markDirty();
      if (applyTimer.current) clearTimeout(applyTimer.current);
      applyTimer.current = setTimeout(() => void applyJsonToScene(text), 500);
    },
    [applyJsonToScene, markDirty],
  );

  // User edits the canvas → re-derive the JSON (the editor is truth for that edit).
  const onSceneChange = useCallback(
    (next: Scene) => {
      setScene(next);
      markDirty();
      if (applyTimer.current) clearTimeout(applyTimer.current); // cancel a pending JSON load
      // Re-derive the request from the edited canvas, stripped to non-default
      // fields so adding/moving an element shows only what it actually set.
      setJsonDraft(JSON.stringify(minimizeRenderRequest(sceneToRenderRequest(next)), null, 2));
    },
    [markDirty],
  );

  // Persist the whole composition as the project head (replace_request op).
  // No-op for the sample. `snapshot` is the jsonDraft captured at call time: if
  // the user edits while the save is in flight, we keep those edits marked
  // unsaved instead of falsely clearing dirty / showing "Saved".
  // Returns true if the head is now saved. `snapshot` is the jsonDraft at call
  // time: if the user edits while the save is in flight we keep those edits
  // marked unsaved instead of falsely clearing dirty / showing "Saved". On a
  // stale-version 409 we refresh to the current head version so the next save
  // isn't stuck re-sending the old if_version forever (last-write-wins).
  const persist = useCallback(
    async (body: unknown, snapshot: string): Promise<boolean> => {
      if (isSample || projectId === null) return true;
      savingRef.current = true;
      setSaveState("saving");
      try {
        const outcome = await saveProjectAction(projectId, body, versionRef.current ?? undefined);
        if (outcome.ok) {
          // Advance versionRef synchronously (not just via the setVersion effect)
          // so a save that lands right after this one sends the fresh if_version.
          setVersion(outcome.version);
          versionRef.current = outcome.version;
          // A successful save supersedes any prior error (e.g. a conflict warning);
          // autosave has no button-click to clear it, so clear it here.
          setError(null);
          if (jsonDraftRef.current === snapshot) {
            setDirty(false);
            setSaveState("saved");
          } else {
            setSaveState("idle");
          }
          return true;
        }
        setSaveState("idle");
        if (outcome.conflict) {
          const fresh = await getProjectAction(projectId).catch(() => null);
          if (fresh) {
            setVersion(fresh.version);
            versionRef.current = fresh.version;
            setError(
              `This project changed since you opened it (now v${fresh.version}). Saving again will overwrite that version.`,
            );
            return false;
          }
        }
        setError(outcome.message);
        return false;
      } finally {
        savingRef.current = false;
      }
    },
    [isSample, projectId],
  );

  // Autosave: once there are unsaved, valid changes, persist them after a quiet
  // period. Re-runs on every edit (jsonDraft dep) so the timer debounces, and on
  // saveState changes so edits made *during* an in-flight save get picked up when
  // it settles. The `saving` guard + savingRef keep a queued save from overlapping
  // the render-time save or a previous autosave.
  useEffect(() => {
    if (isSample || !dirty || saveState === "saving") return;
    const v = validateRenderRequest(jsonDraft);
    if (!v.jsonOk) return; // don't autosave broken JSON; the next valid edit retries
    const t = setTimeout(() => {
      if (savingRef.current) return; // completion of that save re-triggers this effect
      startTransition(() => {
        void persist(v.value, jsonDraft);
      });
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(t);
  }, [dirty, jsonDraft, saveState, isSample, persist]);

  const onRender = useCallback(() => {
    if (!validation.jsonOk) return;
    const body = validation.value;
    const snapshot = jsonDraftRef.current;
    setError(null);
    startTransition(async () => {
      if (isSample || projectId === null) {
        // Non-persisted sample: submit the composition directly.
        const outcome = await createRenderAction(body);
        if (outcome.ok) setRender(outcome.render);
        else setError(outcome.message);
        return;
      }
      // Real project: save the head, then render it, and surface the job in the
      // Renders tab. Skip the render if the save didn't land.
      if (!(await persist(body, snapshot))) return;
      const outcome = await createProjectRenderAction(projectId);
      if (outcome.ok) {
        setRender(outcome.render);
        setRendersSignal((n) => n + 1);
        setTab("renders");
      } else {
        setError(outcome.message);
      }
    });
  }, [validation, isSample, projectId, persist]);

  return (
    <div style={{ height: "100vh", minWidth: 0 }}>
      <FrametakeEditorClient
        key={loadKey}
        initialScene={scene}
        onSceneChange={onSceneChange}
        onSelect={onSelect}
        media={{ assets: initialAssets, onUpload }}
        theme={CONSOLE_THEME}
        // The native inspector is disabled: we host it ourselves as the third
        // right-panel tab (below), so it doesn't also render under the card.
        features={{ topbar: { history: false }, inspector: false }}
        brand={<Brand name={projectName} />}
        comingSoonTabs={COMING_SOON_TABS}
        asideHeader={
          <RightPanel
            tab={tab}
            onTabChange={setTab}
            inspector={<FrametakeInspector />}
            body={
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
                canRender={canRender}
                pending={pending}
                endpoint={isSample ? "POST /v1/renders" : `POST /v1/projects/${projectId}/renders`}
                autosave={!isSample}
                dirty={dirty}
                saveState={saveState}
                version={version}
              />
            }
            renders={<ProjectRendersTab refreshSignal={rendersSignal} />}
          />
        }
      />
      {uploads.length > 0 && <UploadingToast uploads={uploads} />}
    </div>
  );
}

/** The right-column card: a tab strip (Render body / Renders / Inspector) over the
 *  active tab. The Inspector tab hosts the editor's native element inspector (it
 *  follows the canvas selection), and is auto-revealed when an element is picked. */
function RightPanel({
  tab,
  onTabChange,
  body,
  renders,
  inspector,
}: {
  tab: RightTab;
  onTabChange: (t: RightTab) => void;
  body: React.ReactNode;
  renders: React.ReactNode;
  inspector: React.ReactNode;
}) {
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
      <div
        role="tablist"
        style={{ display: "flex", borderBottom: "1px solid var(--line)", flexShrink: 0 }}
      >
        <TabButton active={tab === "body"} onClick={() => onTabChange("body")}>
          Request
        </TabButton>
        <TabButton active={tab === "renders"} onClick={() => onTabChange("renders")}>
          Renders
        </TabButton>
        <TabButton active={tab === "inspector"} onClick={() => onTabChange("inspector")}>
          Inspector
        </TabButton>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {tab === "body" ? (
          body
        ) : tab === "renders" ? (
          renders
        ) : (
          // The native inspector root is an unscrolled flex column, so give it its
          // own scroll area within the card (its sections can run tall).
          <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>{inspector}</div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        flex: 1,
        padding: "10px 12px",
        border: "none",
        borderBottom: `2px solid ${active ? "var(--orange)" : "transparent"}`,
        background: "transparent",
        color: active ? "var(--fg)" : "var(--fg-mute)",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        transition: "color 0.12s",
      }}
    >
      {children}
    </button>
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

function Brand({ name }: { name: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 12, alignItems: "baseline" }}>
      <span style={{ fontWeight: 600, color: "var(--fg)" }}>{name}</span>
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

// AI features not yet wired into the editor — surfaced as disabled "Soon" tabs
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
  label,
  onClick,
}: {
  disabled: boolean;
  pending: boolean;
  label: string;
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
      {pending ? "Rendering…" : label}
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
  canRender,
  pending,
  endpoint,
  autosave,
  dirty,
  saveState,
  version,
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
  canRender: boolean;
  pending: boolean;
  endpoint: string;
  /** Real projects autosave, so the panel shows the save-status line. */
  autosave: boolean;
  dirty: boolean;
  saveState: "idle" | "saving" | "saved";
  version: number | null;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  // The visible trace of the automatic save (real projects only — the Sample is
  // never persisted, so it shows no status).
  const status = !autosave
    ? null
    : saveState === "saving"
      ? "Saving…"
      : dirty
        ? "Unsaved changes"
        : version != null
          ? `Saved · v${version}`
          : "Saved";

  return (
    <>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <IconButton
              onClick={copy}
              active={copied}
              icon={copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
              label={copied ? "Copied" : "Copy request"}
            />
            <RenderButton
              disabled={!canRender}
              pending={pending}
              label="Render"
              onClick={onRender}
            />
          </div>
        </div>

        {/* The endpoint (esp. a long project id) must never overflow the card, so
            it truncates with an ellipsis; the full URL is available on hover. */}
        <div style={{ marginTop: 8 }}>
          <span
            className="mono"
            title={endpoint}
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: 11,
              color: "var(--fg-dim)",
            }}
          >
            {endpoint}
          </span>
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
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

        {status && (
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              color: dirty ? "var(--orange)" : "var(--fg-mute)",
            }}
          >
            {status}
          </div>
        )}
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
    </>
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
