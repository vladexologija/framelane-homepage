import { describe, it, expect } from "vitest";
import { validateRenderRequest } from "./renderRequestSchema";

const j = (o: unknown) => JSON.stringify(o);
const base = { width: 1920, height: 1080, duration: 10, frame_rate: 30, background_color: "#000000" };
const errors = (o: unknown) => {
  const r = validateRenderRequest(j(o));
  return r.issues.filter((i) => i.severity === "error").map((i) => i.path);
};
const warnings = (o: unknown) => {
  const r = validateRenderRequest(j(o));
  return r.issues.filter((i) => i.severity === "warning");
};

describe("validateRenderRequest", () => {
  it("accepts a valid request with no errors", () => {
    const r = validateRenderRequest(j({ ...base, elements: [{ type: "video", source_url: "https://x/v.mp4", in_point: 0, out_point: 5 }] }));
    expect(r.jsonOk).toBe(true);
    expect(r.hardErrors).toBe(0);
  });

  it("reports a JSON syntax error", () => {
    const r = validateRenderRequest("{ not json ");
    expect(r.jsonOk).toBe(false);
    expect(r.hardErrors).toBe(1);
  });

  it("requires per-type fields", () => {
    expect(errors({ ...base, elements: [{ type: "video" }] })).toContainEqual("elements.0.source_url");
    expect(errors({ ...base, elements: [{ type: "text", duration: 2 }] })).toContainEqual("elements.0.text");
    expect(errors({ ...base, elements: [{ type: "image", source_url: "https://x/i.png", duration: 2 }] })).toContainEqual("elements.0.id");
    expect(errors({ ...base, elements: [{ type: "text", text: "hi" }] })).toContainEqual("elements.0.duration");
  });

  it("rejects unknown enum values and out-of-range numbers", () => {
    expect(errors({ ...base, elements: [{ type: "video", source_url: "https://x/v.mp4", effects: [{ type: "nope" }] }] })).toContainEqual("elements.0.effects.0.type");
    expect(errors({ ...base, elements: [{ type: "video", source_url: "https://x/v.mp4", opacity: 150 }] })).toContainEqual("elements.0.opacity");
    expect(errors({ ...base, elements: [{ type: "audio", source_url: "https://x/a.mp3", volume: 0 }] })).toContainEqual("elements.0.volume");
    expect(errors({ ...base, elements: [{ type: "video", source_url: "https://x/v.mp4", speed: 5 }] })).toContainEqual("elements.0.speed");
    expect(errors({ ...base, elements: [{ type: "text", text: "hi", duration: 2, font_weight: 50 }] })).toContainEqual("elements.0.font_weight");
  });

  it("enforces cross-field rules", () => {
    expect(errors({ ...base, elements: [{ type: "video", source_url: "https://x/v.mp4", in_point: 5, out_point: 3 }] })).toContainEqual("elements.0.out_point");
    expect(errors({ width: 1920, duration: 5, frame_rate: 30, background_color: "#000000", elements: [] })).toContainEqual("height");
    expect(errors({ ...base, alpha: true, output_format: "mp4", elements: [] })).toContainEqual("alpha");
    expect(errors({ ...base, elements: [{ type: "text", text: "hi", duration: 2, background: true, stroke: true }] })).toContainEqual("elements.0.stroke");
  });

  it("treats unknown keys as warnings, not errors", () => {
    const r = validateRenderRequest(j({ ...base, elements: [{ type: "video", source_url: "https://x/v.mp4", made_up_field: 1 }] }));
    expect(r.hardErrors).toBe(0);
    expect(r.warnings).toBeGreaterThan(0);
    expect(r.issues.some((i) => i.severity === "warning" && i.path.includes("made_up_field"))).toBe(true);
  });

  it("classifies duplicate-id and dangling/self transitions as errors (per invariants.py)", () => {
    const issue = (o: unknown, needle: string) =>
      validateRenderRequest(j(o)).issues.find((i) => i.message.includes(needle));

    const dup = issue({ ...base, elements: [
      { type: "video", id: "a", source_url: "https://x/v.mp4" },
      { type: "video", id: "a", source_url: "https://x/v2.mp4" },
    ] }, "duplicate");
    expect(dup?.severity).toBe("error");

    const dangling = issue({ ...base,
      elements: [{ type: "video", id: "a", source_url: "https://x/v.mp4" }],
      transitions: [{ type: "cross_dissolve", from_id: "a", to_id: "ghost", duration: 0.5 }] }, "unknown element id");
    expect(dangling?.severity).toBe("error");

    const self = issue({ ...base,
      elements: [{ type: "video", id: "a", source_url: "https://x/v.mp4" }],
      transitions: [{ type: "cross_dissolve", from_id: "a", to_id: "a", duration: 0.5 }] }, "same element");
    expect(self?.severity).toBe("error");
  });

  it("surfaces timeline invariants as warnings", () => {
    const word = warnings({ ...base, elements: [{ type: "text", id: "t", text: "hi", time: 0, duration: 1,
      word_animation: { style: "box", words: [{ text: "hi", start: 0, end: 5 }] } }] });
    expect(word.some((w) => w.message.includes("caption word"))).toBe(true);

    // Empty timeline fires even with zero elements (mirrors `not any(...)`).
    expect(warnings({ ...base, elements: [] }).some((w) => w.message.includes("empty timeline"))).toBe(true);
  });

  it("skips hidden elements in timeline invariants (mirrors invariants.py visible guard)", () => {
    const w = warnings({ ...base, duration: 5, elements: [
      { type: "video", id: "a", source_url: "https://x/v.mp4" }, // keeps the timeline non-empty
      { type: "video", id: "h", visible: false, time: 10, source_url: "https://x/v2.mp4" },
    ] });
    expect(w.some((x) => x.message.includes("at or after the render duration"))).toBe(false);
  });

  it("flags alpha=true even when output_format is omitted (server defaults to mp4)", () => {
    expect(errors({ ...base, alpha: true, elements: [] })).toContainEqual("alpha");
    // webm/mov is fine.
    expect(errors({ ...base, alpha: true, output_format: "webm", elements: [] })).not.toContainEqual("alpha");
  });

  it("rejects a non-mp4/mov/webm video source_url (mirrors the API before-validator)", () => {
    expect(errors({ ...base, elements: [{ type: "video", source_url: "https://x/clip.avi" }] })).toContainEqual("elements.0.source_url");
    // query strings are stripped before the extension check.
    expect(errors({ ...base, elements: [{ type: "video", source_url: "https://x/clip.mp4?token=abc" }] })).not.toContainEqual("elements.0.source_url");
  });

  it("accepts negative fade durations (API has no ge constraint)", () => {
    expect(errors({ ...base, elements: [{ type: "video", source_url: "https://x/v.mp4", fade_in_duration: -0.5 }] })).not.toContainEqual("elements.0.fade_in_duration");
    expect(errors({ ...base, elements: [{ type: "audio", source_url: "https://x/a.mp3", fade_out_duration: -1 }] })).not.toContainEqual("elements.0.fade_out_duration");
  });

  it("returns the parsed value verbatim (extras retained for the raw POST)", () => {
    const body = { ...base, elements: [{ type: "video", source_url: "https://x/v.mp4", crop_top: 0.1, made_up: true }] };
    const r = validateRenderRequest(j(body));
    expect(r.value).toEqual(body);
  });
});
