/**
 * Zod mirror of the FrameLane `POST /v1/renders` request contract.
 *
 * Mirrors the Pydantic v2 models in `framelane-api/api/schemas/{request,elements,types,catalog}.py`
 * — the authoritative source. Pydantic uses the default `extra="ignore"`, so we
 * use plain `z.object` (strips unknown keys; not strict, not passthrough). This
 * schema is BEST-EFFORT client feedback: `validateRenderRequest` never mutates
 * what is sent (Render posts the raw text verbatim) and the server 422 is the
 * final authority. Enums come from `render/maps.ts` (single source).
 */
import { z } from "zod";
import {
  OUTPUT_FORMATS,
  MOTION_TYPES,
  MOTION_SCOPES,
  TRANSITION_TYPES,
  EFFECT_TYPES,
  WORD_ANIMATION_STYLES,
  EASINGS,
  BLEND_MODES,
  FONT_STYLES,
  TEXT_ALIGNS,
  TEXT_DECORATIONS,
  TEXT_WRAPS,
} from "@/lib/render/maps";

// ── scalar aliases (types.py) ────────────────────────────────────────────────
const Dimension = z.union([z.number(), z.string()]); // px number, "50%", "0deg"
const HexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, "must be #RRGGBB or #RRGGBBAA");
const Url = z.string().url();
const NormFloat = z.number().min(0).max(1);
const Percent = z.number().min(0).max(100);

// ── shared field groups (elements.py mixins) ─────────────────────────────────
const base = {
  id: z.string().optional(),
  name: z.string().optional(),
  track: z.number().int().min(0).max(255).optional(),
  time: z.number().min(0).optional(),
  visible: z.boolean().optional(),
};
const visual = {
  x: Dimension.optional(),
  y: Dimension.optional(),
  width: Dimension.optional(),
  height: Dimension.optional(),
  aspect_ratio: z.number().optional(),
  x_anchor: Dimension.optional(),
  y_anchor: Dimension.optional(),
  x_rotation: Dimension.optional(),
  y_rotation: Dimension.optional(),
  z_rotation: Dimension.optional(),
  x_scale: Dimension.optional(),
  y_scale: Dimension.optional(),
  flip_horizontal: z.boolean().optional(),
  flip_vertical: z.boolean().optional(),
  opacity: Percent.optional(),
  z_index: z.number().int().optional(),
  blend_mode: z.enum(BLEND_MODES).optional(),
  clip: z.boolean().optional(),
  color_overlay: HexColor.optional(),
};
const style = {
  border_radius: Dimension.optional(),
  border_color: HexColor.optional(),
  border_width: Dimension.optional(),
  shadow_color: HexColor.optional(),
  shadow_blur: Dimension.optional(),
  shadow_x: Dimension.optional(),
  shadow_y: Dimension.optional(),
};
const crop = {
  crop_top: NormFloat.optional(),
  crop_bottom: NormFloat.optional(),
  crop_left: NormFloat.optional(),
  crop_right: NormFloat.optional(),
};
const colorAdjust = {
  brightness: z.number().optional(),
  contrast: z.number().optional(),
  saturation: z.number().optional(),
  exposure: z.number().optional(),
  sharpness: z.number().optional(),
  blur: z.number().optional(),
  noise: z.number().optional(),
  vignette: z.number().optional(),
  hue_rotate: z.number().optional(),
};
const lut = {
  lut_url: Url.optional(),
  lut_intensity: Percent.optional(),
};

// ── sub-objects ──────────────────────────────────────────────────────────────
const ChromaKeyProps = z.object({
  hue_min: z.number().optional(),
  hue_max: z.number().optional(),
  sat_min: z.number().optional(),
  sat_max: z.number().optional(),
  lum_min: z.number().optional(),
  lum_max: z.number().optional(),
});
const Effect = z.object({
  type: z.enum(EFFECT_TYPES),
  intensity: Percent.optional(),
  chroma_settings: ChromaKeyProps.optional(),
});
const Motion = z.object({
  type: z.enum(MOTION_TYPES),
  time: z.number().min(0),
  duration: z.number().gt(0),
  easing: z.enum(EASINGS).optional(),
  reversed: z.boolean().optional(),
  scope: z.enum(MOTION_SCOPES).optional(),
  delay: z.number().optional(),
  loop: z.boolean().optional(),
});
const Word = z.object({
  text: z.string(),
  start: z.number().min(0),
  end: z.number().gt(0),
});
const WordAnimation = z.object({
  style: z.enum(WORD_ANIMATION_STYLES),
  words: z.array(Word).min(1),
});

// ── elements (discriminated union on `type`) ─────────────────────────────────
// VideoElement.source_url has a before-validator (elements.py) that rejects any
// extension outside mp4/mov/webm — mirror it (strip the query, take the last
// `.`-segment) so the client flags the format the server would 422 on.
const VideoUrl = Url.refine(
  (u) => {
    const ext = u.split("?")[0].toLowerCase().split(".").pop();
    return ext === "mp4" || ext === "mov" || ext === "webm";
  },
  { message: "unsupported video format; renderer accepts MP4, MOV, or WebM source files only" },
);
const videoEl = z.object({
  type: z.literal("video"),
  ...base,
  ...visual,
  ...style,
  ...crop,
  ...colorAdjust,
  ...lut,
  source_url: VideoUrl,
  in_point: z.number().min(0).optional(),
  out_point: z.number().gt(0).optional(),
  speed: z.number().min(0.25).max(4).optional(),
  volume: Percent.optional(),
  // No `ge` on the API fields (elements.py) — accept any number to avoid a
  // spurious client error the server would not raise.
  fade_in_duration: z.number().optional(),
  fade_out_duration: z.number().optional(),
  effects: z.array(Effect).optional(),
  motion: z.array(Motion).optional(),
});
const audioEl = z.object({
  type: z.literal("audio"),
  ...base,
  source_url: Url,
  in_point: z.number().min(0).optional(),
  out_point: z.number().gt(0).optional(),
  speed: z.number().min(0.25).max(4).optional(),
  volume: z.number().gt(0).max(100).optional(),
  fade_in_duration: z.number().optional(),
  fade_out_duration: z.number().optional(),
});
const textEl = z.object({
  type: z.literal("text"),
  ...base,
  ...visual,
  ...style,
  duration: z.number().gt(0),
  text: z.string().min(1),
  font_family: z.string().optional(),
  font_size: z.number().gt(0).optional(),
  font_weight: z.number().int().min(100).max(900).optional(),
  font_style: z.enum(FONT_STYLES).optional(),
  text_color: HexColor.optional(),
  text_align: z.enum(TEXT_ALIGNS).optional(),
  text_decoration: z.enum(TEXT_DECORATIONS).optional(),
  tracking: z.number().optional(),
  leading: z.number().optional(),
  stroke_color: HexColor.optional(),
  stroke_width: z.number().optional(),
  background_color: HexColor.optional(),
  background_opacity: Percent.optional(),
  x_padding: Dimension.optional(),
  y_padding: Dimension.optional(),
  background: z.boolean().optional(),
  stroke: z.boolean().optional(),
  shadow: z.boolean().optional(),
  text_wrap: z.enum(TEXT_WRAPS).optional(),
  word_animation: WordAnimation.optional(),
  animation_preset: z.string().optional(),
  motion: z.array(Motion).optional(),
});
const imageEl = z.object({
  type: z.literal("image"),
  ...base,
  ...visual,
  ...style,
  ...crop,
  ...colorAdjust,
  ...lut,
  id: z.string().min(1),
  duration: z.number().gt(0),
  source_url: Url,
  effects: z.array(Effect).optional(),
  motion: z.array(Motion).optional(),
});

const element = z.discriminatedUnion("type", [videoEl, audioEl, textEl, imageEl]);

const transition = z.object({
  type: z.enum(TRANSITION_TYPES),
  duration: z.number().gt(0),
  from_id: z.string().optional(),
  to_id: z.string().optional(),
  z_index: z.number().int().optional(),
});

export const renderRequestSchema = z
  .object({
    width: z.number().int().min(16).max(8192).optional(),
    height: z.number().int().min(16).max(8192).optional(),
    duration: z.number().gt(0).optional(),
    frame_rate: z.number().int().min(1).max(240).optional(),
    output_format: z.enum(OUTPUT_FORMATS).optional(),
    output_filename: z.string().optional(),
    background_color: HexColor.optional(),
    background_image_url: Url.optional(),
    alpha: z.boolean().optional(),
    elements: z.array(element).optional(),
    transitions: z.array(transition).optional(),
    metadata: z.record(z.string(), z.string()).optional(),
    webhook_url: Url.optional(),
    ingest_external: z.boolean().nullable().optional(),
  })
  // Cross-field validators (request.py / elements.py model_validators).
  .superRefine((val, ctx) => {
    if ((val.width == null) !== (val.height == null)) {
      ctx.addIssue({
        code: "custom",
        message: "width and height must both be provided or both omitted",
        path: [val.width == null ? "width" : "height"],
      });
    }
    // output_format defaults to mp4 server-side (request.py), so an omitted format
    // with alpha:true still 422s — check against the defaulted value.
    const fmt = val.output_format ?? "mp4";
    if (val.alpha && !["webm", "mov"].includes(fmt)) {
      ctx.addIssue({
        code: "custom",
        message: "alpha=true requires output_format webm or mov",
        path: ["alpha"],
      });
    }
    (val.elements ?? []).forEach((el, i) => {
      if (
        (el.type === "video" || el.type === "audio") &&
        el.in_point != null &&
        el.out_point != null &&
        el.out_point <= el.in_point
      ) {
        ctx.addIssue({
          code: "custom",
          message: `out_point (${el.out_point}) must be greater than in_point (${el.in_point})`,
          path: ["elements", i, "out_point"],
        });
      }
      if (el.type === "text") {
        const flags = (["background", "stroke", "shadow"] as const).filter((f) => el[f]);
        if (flags.length > 1) {
          ctx.addIssue({
            code: "custom",
            message: `only one of background, stroke, shadow may be true (got ${flags.join(", ")})`,
            path: ["elements", i, flags[1]],
          });
        }
      }
    });
  });

// ── public validation API ────────────────────────────────────────────────────
export type Severity = "error" | "warning";
export interface Issue {
  path: string;
  message: string;
  severity: Severity;
}
export type ValidationResult =
  | { jsonOk: false; value?: undefined; issues: Issue[]; hardErrors: number; warnings: number }
  | { jsonOk: true; value: unknown; issues: Issue[]; hardErrors: number; warnings: number };

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

/** Keys retained by the schema at each object → any others were stripped
 *  (Pydantic ignores them); surface as advisory warnings. */
function collectUnknownKeys(raw: unknown, kept: unknown, path: string, out: Issue[]): void {
  if (isObj(raw) && isObj(kept)) {
    for (const k of Object.keys(raw)) {
      const childPath = path ? `${path}.${k}` : k;
      if (!(k in kept)) {
        out.push({ path: childPath, message: `unknown field "${k}" is ignored by the API`, severity: "warning" });
      } else {
        collectUnknownKeys(raw[k], kept[k], childPath, out);
      }
    }
  } else if (Array.isArray(raw) && Array.isArray(kept)) {
    raw.forEach((r, i) => collectUnknownKeys(r, kept[i], `${path}[${i}]`, out));
  }
}

/** Soft "linter" warnings mirroring framelane-api/api/services/invariants.py. */
function collectInvariants(value: Obj, out: Issue[]): void {
  const elements = Array.isArray(value.elements) ? (value.elements as Obj[]) : [];
  const ids = new Set<string>();
  const seen = new Set<string>();
  for (const el of elements) {
    const id = typeof el.id === "string" ? el.id : undefined;
    if (id) {
      // invariants.py classifies DUPLICATE_ELEMENT_ID as an ERROR (ambiguous
      // transition targets), not a warning.
      if (ids.has(id) && !seen.has(id)) {
        out.push({ path: `element#${id}`, message: `duplicate element id "${id}"`, severity: "error" });
        seen.add(id);
      }
      ids.add(id);
    }
  }
  // invariants.py fires EMPTY_TIMELINE when no element is visible, which includes
  // an empty elements list (`not any(...)` is true for `[]`).
  if (elements.every((e) => e.visible === false)) {
    out.push({ path: "elements", message: "no visible elements (empty timeline)", severity: "warning" });
  }
  const reqDuration = typeof value.duration === "number" ? value.duration : undefined;
  elements.forEach((el, i) => {
    if (el.visible === false) return; // invariants.py skips hidden elements here
    const time = typeof el.time === "number" ? el.time : 0;
    if (reqDuration != null && time >= reqDuration) {
      out.push({ path: `elements[${i}].time`, message: `element starts at or after the render duration`, severity: "warning" });
    }
    if (el.type === "text" && isObj(el.word_animation)) {
      const dur = typeof el.duration === "number" ? el.duration : 0;
      const words = Array.isArray((el.word_animation as Obj).words) ? ((el.word_animation as Obj).words as Obj[]) : [];
      const outOfRange = words.some(
        (w) => (typeof w.start === "number" && w.start < time) || (typeof w.end === "number" && w.end > time + dur),
      );
      if (outOfRange) {
        out.push({ path: `elements[${i}].word_animation.words`, message: "a caption word falls outside the text time window", severity: "warning" });
      }
    }
  });
  const transitions = Array.isArray(value.transitions) ? (value.transitions as Obj[]) : [];
  transitions.forEach((t, i) => {
    const from = typeof t.from_id === "string" ? t.from_id : undefined;
    const to = typeof t.to_id === "string" ? t.to_id : undefined;
    // invariants.py classifies TRANSITION_SELF and DANGLING_TRANSITION as ERRORs.
    if (from && to && from === to) {
      out.push({ path: `transitions[${i}]`, message: "transition from_id and to_id are the same element", severity: "error" });
    }
    for (const [key, ref] of [["from_id", from], ["to_id", to]] as const) {
      if (ref && !ids.has(ref)) {
        out.push({ path: `transitions[${i}].${key}`, message: `transition references unknown element id "${ref}"`, severity: "error" });
      }
    }
  });
}

const count = (issues: Issue[], sev: Severity) => issues.filter((x) => x.severity === sev).length;

/** Validate render-request JSON text: syntax → zod schema (errors) → invariants
 *  + unknown keys (warnings). `value` is the parsed body verbatim (for Render). */
export function validateRenderRequest(text: string): ValidationResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    const issues: Issue[] = [{ path: "", message: e instanceof Error ? e.message : "Invalid JSON", severity: "error" }];
    return { jsonOk: false, issues, hardErrors: 1, warnings: 0 };
  }
  const issues: Issue[] = [];
  const parsed = renderRequestSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      issues.push({ path: issue.path.join("."), message: issue.message, severity: "error" });
    }
  } else {
    collectUnknownKeys(raw, parsed.data, "", issues);
    if (isObj(raw)) collectInvariants(raw, issues);
  }
  return { jsonOk: true, value: raw, issues, hardErrors: count(issues, "error"), warnings: count(issues, "warning") };
}
