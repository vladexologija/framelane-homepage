import { describe, it, expect } from "vitest";

import { minimizeRenderRequest } from "./minimizeRenderRequest";
import { sceneToRenderRequest } from "./sceneToRenderRequest";
import { renderRequestToScene } from "./renderRequestToScene";
import { audio, sceneWith, text, video } from "@/test/scene-fixtures";

type Obj = Record<string, unknown>;
const min = (r: unknown) => minimizeRenderRequest(r) as Obj;
const els = (r: unknown) => (min(r).elements as Obj[]);

describe("minimizeRenderRequest", () => {
  it("collapses a fully-expanded API request to its essentials", () => {
    // The exact body the API returns for a single stock video (every Pydantic
    // default materialized) — this is what the user saw as 'too much'.
    const expanded = {
      width: 1280,
      height: 720,
      duration: 78.82875,
      frame_rate: 30,
      output_format: "mp4",
      output_filename: null,
      background_color: "#000000ff",
      background_image_url: null,
      alpha: false,
      elements: [
        {
          lut_url: null, lut_intensity: 100,
          brightness: 0, contrast: 0, saturation: 0, exposure: 0, sharpness: 0,
          blur: 0, noise: 0, vignette: 0, hue_rotate: 0,
          crop_top: 0, crop_bottom: 0, crop_left: 0, crop_right: 0,
          border_radius: 0, border_color: null, border_width: 0,
          shadow_color: null, shadow_blur: 0, shadow_x: 0, shadow_y: 0,
          x: "50%", y: "50%", width: "100%", height: "100%", aspect_ratio: null,
          x_anchor: "50%", y_anchor: "50%",
          x_rotation: "0°", y_rotation: "0°", z_rotation: "0°",
          x_scale: "100%", y_scale: "100%",
          flip_horizontal: false, flip_vertical: false,
          opacity: 100, z_index: 0, blend_mode: "none", clip: false, color_overlay: null,
          type: "video", id: "b88bd71a", name: null, track: null, time: 0, visible: true,
          source_url: "https://cdn-assets.framelane.io/shared/videos/clip3.mp4",
          in_point: 0, out_point: 78.82875, speed: 1, volume: 100,
          fade_in_duration: 0, fade_out_duration: 0, effects: [], motion: [],
        },
      ],
      transitions: [],
      metadata: {},
      webhook_url: null,
      ingest_external: null,
    };

    expect(minimizeRenderRequest(expanded)).toEqual({
      // width/height/duration are kept (dropping them would change the canvas or
      // re-derive the duration); everything else at its default is gone.
      width: 1280,
      height: 720,
      duration: 78.82875,
      elements: [
        {
          type: "video",
          id: "b88bd71a",
          source_url: "https://cdn-assets.framelane.io/shared/videos/clip3.mp4",
          out_point: 78.82875,
        },
      ],
    });
  });

  it("keeps values once they leave their defaults", () => {
    const el = els({
      width: 1920, height: 1080, duration: 10, frame_rate: 60,
      background_color: "#101010ff",
      elements: [
        {
          type: "video", id: "v", source_url: "https://x/v.mp4", out_point: 5,
          x: "25%", y: "50%", width: "100%", height: "40%",
          opacity: 80, speed: 2, volume: 50, time: 3, in_point: 1,
          brightness: 20, z_rotation: "90°", flip_horizontal: true,
        },
      ],
    })[0];
    const top = min({
      width: 1920, height: 1080, duration: 10, frame_rate: 60,
      background_color: "#101010ff", elements: [],
    });

    // Non-default top-level fields survive.
    expect(top.frame_rate).toBe(60);
    expect(top.background_color).toBe("#101010ff");
    // Changed element fields survive; ones left at the default are gone.
    expect(el).toEqual({
      type: "video", id: "v", source_url: "https://x/v.mp4", out_point: 5,
      x: "25%", height: "40%", opacity: 80, speed: 2, volume: 50,
      time: 3, in_point: 1, brightness: 20, z_rotation: "90°", flip_horizontal: true,
    });
    expect(el.y).toBeUndefined(); // "50%" default
    expect(el.width).toBeUndefined(); // "100%" default
  });

  it("drops z_index only when it equals the element's type default", () => {
    const [video0, videoN, text1, text0] = els({
      elements: [
        { type: "video", id: "a", source_url: "https://x/a.mp4", out_point: 1, z_index: 0 },
        { type: "video", id: "b", source_url: "https://x/b.mp4", out_point: 1, z_index: 3 },
        { type: "text", id: "c", text: "hi", duration: 2, z_index: 1 },
        { type: "text", id: "d", text: "lo", duration: 2, z_index: 0 },
      ],
    });
    expect("z_index" in video0).toBe(false); // video default 0 → dropped
    expect(videoN.z_index).toBe(3); // explicit non-default → kept
    expect("z_index" in text1).toBe(false); // text default 1 → dropped
    expect(text0.z_index).toBe(0); // text intentionally below its default → kept
  });

  it("keeps required-with-no-default fields (audio volume, image id/duration)", () => {
    const [au, img] = els({
      elements: [
        { type: "audio", id: "au", source_url: "https://x/a.mp3", out_point: 4, volume: 100, in_point: 0, speed: 1 },
        { type: "image", id: "img", source_url: "https://x/i.png", duration: 3, opacity: 100, x: "50%" },
      ],
    });
    // Audio volume is required even at 100; its in_point/speed defaults still drop.
    expect(au).toEqual({ type: "audio", id: "au", source_url: "https://x/a.mp3", out_point: 4, volume: 100 });
    // Image keeps required id + duration; opacity/x defaults drop.
    expect(img).toEqual({ type: "image", id: "img", source_url: "https://x/i.png", duration: 3 });
  });

  it("strips every default-valued text field, keeping only what changed", () => {
    const [plain, styled] = els({
      elements: [
        {
          type: "text", id: "a", text: "hi", duration: 2, font_size: 48,
          // all at their API defaults → gone
          font_family: "Inter", font_weight: 400, font_style: "normal",
          text_color: "#ffffff", text_align: "center", text_decoration: "none",
          text_wrap: "wrap", tracking: 0, leading: 1.2, stroke_width: 0,
          background_opacity: 100, background: false, stroke: false, shadow: false,
        },
        { type: "text", id: "b", text: "yo", duration: 2, font_size: 48, text_wrap: "nowrap", leading: 1.5 },
      ],
    });
    // font_size is deliberately kept; every other default text field is dropped.
    expect(plain).toEqual({ type: "text", id: "a", text: "hi", duration: 2, font_size: 48 });
    // Non-default text_wrap / leading survive.
    expect(styled.text_wrap).toBe("nowrap");
    expect(styled.leading).toBe(1.5);
  });

  it("normalizes zero-rotation representations and empty collections", () => {
    const el = els({
      elements: [
        {
          type: "video", id: "v", source_url: "https://x/v.mp4", out_point: 1,
          z_rotation: "0deg", x_rotation: 0, y_rotation: "0", effects: [], motion: [],
        },
      ],
    })[0];
    expect(el).toEqual({ type: "video", id: "v", source_url: "https://x/v.mp4", out_point: 1 });
  });

  it("returns non-objects untouched", () => {
    expect(minimizeRenderRequest(null)).toBe(null);
    expect(minimizeRenderRequest("x")).toBe("x");
    expect(minimizeRenderRequest([1, 2])).toEqual([1, 2]);
  });

  it("round-trips losslessly: minimize then re-read reconstructs the scene", () => {
    // Dropping only defaults must not change what renderRequestToScene rebuilds.
    const scene = sceneWith([video(), text(), audio()]);
    const full = sceneToRenderRequest(scene);
    const minimal = minimizeRenderRequest(full);

    const fromFull = renderRequestToScene(full)!;
    const fromMin = renderRequestToScene(minimal)!;
    expect(fromMin).toEqual(fromFull);
  });

  it("keeps a fully-mapped scene body render-equivalent but far smaller", () => {
    const full = sceneToRenderRequest(sceneWith([video()]));
    const v = els(full)[0];
    // The neutral geometry/timing/opacity/volume are gone...
    for (const k of ["x", "y", "time", "in_point", "speed", "opacity", "volume", "z_index"]) {
      expect(k in v).toBe(false);
    }
    // ...while the required + changed fields remain.
    expect(v).toMatchObject({
      type: "video",
      id: "v1",
      source_url: "https://cdn.test/v.mp4",
      out_point: 5,
      width: "50%",
      height: "25%",
    });
  });
});
