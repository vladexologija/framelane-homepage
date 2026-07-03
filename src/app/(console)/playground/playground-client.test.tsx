import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { EditorAsset, FrameTakeEditorProps } from "@/lib/editor-types";
import { sceneWith, video } from "@/test/scene-fixtures";
import { PlaygroundClient } from "./playground-client";

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
}));

// The CodeMirror editor is client-only + jsdom-hostile — mock it as a textarea.
vi.mock("@/components/json-editor", () => ({
  JsonEditor: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea data-testid="json-editor" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

const createRenderAction = vi.fn<(body: unknown) => Promise<{ id: string; status: string }>>(
  async () => ({ id: "render_1", status: "queued" }),
);
vi.mock("./actions", () => ({
  createRenderAction: (body: unknown) => createRenderAction(body),
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
const oneVideo = JSON.stringify({
  ...base,
  elements: [{ type: "video", id: "v1", source_url: "https://cdn.test/v.mp4", in_point: 0, out_point: 5 }],
});
const emptyReq = JSON.stringify({ ...base, elements: [] });

const editor = () => screen.getByTestId("json-editor") as HTMLTextAreaElement;
const setJson = (text: string) => fireEvent.change(editor(), { target: { value: text } });

beforeEach(() => {
  h.props = null;
  createRenderAction.mockClear();
});

describe("PlaygroundClient", () => {
  it("renders the editable request-body panel and injects assets into the editor", () => {
    render(<PlaygroundClient initialAssets={assets} />);

    expect(screen.getByText("Request body")).toBeInTheDocument();
    expect(screen.getByText("POST /v1/renders")).toBeInTheDocument();
    expect(screen.getByTestId("json-editor")).toBeInTheDocument();

    expect(h.props?.media?.assets).toBe(assets);
    expect(typeof h.props?.media?.onUpload).toBe("function");
    expect(typeof h.props?.onSceneChange).toBe("function");
    expect(h.props?.theme).toMatchObject({ accent: "var(--orange)" });
  });

  it("gates Render on valid JSON with at least one element", () => {
    render(<PlaygroundClient initialAssets={assets} />);
    const renderBtn = () => screen.getByRole("button", { name: /Render/ });

    setJson("{ not json");
    expect(renderBtn()).toBeDisabled();
    expect(screen.getByText("invalid JSON")).toBeInTheDocument();

    setJson(emptyReq);
    expect(renderBtn()).toBeDisabled();

    setJson(oneVideo);
    expect(renderBtn()).toBeEnabled();
  });

  it("re-derives the JSON draft from a canvas edit", () => {
    render(<PlaygroundClient initialAssets={assets} />);
    act(() => {
      h.props?.onSceneChange?.(sceneWith([video()]));
    });
    expect(editor().value).toMatch(/cdn\.test\/v\.mp4/);
    expect(editor().value).toMatch(/"type": "video"/);
  });

  it("loads pasted JSON into the editor scene on Load", async () => {
    const user = userEvent.setup();
    render(<PlaygroundClient initialAssets={assets} />);
    setJson(oneVideo);
    await user.click(screen.getByRole("button", { name: "Load into preview" }));
    // Load remounts the editor with the scene built from the JSON.
    const els = Object.values(h.props?.initialScene?.elements ?? {}) as unknown as Record<string, unknown>[];
    expect(els.some((e) => e.src === "https://cdn.test/v.mp4")).toBe(true);
  });

  it("submits the exact parsed body and shows the result", async () => {
    const user = userEvent.setup();
    render(<PlaygroundClient initialAssets={assets} />);

    setJson(oneVideo);
    await user.click(screen.getByRole("button", { name: /Render/ }));

    await waitFor(() => expect(createRenderAction).toHaveBeenCalledTimes(1));
    const body = createRenderAction.mock.calls[0][0] as { elements: { id: string }[] };
    expect(body.elements).toHaveLength(1);
    expect(body.elements[0].id).toBe("v1");
    await waitFor(() => expect(screen.getByText(/queued · render_1/)).toBeInTheDocument());
  });

  it("does not crash the panel when duration is a non-number", () => {
    render(<PlaygroundClient initialAssets={assets} />);
    // jsonOk is true (JSON.parse succeeds) even though the schema rejects a quoted
    // number; the chip must not call `.toFixed` on a string and take down the panel.
    const quoted = JSON.stringify({
      ...base,
      duration: "10",
      elements: [{ type: "video", id: "v1", source_url: "https://cdn.test/v.mp4", in_point: 0, out_point: 5 }],
    });
    expect(() => setJson(quoted)).not.toThrow();
    expect(screen.getByText("auto duration")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Render/ })).toBeEnabled();
  });

  it("warns in the issues list when the preview drops an unsupported feature", () => {
    render(<PlaygroundClient initialAssets={assets} />);
    setJson(JSON.stringify({
      ...base,
      elements: [{ type: "text", id: "t", text: "hi", duration: 3, motion: [{ type: "difference", time: 0, duration: 1 }] }],
    }));
    expect(screen.getByText(/isn't supported in the editor preview yet/)).toBeInTheDocument();
  });

  it("keeps the JSON draft in sync when an edit reproduces a previously derived value", () => {
    render(<PlaygroundClient initialAssets={assets} />);
    // A canvas edit derives and pushes JSON into the editor.
    act(() => {
      h.props?.onSceneChange?.(sceneWith([video()]));
    });
    const derived = editor().value;
    // Tweak, then revert to exactly the derived text. The removed echo guard used
    // to drop this second edit, leaving the draft (Copy/Render) stale.
    setJson(derived + "\n");
    setJson(derived);
    expect(editor().value).toBe(derived);
  });
});
