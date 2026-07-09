/**
 * Strip a render-request body down to the fields that actually carry
 * information: anything equal to the FrameLane API's documented default
 * (`framelane-api/api/schemas/{request,elements}.py`) is dropped, because an
 * absent field renders identically — the renderer fills the same default back in.
 *
 * Why this exists: the API stores and returns render requests FULLY EXPANDED
 * (every Pydantic default materialized), and a freshly-mapped scene carries the
 * same neutral geometry/style. Shown verbatim in the console's request panel
 * that's ~45 fields of mostly-default noise per element. This produces the
 * minimal equivalent — required fields plus whatever the user actually changed —
 * so a freshly-added element reads as just its essentials.
 *
 * Losslessness: dropping only default-valued fields is render-lossless (the
 * renderer refills the identical default) AND preview-lossless
 * (`renderRequestToScene` assumes the same defaults). The panel still POSTs this
 * body verbatim on Render, so it must stay equivalent to the expanded form — it
 * is.
 *
 * Kept even when equal to a default (dropping them would NOT be lossless, or they
 * anchor identity / stacking):
 *   - top-level `width`/`height` — omitting both falls back to a FIXED 1280×720
 *     (translator `_derive_canvas`), so any other size would change; also feeds
 *     the panel's size chip.
 *   - top-level `duration`       — omitting it re-derives from the elements
 *     (`_derive_duration`), which can differ.
 *   - element `id`               — required on images, referenced by transitions,
 *     and keeps scene ids stable across a JSON round-trip.
 *   - element `out_point`        — a concrete trim end (its "default" is the
 *     source length, which isn't known here).
 *   - text `font_size`           — meaningful, and the API default (16) differs
 *     from the preview mapper's assumption (48).
 *   - audio `volume`             — required (gt=0, no default).
 *   - `z_index`                  — kept UNLESS it equals the element's type
 *     default (0 for video/image/audio, 1 for text); dropping only-at-default is
 *     lossless and never changes effective stacking.
 *
 * Never throws (best-effort, like the sibling request mappers): a non-object, or
 * a malformed `elements`, is returned untouched.
 */

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);

// Sentinels for defaults that aren't a plain primitive.
const EMPTY_ARRAY = Symbol("[]");
const EMPTY_OBJECT = Symbol("{}");
const ZERO_DEG = Symbol("0deg"); // matches "0°" / "0deg" / "0" / 0

/** A value that means "zero degrees" in the API's `Dimension` rotation fields. */
const isZeroDeg = (v: unknown): boolean =>
  v === 0 || (typeof v === "string" && /^-?0(\.0+)?\s*(°|deg|rad)?$/.test(v.trim()));

function equalsDefault(value: unknown, def: unknown): boolean {
  if (def === EMPTY_ARRAY) return Array.isArray(value) && value.length === 0;
  if (def === EMPTY_OBJECT) return isObj(value) && Object.keys(value).length === 0;
  if (def === ZERO_DEG) return isZeroDeg(value);
  if (def === null) return value === null || value === undefined;
  return value === def;
}

// Top-level fields dropped when they equal the API default (request.py). NOT
// listed here → always kept: `width`, `height`, `duration`, `elements`.
const TOP_LEVEL_DEFAULTS: Record<string, unknown> = {
  frame_rate: 30,
  output_format: "mp4",
  output_filename: null,
  background_color: "#000000ff",
  background_image_url: null,
  alpha: false,
  transitions: EMPTY_ARRAY,
  metadata: EMPTY_OBJECT,
  webhook_url: null,
  ingest_external: null,
};

// Per-element fields dropped when they equal the API default (elements.py). One
// flat table across all element types — a key that doesn't apply to a type just
// won't be present. NOT listed here → always kept: `type`, `id`, `source_url`,
// `out_point`, `duration`, `text`, `font_size` (plus `z_index` and audio
// `volume`, handled specially in `minimizeElement`).
const ELEMENT_DEFAULTS: Record<string, unknown> = {
  // base
  name: null, track: null, time: 0, visible: true,
  // visual transform
  x: "50%", y: "50%", width: "100%", height: "100%", aspect_ratio: null,
  x_anchor: "50%", y_anchor: "50%",
  x_rotation: ZERO_DEG, y_rotation: ZERO_DEG, z_rotation: ZERO_DEG,
  x_scale: "100%", y_scale: "100%",
  flip_horizontal: false, flip_vertical: false,
  opacity: 100, blend_mode: "none", clip: false, color_overlay: null,
  // style
  border_radius: 0, border_color: null, border_width: 0,
  shadow_color: null, shadow_blur: 0, shadow_x: 0, shadow_y: 0,
  // crop
  crop_top: 0, crop_bottom: 0, crop_left: 0, crop_right: 0,
  // colour correction
  brightness: 0, contrast: 0, saturation: 0, exposure: 0, sharpness: 0,
  blur: 0, noise: 0, vignette: 0, hue_rotate: 0,
  // LUT
  lut_url: null, lut_intensity: 100,
  // media timing
  in_point: 0, speed: 1, volume: 100,
  fade_in_duration: 0, fade_out_duration: 0,
  // collections (dropped only when empty; non-empty entries are kept verbatim)
  effects: EMPTY_ARRAY, motion: EMPTY_ARRAY,
  // text
  font_family: "Inter", font_weight: 400, font_style: "normal",
  text_color: "#ffffff", text_align: "center", text_decoration: "none",
  text_wrap: "wrap",
  tracking: 0, leading: 1.2, stroke_color: null, stroke_width: 0,
  background_color: null, background_opacity: 100,
  x_padding: 0, y_padding: 0,
  background: false, stroke: false, shadow: false,
  word_animation: null, animation_preset: null,
};

function minimizeElement(el: unknown): unknown {
  if (!isObj(el)) return el;
  const type = el.type;
  const out: Obj = {};
  for (const [k, v] of Object.entries(el)) {
    if (k === "z_index") {
      // Equal to the type default (video/image/audio → 0, text → 1) → drop; the
      // API refills the same value, so effective stacking is unchanged.
      if (v === (type === "text" ? 1 : 0)) continue;
      out[k] = v;
      continue;
    }
    // Audio volume is required (gt=0, no default), so it's never a droppable default.
    if (k === "volume" && type === "audio") {
      out[k] = v;
      continue;
    }
    if (k in ELEMENT_DEFAULTS && equalsDefault(v, ELEMENT_DEFAULTS[k])) continue;
    out[k] = v;
  }
  return out;
}

/** Return an equivalent render request with every default-valued field removed. */
export function minimizeRenderRequest(request: unknown): unknown {
  if (!isObj(request)) return request;
  const out: Obj = {};
  for (const [k, v] of Object.entries(request)) {
    if (k === "elements") {
      out.elements = Array.isArray(v) ? v.map(minimizeElement) : v;
      continue;
    }
    if (k in TOP_LEVEL_DEFAULTS && equalsDefault(v, TOP_LEVEL_DEFAULTS[k])) continue;
    out[k] = v;
  }
  return out;
}
