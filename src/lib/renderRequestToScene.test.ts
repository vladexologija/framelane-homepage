import { describe, it, expect } from "vitest";
import {
  isCaptionAnimation,
  ELEMENT_IN_ANIMATIONS,
  ELEMENT_OUT_ANIMATIONS,
  ELEMENT_LOOP_ANIMATIONS,
  TEXT_IN_ANIMATIONS,
  TEXT_OUT_ANIMATIONS,
  TEXT_LOOP_ANIMATIONS,
} from "@frametake/scene-schema";
import { MOTION_TYPES } from "@/lib/render/maps";
import { renderRequestToScene, collectPreviewIssues } from "./renderRequestToScene";
import { sceneToRenderRequest, type RenderRequest, type RenderElement } from "./sceneToRenderRequest";

const emittedAnimIds = (el: unknown): string[] =>
  ((el as { animations?: { animation?: string }[] }).animations ?? [])
    .map((a) => a?.animation)
    .filter((id): id is string => !!id && id !== "none");

/** Round-trip a pasted request through scene → request; the fields the editor
 *  Scene models must survive. */
function roundTrip(req: RenderRequest): RenderRequest {
  const scene = renderRequestToScene(req);
  expect(scene).not.toBeNull();
  return sceneToRenderRequest(scene!);
}

const el = (over: Partial<RenderElement> & { type: RenderElement["type"] }): RenderElement =>
  over as RenderElement;

describe("renderRequestToScene", () => {
  it("round-trips a video's geometry, timing, opacity, flips, fades", () => {
    const req: RenderRequest = {
      width: 1920,
      height: 1080,
      duration: 10,
      frame_rate: 30,
      background_color: "#101010",
      elements: [
        el({
          type: "video",
          id: "v1",
          source_url: "https://cdn.test/v.mp4",
          time: 1,
          in_point: 2,
          out_point: 6,
          speed: 2,
          x: "25%",
          y: "50%",
          width: "50%",
          height: "25%",
          z_rotation: "45deg",
          opacity: 80,
          z_index: 0,
          flip_horizontal: true,
          volume: 60,
          fade_in_duration: 0.5,
          fade_out_duration: 0.75,
        }),
      ],
    };
    const out = roundTrip(req);
    const v = out.elements[0] as Record<string, unknown>;
    expect(v.type).toBe("video");
    expect(v.source_url).toBe("https://cdn.test/v.mp4");
    expect(v.x).toBe("25%");
    expect(v.y).toBe("50%");
    expect(v.width).toBe("50%");
    expect(v.height).toBe("25%");
    expect(v.z_rotation).toBe("45deg");
    expect(v.opacity).toBe(80);
    expect(v.in_point).toBe(2);
    expect(v.out_point).toBe(6);
    expect(v.speed).toBe(2);
    expect(v.volume).toBe(60);
    expect(v.flip_horizontal).toBe(true);
    expect(v.fade_in_duration).toBe(0.5);
    expect(v.fade_out_duration).toBe(0.75);
  });

  it("round-trips video effects (inverse EFFECT table)", () => {
    const req: RenderRequest = {
      width: 1920, height: 1080, duration: 10, frame_rate: 30, background_color: "#000000",
      elements: [el({ type: "video", id: "v1", source_url: "https://cdn.test/v.mp4", in_point: 0, out_point: 5,
        effects: [{ type: "lens_flare" }, { type: "chromatic_aberration" }, { type: "add_grain" }] })],
    };
    const v = roundTrip(req).elements[0] as Record<string, unknown>;
    expect(v.effects).toEqual([{ type: "lens_flare" }, { type: "chromatic_aberration" }, { type: "add_grain" }]);
  });

  it("round-trips element + glyph motion (inverse MOTION tables)", () => {
    const req: RenderRequest = {
      width: 1920, height: 1080, duration: 10, frame_rate: 30, background_color: "#000000",
      elements: [
        el({ type: "video", id: "v1", source_url: "https://cdn.test/v.mp4", in_point: 0, out_point: 5,
          motion: [{ type: "slide_left", time: 0, duration: 0.5, reversed: false, scope: "element" }] }),
        el({ type: "text", id: "t1", text: "Hi", duration: 3, time: 0,
          motion: [{ type: "blur", time: 0, duration: 0.4, scope: "character" }] }),
      ],
    };
    const out = roundTrip(req);
    const v = out.elements.find((e) => (e as Record<string, unknown>).id === "v1") as Record<string, unknown>;
    const t = out.elements.find((e) => (e as Record<string, unknown>).id === "t1") as Record<string, unknown>;
    expect(v.motion).toEqual([expect.objectContaining({ type: "slide_left", reversed: false, scope: "element" })]);
    expect(t.motion).toEqual([expect.objectContaining({ type: "blur", scope: "character" })]);
  });

  it("round-trips text attributes", () => {
    const req: RenderRequest = {
      width: 1920, height: 1080, duration: 10, frame_rate: 30, background_color: "#000000",
      elements: [el({ type: "text", id: "t1", text: "Hello", time: 1, duration: 3, x: "25%", y: "50%",
        font_size: 108, font_family: "Inter", font_weight: 400, font_style: "italic", text_color: "#ff0000",
        text_align: "left", leading: 1.5 })],
    };
    const t = roundTrip(req).elements[0] as Record<string, unknown>;
    expect(t.type).toBe("text");
    expect(t.text).toBe("Hello");
    expect(t.font_size).toBe(108); // 108/1080 = 0.1 → *1080 = 108
    expect(t.font_family).toBe("Inter");
    expect(t.font_weight).toBe(400);
    expect(t.font_style).toBe("italic");
    expect(t.text_color).toBe("#ff0000");
    expect(t.text_align).toBe("left");
    expect(t.leading).toBe(1.5);
  });

  it("round-trips audio and transitions", () => {
    const req: RenderRequest = {
      width: 1920, height: 1080, duration: 10, frame_rate: 30, background_color: "#000000",
      elements: [
        el({ type: "video", id: "v1", source_url: "https://cdn.test/v.mp4", in_point: 0, out_point: 5 }),
        el({ type: "video", id: "v2", source_url: "https://cdn.test/v2.mp4", in_point: 0, out_point: 5 }),
        el({ type: "audio", id: "au1", source_url: "https://cdn.test/a.mp3", in_point: 0, out_point: 8, volume: 50 }),
      ],
      transitions: [{ type: "cross_dissolve", from_id: "v1", to_id: "v2", duration: 0.5 }],
    };
    const out = roundTrip(req);
    const au = out.elements.find((e) => (e as Record<string, unknown>).type === "audio") as Record<string, unknown>;
    expect(au.volume).toBe(50);
    expect(au.source_url).toBe("https://cdn.test/a.mp3");
    expect(out.transitions).toEqual([expect.objectContaining({ type: "cross_dissolve", from_id: "v1", to_id: "v2" })]);
  });

  it("maps a caption (text + word_animation) to a subtitle track with word timing", () => {
    const scene = renderRequestToScene({
      width: 1920, height: 1080, duration: 10, frame_rate: 30, background_color: "#000000",
      elements: [{
        type: "text", id: "cap", text: "hi there", time: 0, duration: 2,
        word_animation: { style: "box", words: [{ text: "hi", start: 0, end: 1 }, { text: "there", start: 1, end: 2 }] },
      }],
    });
    expect(scene).not.toBeNull();
    const tracks = Object.values(scene!.subtitleTracks);
    expect(tracks).toHaveLength(1);
    const cue = tracks[0].cues[0];
    expect(cue.words.map((w) => w.text)).toEqual(["hi", "there"]);
    expect(cue.words[1]).toMatchObject({ start: 1, end: 2 });
    expect(tracks[0].style.animation).toBe("boxHighlight");
    // The caption is NOT also emitted as a static text element.
    expect(Object.keys(scene!.elements)).toHaveLength(0);
  });

  it("only paints a caption block plate when background:true; else recolours the active word", () => {
    // color style, no `background` flag → no block plate; colour recolours the active word
    const noBlock = renderRequestToScene({
      width: 1080, height: 1920, frame_rate: 30, background_color: "#000000",
      elements: [{ type: "text", id: "c", text: "hi", time: 0, duration: 2, background_color: "#850000",
        word_animation: { style: "color", words: [{ text: "hi", start: 0, end: 2 }] } }],
    });
    const o1 = Object.values(noBlock!.subtitleTracks)[0].style.overrides!;
    expect(o1.backgroundColor ?? null).toBe(null);
    expect(o1.activeWordColor).toBe("#850000");
    expect(o1.activeWordBackground ?? null).toBe(null); // no pill for colour-highlight

    // box style routes the colour to the box (the only per-animation colour field)
    const boxed = renderRequestToScene({
      width: 1080, height: 1920, frame_rate: 30, background_color: "#000000",
      elements: [{ type: "text", id: "b", text: "hi", time: 0, duration: 2, background_color: "#47008E",
        word_animation: { style: "box", words: [{ text: "hi", start: 0, end: 2 }] } }],
    });
    const ob = Object.values(boxed!.subtitleTracks)[0].style.overrides!;
    expect(ob.animationColor).toBe("#47008E");
    expect(ob.backgroundColor ?? null).toBe(null);

    // background:true + opacity → block plate with the opacity baked into the alpha
    const withBlock = renderRequestToScene({
      width: 1080, height: 1920, frame_rate: 30, background_color: "#000000",
      elements: [{ type: "text", id: "c", text: "hi", time: 0, duration: 2, background: true,
        background_color: "#000000", background_opacity: 70,
        word_animation: { style: "glow", words: [{ text: "hi", start: 0, end: 2 }] } }],
    });
    const o2 = Object.values(withBlock!.subtitleTracks)[0].style.overrides!;
    expect(o2.backgroundColor).toBe("#000000b3"); // 70% → 0xB3
  });

  it("sizes text shadow_blur to match the render (em-relative, not height-relative)", () => {
    const scene = renderRequestToScene({
      width: 1920, height: 1080, duration: 10, frame_rate: 30, background_color: "#000000",
      elements: [{ type: "text", id: "t", text: "hi", duration: 3,
        font_size: 48, shadow: true, shadow_color: "#ff0000", shadow_blur: 20 }],
    });
    expect(scene).not.toBeNull();
    const t = scene!.elements.t as unknown as { shadowBlur: number; fontSize: number };
    // The engine renders shadow as scene.shadowBlur / scene.fontSize, and the API
    // sizes it as shadow_blur / canvas_width, so the ratio must equal 20/1920.
    // (The prior `shadow_blur / height` bug made this ~40x too large.)
    expect(t.shadowBlur / t.fontSize).toBeCloseTo(20 / 1920, 5);
  });

  it("maps every word_animation style to a valid editor caption animation", () => {
    for (const style of ["glow", "box", "scale_pop", "slide_up", "fly_in", "color"] as const) {
      const scene = renderRequestToScene({
        width: 1920, height: 1080, duration: 10, frame_rate: 30, background_color: "#000000",
        elements: [{ type: "text", id: "c", text: "hi", time: 0, duration: 2,
          word_animation: { style, words: [{ text: "hi", start: 0, end: 2 }] } }],
      });
      const track = Object.values(scene!.subtitleTracks)[0];
      expect(isCaptionAnimation(track.style.animation), `${style} -> ${track.style.animation}`).toBe(true);
    }
  });

  it("derives scene duration from element end-times when top-level duration is omitted", () => {
    const scene = renderRequestToScene({
      width: 1920, height: 1080, frame_rate: 30, background_color: "#000000",
      elements: [
        { type: "text", id: "a", text: "hi", time: 5, duration: 10 },  // ends 15
        { type: "text", id: "b", text: "yo", time: 50, duration: 10 },  // ends 60 (latest)
        { type: "video", id: "v", source_url: "https://x/v.mp4" },      // no out_point → not counted
        { type: "video", id: "v2", source_url: "https://x/v2.mp4", time: 0, in_point: 0, out_point: 5 }, // ends 5
      ],
    });
    expect(scene).not.toBeNull();
    expect(scene!.duration).toBe(60);
  });

  it("honors an explicit top-level duration over the derived one", () => {
    const scene = renderRequestToScene({
      width: 1920, height: 1080, duration: 12, frame_rate: 30, background_color: "#000000",
      elements: [{ type: "text", id: "a", text: "hi", time: 0, duration: 3 }],
    });
    expect(scene!.duration).toBe(12);
  });

  it("uses empty assetId for a pasted external source_url", () => {
    const scene = renderRequestToScene({
      width: 1920, height: 1080, duration: 10, frame_rate: 30, background_color: "#000000",
      elements: [{ type: "video", id: "v1", source_url: "https://cdn.test/v.mp4", in_point: 0, out_point: 5 }],
    });
    expect((scene!.elements.v1 as unknown as Record<string, unknown>).assetId).toBe("");
  });

  it("keeps every element when request ids collide (no silent overwrite)", () => {
    const scene = renderRequestToScene({
      width: 1920, height: 1080, duration: 20, frame_rate: 30, background_color: "#000000",
      elements: [
        { type: "text", id: "t1", text: "a", time: 0, duration: 2 },
        { type: "text", id: "t1", text: "b", time: 2, duration: 2 },
        { type: "text", id: "t1", text: "c", time: 4, duration: 2 },
      ],
    });
    const texts = Object.values(scene!.elements).filter((e) => (e as { kind: string }).kind === "text");
    expect(texts).toHaveLength(3);
    expect(texts.map((t) => (t as { text: string }).text).sort()).toEqual(["a", "b", "c"]);
    expect(scene!.elementOrder).toHaveLength(3);
  });

  it("orders elements by effective z_index (text above video/image; explicit z_index wins)", () => {
    const scene = renderRequestToScene({
      width: 1920, height: 1080, duration: 10, frame_rate: 30, background_color: "#000000",
      elements: [
        { type: "video", id: "bg", source_url: "https://x/v.mp4", in_point: 0, out_point: 5 }, // z=0
        { type: "text", id: "cap", text: "hi", time: 0, duration: 3 },                          // z=1 (text default)
        { type: "image", id: "logo", source_url: "https://x/l.png", duration: 3, z_index: 1 },  // z=1 (explicit)
      ],
    });
    // bg (z0) at the bottom; text + image (z1) above it. Within z=1, `cap`
    // (earlier in the array) renders on top of `logo`, so it is last (frontmost)
    // in the back-to-front elementOrder.
    expect(scene!.elementOrder).toEqual(["bg", "logo", "cap"]);
  });

  it("stacks same-z elements with the earlier one in the array on top", () => {
    const scene = renderRequestToScene({
      width: 1920, height: 1080, duration: 10, frame_rate: 30, background_color: "#000000",
      elements: [
        { type: "video", id: "vid2", source_url: "https://x/a.mp4", in_point: 0, out_point: 5 }, // z=0
        { type: "video", id: "vid1", source_url: "https://x/b.mp4", in_point: 0, out_point: 5 }, // z=0
      ],
    });
    // Both default to z=0; the earlier element (vid2) renders on top, so it is
    // last (frontmost) in the back-to-front elementOrder.
    expect(scene!.elementOrder).toEqual(["vid1", "vid2"]);
  });

  it("fills a no-out_point video from its time to the composition end (respects time, no overflow)", () => {
    const scene = renderRequestToScene({
      width: 1920, height: 1080, frame_rate: 30, background_color: "#000000",
      elements: [
        { type: "video", id: "bg", source_url: "https://x/v.mp4" },            // time 0 → [0, 60]
        { type: "video", id: "late", source_url: "https://x/v2.mp4", time: 30 }, // time 30 → [30, 60]
        { type: "text", id: "t", text: "hi", time: 50, duration: 10 },         // drives derived duration to 60
      ],
    });
    expect(scene!.duration).toBe(60);
    const span = (id: string) => {
      const e = scene!.elements[id] as unknown as { startTime: number; endTime: number };
      return [e.startTime, e.endTime];
    };
    expect(span("bg")).toEqual([0, 60]);
    expect(span("late")).toEqual([30, 60]); // time:30 respected; ends at the composition end, not 90
  });

  it("places a no-out_point clip at its probed source length instead of the composition end", () => {
    const durations = new Map<string, number>([
      ["https://x/short.mp4", 8], // real source is 8s, comp is 60s
      ["https://x/long.mp4", 90], // real source outlasts the comp
    ]);
    const scene = renderRequestToScene(
      {
        width: 1920, height: 1080, frame_rate: 30, background_color: "#000000",
        elements: [
          { type: "video", id: "short", source_url: "https://x/short.mp4" },          // [0, 8]
          { type: "video", id: "spedup", source_url: "https://x/short.mp4", speed: 2 }, // [0, 4] (8s / 2x)
          { type: "video", id: "long", source_url: "https://x/long.mp4" },             // clamped to [0, 60]
          { type: "video", id: "unknown", source_url: "https://x/none.mp4" },          // not probed → fills to 60
          { type: "text", id: "t", text: "hi", time: 50, duration: 10 },               // derives duration = 60
        ],
      },
      undefined,
      durations,
    );
    expect(scene!.duration).toBe(60);
    const el = (id: string) => scene!.elements[id] as unknown as { endTime: number; trimEnd: number };
    expect(el("short").endTime).toBe(8);
    expect(el("short").trimEnd).toBe(8);
    expect(el("spedup").endTime).toBe(4); // 8s of source at 2x = 4s of timeline
    expect(el("long").endTime).toBe(60); // clamped to the composition; renderer slices there too
    expect(el("unknown").endTime).toBe(60); // no probe → unchanged fallback
  });

  it("never emits an animation id outside its [in,out,loop] slot's set (any motion type/scope)", () => {
    const ELEMENT_SLOTS = [new Set(ELEMENT_IN_ANIMATIONS), new Set(ELEMENT_OUT_ANIMATIONS), new Set(ELEMENT_LOOP_ANIMATIONS)];
    const TEXT_SLOTS = [new Set(TEXT_IN_ANIMATIONS), new Set(TEXT_OUT_ANIMATIONS), new Set(TEXT_LOOP_ANIMATIONS)];
    const checkSlots = (el: unknown, sets: Set<string>[], label: string) => {
      const anims = (el as { animations?: { animation?: string }[] }).animations ?? [];
      anims.forEach((a, slot) => {
        if (a?.animation && a.animation !== "none") {
          // An id in the wrong slot (e.g. an entrance id in the exit slot) crashes
          // the wasm pump, so every emitted id must belong to its slot's set.
          expect(sets[slot].has(a.animation), `${label} slot ${slot} -> ${a.animation}`).toBe(true);
        }
      });
    };
    for (const type of MOTION_TYPES) {
      for (const scope of ["element", "character"] as const) {
        const scene = renderRequestToScene({
          width: 1080, height: 1920, duration: 10, frame_rate: 30, background_color: "#000000",
          elements: [
            { type: "video", id: "v", source_url: "https://x/v.mp4", in_point: 0, out_point: 5, motion: [{ type, time: 0, duration: 1, scope }] },
            { type: "text", id: "t", text: "hi", duration: 3, motion: [{ type, time: 0, duration: 1, scope }] },
          ],
        });
        expect(scene).not.toBeNull();
        checkSlots(scene!.elements.v, ELEMENT_SLOTS, `video ${type}/${scope}`);
        checkSlots(scene!.elements.t, TEXT_SLOTS, `text ${type}/${scope}`);
      }
    }
  });

  it("places an evaporate motion in the entrance slot (it is an entrance-only editor animation)", () => {
    const scene = renderRequestToScene({
      width: 1080, height: 1920, duration: 60, frame_rate: 30, background_color: "#000000",
      elements: [{ type: "text", id: "t", text: "bye", time: 50, duration: 10,
        motion: [{ type: "evaporate", time: 50, duration: 5 }] }],
    });
    const anims = (scene!.elements.t as unknown as { animations: { animation: string }[] }).animations;
    expect(anims[0].animation).toBe("evaporate"); // slot 0 (entrance), not slot 1 (exit)
    expect(anims[1].animation).toBe("none");
    expect(new Set(TEXT_IN_ANIMATIONS).has("evaporate")).toBe(true);
  });

  it("reports preview-dropped features (unsupported motion + chroma_key) via collectPreviewIssues", () => {
    const drops = collectPreviewIssues({
      width: 1080, height: 1920, duration: 10, frame_rate: 30, background_color: "#000000",
      elements: [
        { type: "text", id: "t", text: "hi", duration: 3, motion: [{ type: "difference", time: 0, duration: 1 }] },
        { type: "video", id: "v", source_url: "https://x/v.mp4", in_point: 0, out_point: 5, effects: [{ type: "chroma_key" }] },
      ],
    });
    expect(drops.some((d) => d.path.startsWith("elements[0]") && d.message.includes('"difference"'))).toBe(true);
    expect(drops.some((d) => d.path.startsWith("elements[1]") && d.message.includes("chroma_key"))).toBe(true);
  });

  it("warns when a text font isn't in the editor preview whitelist", () => {
    const drops = collectPreviewIssues({
      width: 1080, height: 1920, duration: 10, frame_rate: 30, background_color: "#000000",
      elements: [
        { type: "text", id: "a", text: "x", duration: 2, font_family: "Komika Axis" }, // unsupported → warn
        { type: "text", id: "b", text: "y", duration: 2, font_family: "Poppins" },      // supported → no warn
      ],
    });
    expect(drops.some((d) => d.path === "elements[0].font_family" && d.message.includes('"Komika Axis"'))).toBe(true);
    expect(drops.some((d) => d.message.includes("Poppins"))).toBe(false);
  });

  it("reports no preview drops for fully-supported features", () => {
    const drops = collectPreviewIssues({
      width: 1080, height: 1920, duration: 10, frame_rate: 30, background_color: "#000000",
      elements: [{ type: "video", id: "v", source_url: "https://x/v.mp4", in_point: 0, out_point: 5,
        motion: [{ type: "slide_left", time: 0, duration: 1 }], effects: [{ type: "vintage" }] }],
    });
    expect(drops).toEqual([]);
  });

  it("drops an unsupported `difference` element motion (preview-crash repro)", () => {
    const scene = renderRequestToScene({
      width: 1080, height: 1920, duration: 10, frame_rate: 30, background_color: "#000000",
      elements: [{ type: "text", id: "t122", text: "Albert", font_size: 260, duration: 4,
        motion: [{ type: "difference", time: 0, duration: 4 }] }],
    });
    expect(scene).not.toBeNull();
    expect(emittedAnimIds(scene!.elements.t122)).not.toContain("difference");
  });

  it("never throws on garbage / partial / advanced input", () => {
    expect(renderRequestToScene(null)).toBeNull();
    expect(renderRequestToScene("nope")).toBeNull();
    expect(renderRequestToScene(42)).toBeNull();
    expect(() => renderRequestToScene({})).not.toThrow();
    expect(() => renderRequestToScene({ elements: [{ type: "video" }, { type: "unknown" }, 5, null] })).not.toThrow();
    // advanced render-only fields are ignored, not fatal
    expect(() => renderRequestToScene({
      width: 1080, height: 1080, elements: [{ type: "image", id: "i", source_url: "https://x/i.png", duration: 2,
        crop_top: 0.1, lut_url: "https://x/l.cube", border_radius: 8 }],
    })).not.toThrow();
  });
});
