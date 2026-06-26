import { describe, it, expect } from "vitest";
import { defaultFilters } from "@frametake/scene-schema";

import { sceneToRenderRequest, type RenderElement } from "./sceneToRenderRequest";
import { audio, sceneWith, text, video } from "@/test/scene-fixtures";

const byType = (els: RenderElement[], type: string) =>
  els.find((e) => e.type === type)!;

describe("sceneToRenderRequest", () => {
  it("maps canvas/timeline fields", () => {
    const req = sceneToRenderRequest(sceneWith([video()]));
    expect(req.width).toBe(1920);
    expect(req.height).toBe(1080);
    expect(req.duration).toBe(10);
    expect(req.frame_rate).toBe(30);
    expect(req.background_color).toBe("#101010");
  });

  it("maps a video: percent geometry, seconds, opacity 0–100, trim→in/out", () => {
    const v = byType(sceneToRenderRequest(sceneWith([video()])).elements, "video");
    expect(v.source_url).toBe("https://cdn.test/v.mp4");
    expect(v.x).toBe("50%");
    expect(v.y).toBe("50%");
    expect(v.width).toBe("50%");
    expect(v.height).toBe("25%");
    expect(v.time).toBe(0);
    expect(v.in_point).toBe(0);
    expect(v.out_point).toBe(5);
    expect(v.speed).toBe(1);
    expect(v.opacity).toBe(100);
    expect(v.volume).toBe(100);
    expect(v.z_index).toBe(0);
  });

  it("maps audio volume to 0–100", () => {
    const a = byType(sceneToRenderRequest(sceneWith([audio()])).elements, "audio");
    expect(a.type).toBe("audio");
    expect(a.volume).toBe(80);
    expect(a.in_point).toBe(0);
    expect(a.out_point).toBe(10);
  });

  it("drops muted audio (API requires volume > 0)", () => {
    const req = sceneToRenderRequest(sceneWith([audio({ volume: 0 })]));
    expect(req.elements.filter((e) => e.type === "audio")).toHaveLength(0);
  });

  it("maps background + outline together without tripping exclusive-display", () => {
    // Background sets its flag; the outline emits stroke_color/width but NOT the
    // `stroke` flag (which would mean hollow text) — so both can coexist and the
    // API's at-most-one-of-{background,stroke,shadow} (booleans) rule holds.
    const t = byType(
      sceneToRenderRequest(
        sceneWith([
          text({ backgroundColor: "#222222", outlineWidth: 0.01, fontSize: 0.1 }),
        ]),
      ).elements,
      "text",
    );
    expect(t.background).toBe(true);
    expect(t.stroke).toBeUndefined();
    expect(t.shadow).toBeUndefined();
    expect(t.stroke_color).toBe("#000000");
    expect(t.stroke_width).toBeCloseTo(0.1); // em-relative: 0.01 / 0.1
  });

  it("maps text: duration, px font size, weight/style, alignment", () => {
    const t = byType(sceneToRenderRequest(sceneWith([text()])).elements, "text");
    expect(t.text).toBe("Hello");
    expect(t.duration).toBe(3); // endTime 4 - startTime 1
    expect(t.x).toBe("25%");
    expect(t.font_size).toBe(108); // 0.1 * 1080
    expect(t.font_weight).toBe(700);
    expect(t.font_style).toBe("bold");
    expect(t.font_family).toBe("Inter"); // first family only
    expect(t.text_align).toBe("center");
  });

  it("emits an em-relative outline only when outlineWidth > 0 (filled, not hollow)", () => {
    const plain = byType(sceneToRenderRequest(sceneWith([text()])).elements, "text");
    expect(plain.stroke_color).toBeUndefined();
    expect(plain.stroke_width).toBeUndefined();
    const outlined = byType(
      sceneToRenderRequest(
        sceneWith([
          text({ outlineWidth: 0.01, outlineColor: "#ff0000", fontSize: 0.1 }),
        ]),
      ).elements,
      "text",
    );
    // No `stroke` flag (filled text + outline, not hollow); width is em-relative.
    expect(outlined.stroke).toBeUndefined();
    expect(outlined.stroke_color).toBe("#ff0000");
    expect(outlined.stroke_width).toBeCloseTo(0.1); // 0.01 / 0.1
  });

  it("preserves elementOrder as z_index and maps opacity", () => {
    const req = sceneToRenderRequest(
      sceneWith([video({ id: "v1" }), text({ id: "t1", filters: { ...defaultFilters(), opacity: 0.5 } })]),
    );
    expect(req.elements.map((e) => e.z_index)).toEqual([0, 1]);
    expect(byType(req.elements, "text").opacity).toBe(50);
  });

  it("maps color correction at engine scale, omitting neutral channels", () => {
    const v = byType(
      sceneToRenderRequest(
        sceneWith([
          video({ filters: { ...defaultFilters(), brightness: 0.5, hue: 0.5 } }),
        ]),
      ).elements,
      "video",
    );
    expect(v.brightness).toBe(50); // 0.5 → ±100 scale
    expect(v.hue_rotate).toBe(90); // 0.5 → ±180°
    expect(v.contrast).toBeUndefined(); // neutral channels omitted
    expect(v.saturation).toBeUndefined();
  });

  it("maps video flip flags", () => {
    const v = byType(
      sceneToRenderRequest(sceneWith([video({ flipX: true })])).elements,
      "video",
    );
    expect(v.flip_horizontal).toBe(true);
    expect(v.flip_vertical).toBeUndefined();
  });

  it("clamps speed into the API's 0.25–4.0 range", () => {
    const fast = byType(
      sceneToRenderRequest(sceneWith([video({ playbackRate: 8 })])).elements,
      "video",
    );
    expect(fast.speed).toBe(4);
    const slow = byType(
      sceneToRenderRequest(sceneWith([audio({ playbackRate: 0.1 })])).elements,
      "audio",
    );
    expect(slow.speed).toBe(0.25);
  });

  it("maps known entrance/exit animations to motion, drops unknown presets", () => {
    const anim = (animation: string, length = 0.5, startTime = 0) => ({
      animation,
      animationParams: { length, startTime },
    });
    const v = byType(
      sceneToRenderRequest(
        sceneWith([
          video({
            animations: [anim("slideLeft"), anim("out-fade", 0.3, 4.7), anim("none", 0, 0)],
          }),
        ]),
      ).elements,
      "video",
    );
    const motion = v.motion as Array<{ type: string; reversed: boolean }>;
    expect(motion).toContainEqual(
      expect.objectContaining({ type: "slide_left", reversed: false }),
    );
    expect(motion).toContainEqual(
      expect.objectContaining({ type: "fade", reversed: true }),
    );

    const unknown = byType(
      sceneToRenderRequest(
        sceneWith([
          video({ animations: [anim("pop"), anim("none", 0, 0), anim("none", 0, 0)] }),
        ]),
      ).elements,
      "video",
    );
    expect(unknown.motion).toBeUndefined();
  });

  it("skips elements that would fail the API's element-level validation", () => {
    const req = sceneToRenderRequest(
      sceneWith([
        text({ id: "empty", text: "   " }), // empty/whitespace text
        text({ id: "zero", startTime: 2, endTime: 2 }), // zero duration
        video({ id: "badtrim", trimStart: 5, trimEnd: 5 }), // out_point !> in_point
        audio({ id: "mute", volume: 0 }), // volume must be > 0
        video({ id: "ok" }), // valid → kept
      ]),
    );
    expect(req.elements).toHaveLength(1);
    expect(req.elements[0].id).toBe("ok");
  });

  it("never emits font_size below 1", () => {
    const t = byType(
      sceneToRenderRequest(sceneWith([text({ fontSize: 0.0001 })])).elements,
      "text",
    );
    expect(t.font_size).toBe(1);
  });

  it("maps zoom entrance and exit to the correct direction", () => {
    const anim = (animation: string) => ({
      animation,
      animationParams: { length: 0.5, startTime: 0 },
    });
    const inZoom = byType(
      sceneToRenderRequest(
        sceneWith([
          video({ animations: [anim("zoomIn"), anim("none"), anim("none")] }),
        ]),
      ).elements,
      "video",
    );
    expect(inZoom.motion).toContainEqual(
      expect.objectContaining({ type: "zoom_in", reversed: false }),
    );
    const outZoom = byType(
      sceneToRenderRequest(
        sceneWith([
          video({ animations: [anim("none"), anim("out-zoomOut"), anim("none")] }),
        ]),
      ).elements,
      "video",
    );
    expect(outZoom.motion).toContainEqual(
      expect.objectContaining({ type: "zoom_out", reversed: true }),
    );
  });

  it("maps text fade in/out to FADE motions", () => {
    const t = byType(
      sceneToRenderRequest(
        sceneWith([text({ startTime: 1, endTime: 4, fadeIn: 0.5, fadeOut: 0.5 })]),
      ).elements,
      "text",
    );
    const motion = t.motion as Array<{
      type: string;
      reversed: boolean;
      time: number;
    }>;
    expect(motion).toContainEqual(
      expect.objectContaining({ type: "fade", reversed: false, time: 1 }),
    );
    expect(motion).toContainEqual(
      expect.objectContaining({ type: "fade", reversed: true, time: 3.5 }),
    );
  });

  it("rotation only emitted when non-zero", () => {
    const none = byType(sceneToRenderRequest(sceneWith([video()])).elements, "video");
    expect(none.z_rotation).toBeUndefined();
    const rotated = byType(
      sceneToRenderRequest(
        sceneWith([video({ transform: { position: { x: 0.5, y: 0.5 }, size: { w: 0.5, h: 0.5 }, rotation: 90 } })]),
      ).elements,
      "video",
    );
    expect(rotated.z_rotation).toBe("90deg");
  });

  it("does not emit z_index on audio (not an AudioElement field)", () => {
    const a = byType(sceneToRenderRequest(sceneWith([audio()])).elements, "audio");
    expect("z_index" in a).toBe(false);
  });

  it("maps text glyph animations at character scope (blur/bounce/evaporate)", () => {
    const none = { animation: "none", animationParams: { length: 0, startTime: 0 } };
    const glyph = (animation: string) =>
      (
        byType(
          sceneToRenderRequest(
            sceneWith([
              text({
                animations: [
                  { animation, animationParams: { length: 0.5, startTime: 1 } },
                  none,
                  none,
                ],
              }),
            ]),
          ).elements,
          "text",
        ).motion as Array<{ type: string; reversed: boolean; scope: string }>
      )[0];
    expect(glyph("blur")).toMatchObject({ type: "blur", reversed: false, scope: "character" });
    expect(glyph("bounce")).toMatchObject({ type: "bounce", reversed: false, scope: "character" });
    expect(glyph("evaporate")).toMatchObject({ type: "evaporate", reversed: true, scope: "character" });
  });

  it("keeps element-family animations at element scope (bounceIn ≠ glyph bounce)", () => {
    const none = { animation: "none", animationParams: { length: 0, startTime: 0 } };
    const v = byType(
      sceneToRenderRequest(
        sceneWith([
          video({
            animations: [
              { animation: "bounceIn", animationParams: { length: 0.5, startTime: 0 } },
              none,
              none,
            ],
          }),
        ]),
      ).elements,
      "video",
    );
    expect((v.motion as Array<{ type: string; scope: string }>)[0]).toMatchObject({
      type: "bounce",
      scope: "element",
    });
  });

  it("maps editor transitions to API TransitionType, dropping unmapped/dangling/zero-duration", () => {
    const scene = {
      ...sceneWith([video({ id: "v1" }), video({ id: "v2" })]),
      transitions: {
        ok: { id: "ok", fromElementId: "v1", toElementId: "v2", kind: "crossfade", duration: 0.5 },
        unmapped: { id: "unmapped", fromElementId: "v1", toElementId: "v2", kind: "linear-blur", duration: 0.5 },
        dangling: { id: "dangling", fromElementId: "v1", toElementId: "ghost", kind: "slide-left", duration: 0.5 },
        zero: { id: "zero", fromElementId: "v1", toElementId: "v2", kind: "box", duration: 0 },
      },
    };
    expect(sceneToRenderRequest(scene).transitions).toEqual([
      { type: "cross_dissolve", from_id: "v1", to_id: "v2", duration: 0.5 },
    ]);
  });

  it("omits the transitions field entirely when none map", () => {
    const scene = {
      ...sceneWith([video({ id: "v1" }), video({ id: "v2" })]),
      transitions: {
        a: { id: "a", fromElementId: "v1", toElementId: "v2", kind: "ripple", duration: 0.5 },
      },
    };
    expect(sceneToRenderRequest(scene).transitions).toBeUndefined();
  });
});
