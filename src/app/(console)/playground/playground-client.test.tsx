import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { EditorAsset, FrameTakeEditorProps } from "@/lib/editor-types";
import { sceneWith, video } from "@/test/scene-fixtures";
import { PlaygroundClient } from "./playground-client";

// Capture the props the (mocked) editor receives so we can drive onSceneChange.
const h = vi.hoisted(() => ({ props: null as FrameTakeEditorProps | null }));

// The mock renders the host-injected slots (brand/topbarExtras/asideHeader) so the
// render panel + Render button are present, exactly as the real editor would.
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

const createRenderAction = vi.fn(async () => ({ id: "render_1", status: "queued" }));
vi.mock("./actions", () => ({
  createRenderAction: (...args: unknown[]) => createRenderAction(...args),
  createUploadAction: vi.fn(async () => ({
    upload_url: "https://up",
    source_url: "https://cdn.test/u.mp4",
    expires_at: "",
  })),
}));

const assets: EditorAsset[] = [
  {
    id: "asset-1",
    kind: "VIDEO",
    filename: "clip.mp4",
    status: "READY",
    durationSec: 5,
    fileUrl: "https://cdn.test/clip.mp4",
  },
];

beforeEach(() => {
  h.props = null;
  createRenderAction.mockClear();
});

describe("PlaygroundClient", () => {
  it("renders the render-request panel and injects assets into the editor", () => {
    render(<PlaygroundClient initialAssets={assets} />);

    expect(screen.getByText("Render request")).toBeInTheDocument();
    expect(screen.getByText("POST /v1/renders")).toBeInTheDocument();
    expect(screen.getByTestId("editor-mock")).toBeInTheDocument();

    // The host injects its workspace assets + an uploader; the editor stays agnostic.
    expect(h.props?.media?.assets).toBe(assets);
    expect(typeof h.props?.media?.onUpload).toBe("function");
    expect(typeof h.props?.onSceneChange).toBe("function");
    // Themed via the editor's typed theme API with the console's tokens.
    expect(h.props?.theme).toMatchObject({ accent: "var(--orange)" });
  });

  it("disables Render until the scene has elements, then reflects edits in the JSON", async () => {
    render(<PlaygroundClient initialAssets={assets} />);

    const renderBtn = screen.getByRole("button", { name: "Render" });
    expect(renderBtn).toBeDisabled();

    // Drive an edit through the editor's onSceneChange.
    act(() => {
      h.props?.onSceneChange?.(sceneWith([video()]));
    });

    expect(renderBtn).toBeEnabled();
    // The live request JSON now contains the mapped element.
    expect(screen.getByText(/cdn\.test\/v\.mp4/)).toBeInTheDocument();
    expect(screen.getByText(/"type": "video"/)).toBeInTheDocument();
  });

  it("submits the render request and shows the result", async () => {
    const user = userEvent.setup();
    render(<PlaygroundClient initialAssets={assets} />);

    act(() => {
      h.props?.onSceneChange?.(sceneWith([video()]));
    });

    await user.click(screen.getByRole("button", { name: "Render" }));

    await waitFor(() => expect(createRenderAction).toHaveBeenCalledTimes(1));
    const body = createRenderAction.mock.calls[0][0] as { elements: unknown[] };
    expect(body.elements).toHaveLength(1);
    await waitFor(() =>
      expect(screen.getByText(/queued · render_1/)).toBeInTheDocument(),
    );
  });
});
