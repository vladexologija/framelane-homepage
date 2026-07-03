import {
  scaleFiltersToEngine,
  type Scene,
  type VideoElement,
  type AudioElement,
  type TextElement,
  type StickerElement,
  type ElementFilters,
} from "@frametake/scene-schema";

/**
 * Maps an editor `Scene` to a framelane `POST /v1/renders` request body.
 *
 * The editor's scene model and framelane's public render API are deliberately
 * different shapes (the editor mirrors render-node; the API is the documented
 * public contract), so this is the host-side adapter. Geometry: the scene stores
 * normalized **center** positions and canvas-relative sizes (0–1); the API takes
 * percentage strings with default center anchors, so the mapping is a direct
 * `value * 100 + "%"`. Time is seconds in both. Opacity 0–1 → 0–100. Color
 * correction is sent at the engine scale (the API passes it straight through),
 * via the same `scaleFiltersToEngine` the editor preview uses — so preview and
 * render match. Animations are mapped through an inverted copy of the API's
 * MOTION_MAP: only verified (type, direction) combinations are emitted; any
 * editor preset without a safe mapping is dropped rather than risk a 422.
 *
 * Still NOT mapped (render differs from preview until added):
 *   - `scene.transitions`: editor `kind` strings don't map 1:1 onto the API's
 *     `TransitionType` enum; an unmapped value would 422, so dropped for now.
 *   - `scene.subtitleTracks`: would need burning into `text` elements; deferred.
 *   - cinematic/per-glyph text presets (blur/explode/evaporate/…): need
 *     character-scope handling; dropped (safe) for now.
 */

export interface RenderElement {
  type: "video" | "audio" | "text" | "image";
  [key: string]: unknown;
}

export interface RenderTransition {
  type: string;
  from_id: string;
  to_id: string;
  duration: number;
}

export interface RenderRequest {
  width: number;
  height: number;
  duration: number;
  frame_rate: number;
  background_color: string;
  background_image_url?: string;
  elements: RenderElement[];
  transitions?: RenderTransition[];
}

const pct = (n: number): string => `${Number((n * 100).toFixed(4))}%`;
const opacity = (n: number): number => Math.round(n * 100);
const clampSpeed = (n: number): number => Math.min(4, Math.max(0.25, n));

const fontStyle = (bold: boolean, italic: boolean): string =>
  italic ? (bold ? "bolditalic" : "italic") : bold ? "bold" : "normal";

// Color correction: the editor's scene units → engine scale (the API forwards
// these verbatim to the renderer). Field renames: hue→hue_rotate, sharpen→sharpness.
// Only non-neutral (non-zero) values are emitted.
const colorAdjust = (f: ElementFilters): Record<string, number> => {
  const e = scaleFiltersToEngine(f);
  const out: Record<string, number> = {};
  if (e.brightness) out.brightness = e.brightness;
  if (e.contrast) out.contrast = e.contrast;
  if (e.saturation) out.saturation = e.saturation;
  if (e.exposure) out.exposure = e.exposure;
  if (e.hue) out.hue_rotate = e.hue;
  if (e.sharpen) out.sharpness = e.sharpen;
  if (e.blur) out.blur = e.blur;
  if (e.noise) out.noise = e.noise;
  if (e.vignette) out.vignette = e.vignette;
  return out;
};

const rotation = (deg: number) => (deg ? { z_rotation: `${deg}deg` } : {});

// ── Animations ──────────────────────────────────────────────────────────────
// Inverse of framelane's MOTION_MAP (api/translation/maps.py): editor engine
// animation id → API MotionType value + whether it's the reversed (exit) form.
// Only geometric, unambiguous presets are included; cinematic/per-glyph ones are
// intentionally omitted so we never emit an unsupported (type, direction) → 422.
export const MOTION: Record<
  string,
  { type: string; reversed: boolean; scope?: "character" }
> = {
  fade: { type: "fade", reversed: false },
  "out-fade": { type: "fade", reversed: true },
  slideUp: { type: "slide_up", reversed: false },
  "out-slideUp": { type: "slide_up", reversed: true },
  slideDown: { type: "slide_down", reversed: false },
  "out-slideDown": { type: "slide_down", reversed: true },
  slideLeft: { type: "slide_left", reversed: false },
  "out-slideLeft": { type: "slide_left", reversed: true },
  slideRight: { type: "slide_right", reversed: false },
  "out-slideRight": { type: "slide_right", reversed: true },
  zoomIn: { type: "zoom_in", reversed: false },
  "out-zoomOut": { type: "zoom_out", reversed: true },
  spinClockwise: { type: "rotate_cw", reversed: false },
  "out-spinClockwise": { type: "rotate_cw", reversed: true },
  spinAntiClockwise: { type: "rotate_ccw", reversed: false },
  "out-spinAntiClockwise": { type: "rotate_ccw", reversed: true },
  bounceIn: { type: "bounce", reversed: false },
  "out-bounceOut": { type: "bounce", reversed: true },
  wipeLeft: { type: "wipe_left", reversed: false },
  "out-wipeLeft": { type: "wipe_left", reversed: true },
  wipeRight: { type: "wipe_right", reversed: false },
  "out-wipeRight": { type: "wipe_right", reversed: true },
  wipeUp: { type: "wipe_up", reversed: false },
  "out-wipeUp": { type: "wipe_up", reversed: true },
  wipeDown: { type: "wipe_down", reversed: false },
  "out-wipeDown": { type: "wipe_down", reversed: true },
  kenBurnsIn: { type: "ken_burns_in", reversed: false },
  kenBurnsOut: { type: "ken_burns_out", reversed: false },
  kenBurnsInOut: { type: "ken_burns_in_out", reversed: false },
  "loop-jiggle": { type: "loop_wiggle", reversed: false },
  "loop-rotateBasic": { type: "loop_rotate", reversed: false },
  "loop-rotateSmooth": { type: "loop_rotate_smooth", reversed: false },
  "loop-3DSpin": { type: "loop_3d_spin", reversed: false },
  "loop-3DSway": { type: "loop_3d_sway", reversed: false },
  // Text glyph (per-character) animations. The API only supports these at
  // character scope (GLYPH_MOTION_MAP in api/translation/maps.py). All three ids
  // are text-only in the editor catalog, so they never collide with the element
  // family (which uses `bounceIn`, not `bounce`). `evaporate` is an exit — the
  // API treats it as exit-only and force-reverses it. (`explode` exists in the
  // API glyph map but the editor catalog can't produce it, so it is omitted.)
  bounce: { type: "bounce", reversed: false, scope: "character" },
  blur: { type: "blur", reversed: false, scope: "character" },
  evaporate: { type: "evaporate", reversed: true, scope: "character" },
};

interface RenderMotion {
  type: string;
  time: number;
  duration: number;
  reversed: boolean;
  scope: "element" | "character";
  loop?: boolean;
}

/** Elements that carry timeline animations + fades (video/text/sticker). */
interface Animatable {
  startTime: number;
  endTime: number;
  fadeIn: number;
  fadeOut: number;
  animation?: { id: string; startTime: number; duration: number } | null;
  animations?: ReadonlyArray<{
    animation: string;
    animationParams: { length: number; startTime: number };
  }>;
}

const toMotion = (
  animation: string,
  length: number,
  startTime: number,
): RenderMotion | null => {
  if (!animation || animation === "none") return null;
  const m = MOTION[animation];
  if (!m || !(length > 0)) return null;
  const motion: RenderMotion = {
    type: m.type,
    time: Math.max(0, startTime),
    duration: length,
    reversed: m.reversed,
    scope: m.scope ?? "element",
  };
  if (animation.startsWith("loop-")) motion.loop = true;
  return motion;
};

/** Preset entrance/exit/loop animations → API motion list (mapped subset only). */
const presetMotions = (el: Animatable): RenderMotion[] => {
  const out: RenderMotion[] = [];
  if (el.animations?.length) {
    for (const s of el.animations) {
      const m = toMotion(
        s.animation,
        s.animationParams?.length ?? 0,
        s.animationParams?.startTime ?? 0,
      );
      if (m) out.push(m);
    }
  } else if (el.animation) {
    const m = toMotion(
      el.animation.id,
      el.animation.duration,
      el.animation.startTime,
    );
    if (m) out.push(m);
  }
  return out;
};

/** Opacity fades for elements with no `fade_*_duration` field (text/image). */
const fadeMotions = (el: Animatable): RenderMotion[] => {
  const out: RenderMotion[] = [];
  if (el.fadeIn > 0)
    out.push({
      type: "fade",
      time: Math.max(0, el.startTime),
      duration: el.fadeIn,
      reversed: false,
      scope: "element",
    });
  if (el.fadeOut > 0)
    out.push({
      type: "fade",
      time: Math.max(0, el.endTime - el.fadeOut),
      duration: el.fadeOut,
      reversed: true,
      scope: "element",
    });
  return out;
};

const withMotion = (
  base: RenderElement,
  motions: RenderMotion[],
): RenderElement => (motions.length ? { ...base, motion: motions } : base);

// ── Effects ──────────────────────────────────────────────────────────────────
// Editor effect kernel name (scene `effects[]`, render-lib `effect_kernel.rs`) →
// framelane API EffectType value (inverse of api/translation/maps.py EFFECT_MAP).
// Unmapped names are dropped (preview-only) rather than risk a 422 — same
// drop-discipline as MOTION/TRANSITION.
export const EFFECT: Record<string, string> = {
  old: "vintage",
  polaroid: "polaroid",
  portra: "portra",
  super8: "super8",
  filmic: "filmic",
  dusty_film: "add_grain",
  film_burn: "film_burn",
  vhs: "vhs",
  vhs_overlay: "vhs_overlay",
  glitch_party: "glitch",
  mpeg_glitch: "compression_glitch",
  rgb_split: "rgb_split",
  rgb_split_dream: "chromatic_aberration",
  ghosting: "ghosting",
  displacement_nightmare: "displacement_map",
  crt: "crt",
  television: "television",
  scanlines_party: "scanlines",
  bokeh: "camera_lens_blur",
  bokeh_blur: "camera_lens_blur_bg",
  box_blur: "box_blur",
  pixelate: "mosaic",
  pixelate_blur: "mosaic_blur",
  pixelate_posterise: "mosaic_posterize",
  fish_eye: "optics_compensation",
  viewfinder: "viewfinder",
  invert: "invert",
  posterise: "posterize",
  halftone: "cc_halftone",
  halftone_red: "cc_halftone_red",
  halftone_green: "cc_halftone_green",
  halftone_blue: "cc_halftone_blue",
  night_vision: "night_vision",
  thermal_vision: "thermal",
  prisma: "prism",
  light_leaks: "light_leaks",
  lens_flare: "lens_flare",
  strobe: "strobe_light",
  snow: "snow",
  vignette_sepia: "sepia",
  dream_vision: "glow",
  ghost_dream: "echo",
};

const effectsField = (el: VideoElement): Record<string, unknown> => {
  const effects = (el.effects ?? [])
    .map((name) => EFFECT[name])
    .filter((t): t is string => !!t)
    .map((type) => ({ type }));
  return effects.length ? { effects } : {};
};

// ── Element mappers ──────────────────────────────────────────────────────────

const mapVideo = (el: VideoElement, z: number): RenderElement =>
  // Video fades are the audio ramp (fade_*_duration); visual entrance/exit comes
  // from the preset animations.
  withMotion(
    {
      type: "video",
      id: el.id,
      source_url: el.src,
      time: el.startTime,
      in_point: el.trimStart,
      out_point: el.trimEnd,
      speed: clampSpeed(el.playbackRate),
      x: pct(el.transform.position.x),
      y: pct(el.transform.position.y),
      width: pct(el.transform.size.w),
      height: pct(el.transform.size.h),
      ...rotation(el.transform.rotation),
      ...(el.flipX ? { flip_horizontal: true } : {}),
      ...(el.flipY ? { flip_vertical: true } : {}),
      opacity: opacity(el.filters.opacity),
      z_index: z,
      volume: Math.round(el.volume * 100),
      ...(el.fadeIn ? { fade_in_duration: el.fadeIn } : {}),
      ...(el.fadeOut ? { fade_out_duration: el.fadeOut } : {}),
      ...colorAdjust(el.filters),
      ...effectsField(el),
    },
    presetMotions(el),
  );

// Caller only invokes this for el.volume > 0: the API requires audio volume > 0
// (gt=0) and the renderer drops silent tracks anyway.
const mapAudio = (el: AudioElement): RenderElement => ({
  type: "audio",
  id: el.id,
  source_url: el.src,
  time: el.startTime,
  in_point: el.trimStart,
  out_point: el.trimEnd,
  speed: clampSpeed(el.playbackRate),
  volume: Math.round(el.volume * 100),
  ...(el.fadeIn ? { fade_in_duration: el.fadeIn } : {}),
  ...(el.fadeOut ? { fade_out_duration: el.fadeOut } : {}),
});

const mapImage = (el: StickerElement, z: number): RenderElement =>
  withMotion(
    {
      type: "image",
      id: el.id,
      source_url: el.src,
      time: el.startTime,
      duration: Math.max(0, el.endTime - el.startTime),
      x: pct(el.transform.position.x),
      y: pct(el.transform.position.y),
      width: pct(el.transform.size.w),
      height: pct(el.transform.size.h),
      ...rotation(el.transform.rotation),
      opacity: opacity(el.filters.opacity),
      z_index: z,
      ...colorAdjust(el.filters),
    },
    [...presetMotions(el), ...fadeMotions(el)],
  );

const mapText = (el: TextElement, scene: Scene, z: number): RenderElement =>
  withMotion(
    {
      type: "text",
      id: el.id,
      text: el.text,
      time: el.startTime,
      duration: Math.max(0, el.endTime - el.startTime),
      x: pct(el.transform.position.x),
      y: pct(el.transform.position.y),
      width: pct(el.transform.size.w),
      height: pct(el.transform.size.h),
      ...rotation(el.transform.rotation),
      opacity: opacity(el.filters.opacity),
      z_index: z,
      // Scene font sizes are fractions of canvas height; the API wants pixels
      // and requires font_size > 0.
      font_size: Math.max(1, Math.round(el.fontSize * scene.canvas.height)),
      font_family: el.fontFamily.split(",")[0]?.trim() || "Inter",
      font_weight: el.bold ? 700 : 400,
      font_style: fontStyle(el.bold, el.italic),
      text_color: el.color,
      text_align: el.align,
      leading: el.lineHeight,
      ...textDisplay(el),
    },
    [...presetMotions(el), ...fadeMotions(el)],
  );

// Background plate + outline. Background sets the `background` flag (display
// "block"); the outline emits `stroke_color`/`stroke_width` WITHOUT the `stroke`
// flag — setting it would switch the renderer to hollow outline-only mode, while
// leaving it off keeps filled text WITH an outline and lets background + outline
// coexist (the API's exclusive-display rule only gates the boolean flags).
// stroke_width is em-relative (outlineWidth/fontSize), the unit the renderer's
// `outline.size` expects (matches the editor's own export).
const textDisplay = (el: TextElement): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  if (el.backgroundColor) {
    out.background = true;
    out.background_color = el.backgroundColor;
  }
  if (el.outlineWidth > 0 && el.fontSize > 0) {
    out.stroke_color = el.outlineColor;
    out.stroke_width = el.outlineWidth / el.fontSize;
  }
  return out;
};

// Editor transition `kind` → framelane API TransitionType. Inverse of the API's
// TRANSITION_MAP (api/translation/maps.py): every API type is reachable, and
// `crossfade`/`dissolve` both collapse onto `cross_dissolve`. Editor kinds with
// no API target (linear-blur, rotate, circle-crop, cross-warp, splice,
// minimise-*, three-stripes, ripple, fold-*) are absent → dropped, since an
// unmapped value would 422.
export const TRANSITION: Record<string, string> = {
  crossfade: "cross_dissolve",
  dissolve: "cross_dissolve",
  "fade-black": "dip_to_black",
  "fade-white": "dip_to_white",
  "slide-left": "wipe_left",
  "slide-right": "wipe_right",
  "slide-up": "wipe_up",
  "slide-down": "wipe_down",
  "page-flip": "page_turn",
  "simple-zoom": "cross_zoom",
  "two-stripes": "band_wipe",
  box: "box_wipe",
  "sliding-door-horizontal": "barn_doors_horizontal",
  "sliding-door-vertical": "barn_doors_vertical",
  "diagonal-splice": "diagonal_wipe",
  "gradient-fade": "gradient_wipe",
  bullseye: "iris",
};

export function sceneToRenderRequest(scene: Scene): RenderRequest {
  const elements: RenderElement[] = [];
  // Elements that would fail the API's element-level validation are skipped (a
  // dropped element still lets the rest of the composition render, vs. one bad
  // element 422-ing the whole request).
  scene.elementOrder.forEach((id, z) => {
    const el = scene.elements[id];
    if (!el) return;
    if (el.kind === "video") {
      if (el.trimEnd > el.trimStart) elements.push(mapVideo(el, z));
    } else if (el.kind === "audio") {
      // API requires audio volume > 0 (gt=0) and out_point > in_point.
      if (el.volume > 0 && el.trimEnd > el.trimStart)
        elements.push(mapAudio(el));
    } else if (el.kind === "sticker") {
      if (el.endTime > el.startTime) elements.push(mapImage(el, z));
    } else if (el.kind === "text") {
      // API requires non-empty text and duration > 0.
      if (el.text.trim() && el.endTime > el.startTime)
        elements.push(mapText(el, scene, z));
    }
  });

  // Transitions: editor `kind` → API TransitionType. Drop any transition whose
  // kind has no API equivalent, whose duration isn't positive (API: gt=0), or
  // whose endpoints weren't emitted — same skip-discipline as elements, so one
  // bad transition can't 422 the whole request.
  const emittedIds = new Set(
    elements
      .map((e) => e.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0),
  );
  const transitions: RenderTransition[] = [];
  for (const t of Object.values(scene.transitions)) {
    const type = TRANSITION[t.kind];
    if (!type || !(t.duration > 0)) continue;
    if (!emittedIds.has(t.fromElementId) || !emittedIds.has(t.toElementId))
      continue;
    transitions.push({
      type,
      from_id: t.fromElementId,
      to_id: t.toElementId,
      duration: t.duration,
    });
  }

  return {
    width: scene.canvas.width,
    height: scene.canvas.height,
    duration: scene.duration,
    frame_rate: scene.fps,
    background_color: scene.backgroundColor,
    ...(scene.backgroundImage?.url
      ? { background_image_url: scene.backgroundImage.url }
      : {}),
    elements,
    ...(transitions.length ? { transitions } : {}),
  };
}
