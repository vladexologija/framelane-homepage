import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { EditorAsset, FrameTakeEditorProps } from "@/lib/editor-types";
import { sceneWith, video } from "@/test/scene-fixtures";
import { ProjectEditorClient } from "./project-editor-client";

// Capture the props the (mocked) editor receives so we can drive onSceneChange
// and inspect the scene loaded from JSON.
const h = vi.hoisted(() => ({ props: null as FrameTakeEditorProps | null }));

vi.mock("@/components/frametake-editor-client", () => ({
  FrametakeEditorClient: (props: FrameTakeEditorProps) => {
    h.props = props;
    return (
      <div data-testid="editor-mock">
        {props.brand}
        {props.topbarExtras}
        {props.asideHeader}
      </div>
    );
  },
  // The native inspector reads the editor's store; stand it in with a marker.
  FrametakeInspector: () => <div data-testid="native-inspector">inspector</div>,
}));

// The CodeMirror editor is client-only + jsdom-hostile — mock it as a textarea.
vi.mock("@/components/json-editor", () => ({
  JsonEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea data-testid="json-editor" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

// The Renders tab fetches through a server action; mock it to a marker.
vi.mock("./project-renders-tab", () => ({
  ProjectRendersTab: () => <div data-testid="renders-tab">renders</div>,
}));

type SaveOutcome =
  | { ok: true; version: number }
  | { ok: false; conflict: boolean; message: string };
type RenderOutcome =
  | { ok: true; render: { id: string; status: string } }
  | { ok: false; message: string };
const okResult = (version: number): SaveOutcome => ({ ok: true, version });

const createRenderAction = vi.fn<(body: unknown) => Promise<RenderOutcome>>(
  async () => ({ ok: true, render: { id: "render_1", status: "queued" } }),
);
const createProjectRenderAction = vi.fn<(id: string) => Promise<RenderOutcome>>(
  async () => ({ ok: true, render: { id: "render_2", status: "queued" } }),
);
const saveProjectAction = vi.fn<(id: string, body: unknown, v?: number) => Promise<SaveOutcome>>(
  async () => okResult(4),
);
const getProjectAction = vi.fn(async (id: string) => ({
  id,
  name: "My project",
  version: 7,
  workspace_id: "w",
  created_at: "",
  updated_at: "",
  summary: {
    width: 1920,
    height: 1080,
    duration: 10,
    frame_rate: 30,
    output_format: "mp4",
    element_count: 1,
    transition_count: 0,
    elements: [],
  },
  render_request: oneVideo,
}));
vi.mock("../actions", () => ({
  createRenderAction: (body: unknown) => createRenderAction(body),
  createProjectRenderAction: (id: string) => createProjectRenderAction(id),
  saveProjectAction: (id: string, body: unknown, v?: number) => saveProjectAction(id, body, v),
  getProjectAction: (id: string) => getProjectAction(id),
  createUploadAction: vi.fn(async () => ({
    upload_url: "https://up",
    source_url: "https://cdn.test/u.mp4",
    expires_at: "",
  })),
}));

const assets: EditorAsset[] = [
  { id: "asset-1", kind: "VIDEO", filename: "clip.mp4", status: "READY", durationSec: 5, fileUrl: "https://cdn.test/clip.mp4" },
];

const base = { width: 1920, height: 1080, duration: 10, frame_rate: 30, background_color: "#101010" };
const oneVideo = { ...base, elements: [{ type: "video", id: "v1", source_url: "https://cdn.test/v.mp4", in_point: 0, out_point: 5 }] };
const oneVideoJson = JSON.stringify(oneVideo);
const emptyReq = JSON.stringify({ ...base, elements: [] });

const editor = () => screen.getByTestId("json-editor") as HTMLTextAreaElement;
const setJson = (text: string) => fireEvent.change(editor(), { target: { value: text } });

// The non-persisted Sample project (projectId null) — the old playground behaviour.
const renderSample = () =>
  render(
    <ProjectEditorClient
      projectId={null}
      projectName="Sample project"
      initialVersion={null}
      initialRenderRequest={null}
      initialAssets={assets}
    />,
  );

// A real project loaded from its stored RenderRequest.
const renderProject = () =>
  render(
    <ProjectEditorClient
      projectId="proj_1"
      projectName="My project"
      initialVersion={3}
      initialRenderRequest={oneVideo}
      initialAssets={assets}
    />,
  );

beforeEach(() => {
  h.props = null;
  createRenderAction.mockClear();
  createProjectRenderAction.mockClear();
  saveProjectAction.mockClear();
});

describe("ProjectEditorClient — sample", () => {
  it("renders the editable request-body panel and injects assets into the editor", () => {
    renderSample();

    // "Request" appears twice (the tab + the panel heading), so target the tab.
    expect(screen.getByRole("tab", { name: "Request" })).toBeInTheDocument();
    expect(screen.getByText("POST /v1/renders")).toBeInTheDocument();
    expect(screen.getByText("Sample project")).toBeInTheDocument();
    expect(screen.getByTestId("json-editor")).toBeInTheDocument();

    expect(h.props?.media?.assets).toBe(assets);
    expect(typeof h.props?.media?.onUpload).toBe("function");
    expect(typeof h.props?.onSceneChange).toBe("function");
    expect(h.props?.theme).toMatchObject({ accent: "var(--orange)" });
  });

  it("gates Render on valid JSON with at least one element", () => {
    renderSample();
    const renderBtn = () => screen.getByRole("button", { name: /Render/ });

    setJson("{ not json");
    expect(renderBtn()).toBeDisabled();
    expect(screen.getByText("invalid JSON")).toBeInTheDocument();

    setJson(emptyReq);
    expect(renderBtn()).toBeDisabled();

    setJson(oneVideoJson);
    expect(renderBtn()).toBeEnabled();
  });

  it("re-derives the JSON draft from a canvas edit", () => {
    renderSample();
    act(() => {
      h.props?.onSceneChange?.(sceneWith([video()]));
    });
    expect(editor().value).toMatch(/cdn\.test\/v\.mp4/);
    expect(editor().value).toMatch(/"type": "video"/);
  });

  it("keeps the re-derived request minimal — only non-default fields", () => {
    renderSample();
    act(() => {
      h.props?.onSceneChange?.(sceneWith([video()]));
    });
    const body = editor().value;
    // A freshly-added clip shows just its essentials, not default geometry/
    // timing/opacity/z_index noise.
    for (const noise of ['"x"', '"opacity"', '"in_point"', '"z_index"', '"speed"']) {
      expect(body).not.toContain(noise);
    }
    expect(body).toContain('"out_point": 5');
  });

  it("auto-loads pasted JSON into the editor scene after the debounce", async () => {
    renderSample();
    setJson(oneVideoJson);
    await waitFor(
      () => {
        const els = Object.values(h.props?.initialScene?.elements ?? {}) as unknown as Record<string, unknown>[];
        expect(els.some((e) => e.src === "https://cdn.test/v.mp4")).toBe(true);
      },
      { timeout: 2000 },
    );
  });

  it("auto-formats the JSON draft to 2-space indent after editing settles", async () => {
    renderSample();
    setJson(oneVideoJson); // minified (no whitespace)
    await waitFor(
      () => expect(editor().value).toBe(JSON.stringify(oneVideo, null, 2)),
      { timeout: 2000 },
    );
  });

  it("copies the request and confirms with a toast", async () => {
    const user = userEvent.setup();
    renderSample();
    expect(screen.queryByText(/Request copied to clipboard/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Copy request" }));
    expect(await screen.findByText(/Request copied to clipboard/)).toBeInTheDocument();
  });

  it("submits the exact parsed body via the one-shot render and shows the result", async () => {
    const user = userEvent.setup();
    renderSample();

    setJson(oneVideoJson);
    await user.click(screen.getByRole("button", { name: /Render/ }));

    await waitFor(() => expect(createRenderAction).toHaveBeenCalledTimes(1));
    const body = createRenderAction.mock.calls[0][0] as { elements: { id: string }[] };
    expect(body.elements).toHaveLength(1);
    expect(body.elements[0].id).toBe("v1");
    await waitFor(() => expect(screen.getByText(/queued · render_1/)).toBeInTheDocument());
  });

  it("does not crash the panel when duration is a non-number", () => {
    renderSample();
    const quoted = JSON.stringify({ ...oneVideo, duration: "10" });
    expect(() => setJson(quoted)).not.toThrow();
    expect(screen.getByText("auto duration")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Render/ })).toBeEnabled();
  });

  it("warns in the issues list when the preview drops an unsupported feature", () => {
    renderSample();
    setJson(JSON.stringify({
      ...base,
      elements: [{ type: "text", id: "t", text: "hi", duration: 3, motion: [{ type: "difference", time: 0, duration: 1 }] }],
    }));
    expect(screen.getByText(/isn't supported in the editor preview yet/)).toBeInTheDocument();
  });

  it("switches to the Renders tab", async () => {
    const user = userEvent.setup();
    renderSample();
    expect(screen.queryByTestId("renders-tab")).not.toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Renders" }));
    expect(screen.getByTestId("renders-tab")).toBeInTheDocument();
  });

  it("hosts the inspector itself and disables the editor's built-in one", () => {
    renderSample();
    // The console hosts the inspector as its own tab, so the editor's native
    // below-card inspector must be turned off.
    expect(h.props?.features?.inspector).toBe(false);
    expect(typeof h.props?.onSelect).toBe("function");
  });

  it("shows the native inspector under the Inspector tab", async () => {
    const user = userEvent.setup();
    renderSample();
    expect(screen.queryByTestId("native-inspector")).not.toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Inspector" }));
    expect(screen.getByTestId("native-inspector")).toBeInTheDocument();
  });

  it("auto-reveals the Inspector tab when an element is selected", () => {
    renderSample();
    expect(screen.queryByTestId("native-inspector")).not.toBeInTheDocument();
    // The editor fires onSelect with the focused element id on a canvas click.
    act(() => h.props?.onSelect?.("el_1"));
    expect(screen.getByTestId("native-inspector")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Inspector" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("does not switch tabs when the selection is cleared", () => {
    renderSample();
    // Deselection (onSelect(null)) must not yank the user onto an empty inspector.
    act(() => h.props?.onSelect?.(null));
    expect(screen.getByRole("tab", { name: "Request" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.queryByTestId("native-inspector")).not.toBeInTheDocument();
  });

  it("falls back to the body tab when a JSON load remounts the editor off the Inspector tab", async () => {
    vi.useFakeTimers();
    try {
      renderSample();
      // The user edits JSON (arming the 500ms load debounce) on the body tab...
      setJson(oneVideoJson);
      // ...then clicks a canvas element within that window, revealing the Inspector.
      act(() => h.props?.onSelect?.("el_1"));
      expect(screen.getByRole("tab", { name: "Inspector" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      // When the debounce fires it rebuilds the scene, remounting the editor with a
      // fresh (empty) selection. The user shouldn't be stranded on an empty inspector
      // — the panel returns to the body where their JSON lives.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(600);
      });
      expect(screen.getByRole("tab", { name: "Request" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("ProjectEditorClient — real project", () => {
  it("opens on the stored request and targets the project render endpoint", () => {
    renderProject();
    expect(screen.getByText("My project")).toBeInTheDocument();
    expect(screen.getByText("POST /v1/projects/proj_1/renders")).toBeInTheDocument();
    expect(screen.getByText(/Saved · v3/)).toBeInTheDocument();
    expect(editor().value).toMatch(/cdn\.test\/v\.mp4/);
  });

  it("opens on the minimized stored request (defaults stripped)", () => {
    renderProject();
    const body = editor().value;
    expect(body).toContain('"out_point": 5');
    // in_point:0 (element) and frame_rate:30 (top-level) are API defaults → gone.
    expect(body).not.toContain('"in_point"');
    expect(body).not.toContain('"frame_rate"');
  });

  it("saves the head then renders it, and reveals the job in the Renders tab", async () => {
    const user = userEvent.setup();
    renderProject();

    // Nothing is dirty on load, so Render saves the current head then renders it.
    await user.click(screen.getByRole("button", { name: "Render" }));

    await waitFor(() => expect(saveProjectAction).toHaveBeenCalledTimes(1));
    expect(saveProjectAction.mock.calls[0][0]).toBe("proj_1");
    expect(saveProjectAction.mock.calls[0][2]).toBe(3); // if_version = loaded version
    await waitFor(() => expect(createProjectRenderAction).toHaveBeenCalledWith("proj_1"));
    // Auto-switches to the Renders tab so the new job is visible.
    await waitFor(() => expect(screen.getByTestId("renders-tab")).toBeInTheDocument());
  });

  it("autosaves edits without rendering", async () => {
    renderProject();

    // An edit is persisted automatically after the debounce — no Save button, and
    // no render triggered.
    setJson(JSON.stringify({ ...oneVideo, duration: 12 }));
    await waitFor(() => expect(saveProjectAction).toHaveBeenCalledTimes(1), { timeout: 2000 });
    expect(createProjectRenderAction).not.toHaveBeenCalled();
  });

  it("recovers from a 409 conflict by refreshing to the current head version", async () => {
    saveProjectAction.mockResolvedValueOnce({ ok: false, conflict: true, message: "conflict" });
    renderProject();

    setJson(JSON.stringify({ ...oneVideo, duration: 12 })); // dirty -> autosave fires

    // Instead of getting stuck re-sending the stale if_version, it refetches the
    // head and surfaces a conflict warning showing the new version.
    await waitFor(() => expect(getProjectAction).toHaveBeenCalledWith("proj_1"), { timeout: 2000 });
    await waitFor(() =>
      expect(screen.getByText(/changed since you opened it \(now v7\)/)).toBeInTheDocument(),
    );
  });

  it("keeps a mid-flight edit marked unsaved instead of showing Saved", async () => {
    let resolveSave!: (value: SaveOutcome | PromiseLike<SaveOutcome>) => void;
    saveProjectAction.mockImplementationOnce(
      () => new Promise<SaveOutcome>((res) => { resolveSave = res; }),
    );
    renderProject();

    setJson(JSON.stringify({ ...oneVideo, duration: 12 })); // dirty -> autosave starts
    await waitFor(() => expect(saveProjectAction).toHaveBeenCalledTimes(1), { timeout: 2000 });
    // The user keeps typing while the save is in flight.
    setJson(JSON.stringify({ ...oneVideo, duration: 13 }));
    // The original (duration:12) save now resolves.
    await act(async () => {
      resolveSave(okResult(5));
    });

    // The duration:13 edit was never persisted, so it must not read as "Saved".
    expect(screen.getByText(/Unsaved changes/)).toBeInTheDocument();
  });
});
