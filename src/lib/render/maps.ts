/**
 * Shared render-request vocabulary — the single source of truth for the enums
 * and the API-to-editor reverse tables used by the render-request schema
 * (`renderRequestSchema.ts`) and the reverse mapper (`renderRequestToScene.ts`).
 *
 * MIRRORED VERBATIM from the FrameLane Python API (the authoritative render
 * contract). Regenerate if the API changes. Sources (sibling repo `framelane-api`):
 *   - api/schemas/types.py       — every enum value string below.
 *   - api/translation/maps.py    — MOTION_MAP / GLYPH_MOTION_MAP / EFFECT_MAP /
 *                                  WORD_ANIMATION_MAP (→ the *_TO_SCENE tables).
 * The forward mapper `sceneToRenderRequest.ts` keeps its own editor→API tables;
 * `render/maps.test.ts` asserts these reverse tables are exact inverses (no drift).
 */

// ── Enum value lists (api/schemas/types.py) ──────────────────────────────────

/** Element types accepted by the editor union. The API also defines
 *  `composition` (translator-rejected) and progress_bar/audio_visualization/
 *  countdown (not in the request union) — omitted here. */
export const ELEMENT_TYPES = ["video", "audio", "text", "image"] as const;
export const OUTPUT_FORMATS = ["mp4", "webm", "mov", "gif", "png", "jpg"] as const;
export const MOTION_SCOPES = ["element", "character"] as const;
export const EASINGS = ["linear", "ease_in", "ease_out", "ease_in_out"] as const;
export const BLEND_MODES = [
  "none", "multiply", "screen", "overlay", "darken", "lighten",
  "color_dodge", "color_burn", "hard_light", "soft_light",
] as const;
export const FONT_STYLES = ["normal", "italic", "bold", "bolditalic"] as const;
export const TEXT_ALIGNS = ["left", "center", "right"] as const;
export const TEXT_DECORATIONS = ["none", "underline", "strikethrough"] as const;
export const TEXT_WRAPS = ["wrap", "nowrap"] as const;
export const WORD_ANIMATION_STYLES = [
  "glow", "box", "scale_pop", "slide_up", "fly_in", "color",
] as const;

/** Fonts the playground's wasm-gpu preview actually renders as themselves. NOT
 *  from the API and NOT the full font picker — mirrored from the editor's wasm-gpu
 *  font loader (`frametake-frontend/src/engine/renderer/wasm-gpu/fonts.ts`): its
 *  bundled faces + the `FONT_ASSET_FACES` gstatic map. Every other family — system
 *  fonts (Arial/Georgia/…), other Google fonts, custom faces — falls back to the
 *  default in the preview, though it still renders server-side. Regenerate when the
 *  editor's font faces change (scripts/sync-editor.sh). */
export const PREVIEW_FONTS: ReadonlySet<string> = new Set([
  // bundled faces (initWithBundledFonts)
  "Inter", "Montserrat", "Roboto", "IBM Plex Mono",
  // FONT_ASSET_FACES (gstatic TTFs fetched into scene.font_assets)
  "IBM Plex Sans", "Poppins", "Open Sans", "Oswald", "Bebas Neue", "Anton",
  "Archivo Black", "Alfa Slab One", "Lemon", "Playfair Display", "Merriweather",
  "Lora", "Lobster", "Pacifico", "Caveat", "Dancing Script", "Bangers",
  "Permanent Marker", "Roboto Mono", "JetBrains Mono",
]);

export const MOTION_TYPES = [
  "fade", "slide_up", "slide_down", "slide_left", "slide_right",
  "zoom_in", "zoom_out", "rotate_cw", "rotate_ccw", "bounce",
  "wipe_left", "wipe_right", "wipe_up", "wipe_down",
  "ken_burns_in", "ken_burns_out", "ken_burns_in_out",
  "loop_wiggle", "loop_rotate", "loop_rotate_smooth", "loop_3d_spin", "loop_3d_sway",
  "blur", "bounce_motion", "explode", "evaporate", "overlay", "difference",
] as const;

export const TRANSITION_TYPES = [
  "cross_dissolve", "dip_to_black", "dip_to_white",
  "wipe_left", "wipe_right", "wipe_up", "wipe_down", "diagonal_wipe",
  "barn_doors_horizontal", "barn_doors_vertical", "iris", "page_turn",
  "cross_zoom", "gradient_wipe", "band_wipe", "box_wipe",
] as const;

export const EFFECT_TYPES = [
  "vintage", "polaroid", "portra", "super8", "filmic", "add_grain",
  "rgb_split", "ghosting", "displacement_map",
  "posterize", "mosaic", "mosaic_blur", "mosaic_posterize",
  "cc_halftone", "cc_halftone_blue", "cc_halftone_green", "cc_halftone_red", "invert",
  "optics_compensation", "viewfinder", "night_vision", "thermal",
  "camera_lens_blur", "camera_lens_blur_bg", "box_blur",
  "lens_flare", "strobe_light", "snow", "glow",
  "sepia", "echo", "chromatic_aberration",
  "vhs", "vhs_overlay", "crt", "television", "glitch", "compression_glitch",
  "scanlines", "prism", "light_leaks", "film_burn", "chroma_key",
] as const;

export type ElementType = (typeof ELEMENT_TYPES)[number];
export type MotionType = (typeof MOTION_TYPES)[number];
export type TransitionType = (typeof TRANSITION_TYPES)[number];
export type EffectType = (typeof EFFECT_TYPES)[number];
export type WordAnimationStyle = (typeof WORD_ANIMATION_STYLES)[number];

// ── Reverse tables: API value → editor Scene id ──────────────────────────────

/** `[entranceId, exitId]` editor animation ids; `null` = UNSUPPORTED in that
 *  direction. Mirror of api/translation/maps.py MOTION_MAP (element scope). */
export const MOTION_TO_SCENE: Record<MotionType, [string | null, string | null]> = {
  fade: ["fade", "out-fade"],
  slide_up: ["slideUp", "out-slideUp"],
  slide_down: ["slideDown", "out-slideDown"],
  slide_left: ["slideLeft", "out-slideLeft"],
  slide_right: ["slideRight", "out-slideRight"],
  zoom_in: ["zoomIn", null],
  zoom_out: [null, "out-zoomOut"],
  rotate_cw: ["spinClockwise", "out-spinClockwise"],
  rotate_ccw: ["spinAntiClockwise", "out-spinAntiClockwise"],
  bounce: ["bounceIn", "out-bounceOut"],
  wipe_left: ["wipeLeft", "out-wipeLeft"],
  wipe_right: ["wipeRight", "out-wipeRight"],
  wipe_up: ["wipeUp", "out-wipeUp"],
  wipe_down: ["wipeDown", "out-wipeDown"],
  ken_burns_in: ["kenBurnsIn", null],
  ken_burns_out: ["kenBurnsOut", null],
  ken_burns_in_out: ["kenBurnsInOut", null],
  loop_wiggle: ["loop-jiggle", null],
  loop_rotate: ["loop-rotateBasic", null],
  loop_rotate_smooth: ["loop-rotateSmooth", null],
  loop_3d_spin: ["loop-3DSpin", null],
  loop_3d_sway: ["loop-3DSway", null],
  blur: ["blur", null],
  bounce_motion: ["bounce_motion", null],
  explode: ["explode", null],
  evaporate: [null, "evaporate"],
  overlay: ["overlay", null],
  difference: ["difference", null],
};

/** Mirror of api/translation/maps.py GLYPH_MOTION_MAP (text, character scope). */
export const GLYPH_MOTION_TO_SCENE: Partial<
  Record<MotionType, [string | null, string | null]>
> = {
  fade: ["fade", "out-fade"],
  slide_up: ["slideUp", "out-slideUp"],
  slide_down: ["slideDown", "out-slideDown"],
  slide_left: ["slideLeft", "out-slideLeft"],
  slide_right: ["slideRight", "out-slideRight"],
  zoom_in: ["zoomIn", "out-zoomOut"],
  bounce: ["bounce", null],
  blur: ["blur", null],
  bounce_motion: ["bounce_motion", null],
  explode: ["explode", null],
  evaporate: [null, "evaporate"],
};

/** API EffectType → editor effect kernel name (api/translation/maps.py EFFECT_MAP
 *  value with the `effect_` prefix and `.frag` suffix stripped). `chroma_key`
 *  needs `chroma_settings` the Scene can't hold, so the mapper skips it. */
export const EFFECT_TO_SCENE: Record<EffectType, string> = {
  vintage: "old",
  polaroid: "polaroid",
  portra: "portra",
  super8: "super8",
  filmic: "filmic",
  add_grain: "dusty_film",
  rgb_split: "rgb_split",
  ghosting: "ghosting",
  displacement_map: "displacement_nightmare",
  posterize: "posterise",
  mosaic: "pixelate",
  mosaic_blur: "pixelate_blur",
  mosaic_posterize: "pixelate_posterise",
  cc_halftone: "halftone",
  cc_halftone_blue: "halftone_blue",
  cc_halftone_green: "halftone_green",
  cc_halftone_red: "halftone_red",
  invert: "invert",
  optics_compensation: "fish_eye",
  viewfinder: "viewfinder",
  night_vision: "night_vision",
  thermal: "thermal_vision",
  camera_lens_blur: "bokeh",
  camera_lens_blur_bg: "bokeh_blur",
  box_blur: "box_blur",
  lens_flare: "lens_flare",
  strobe_light: "strobe",
  snow: "snow",
  glow: "dream_vision",
  sepia: "vignette_sepia",
  echo: "ghost_dream",
  chromatic_aberration: "rgb_split_dream",
  vhs: "vhs",
  vhs_overlay: "vhs_overlay",
  crt: "crt",
  television: "television",
  glitch: "glitch_party",
  compression_glitch: "mpeg_glitch",
  scanlines: "scanlines_party",
  prism: "prisma",
  light_leaks: "light_leaks",
  film_burn: "film_burn",
  chroma_key: "chroma",
};

/** API word-animation style → editor caption animation id. Unlike the API's
 *  `WORD_ANIMATION_MAP` (whose values are *renderer* keys like `floatInBottom`),
 *  these must be members of the editor's smaller `CAPTION_ANIMATIONS` set
 *  (none/karaoke/highlight/boxHighlight/reveal/impactPop). slide_up/fly_in/color
 *  have no exact editor equivalent, so they use the closest available animation —
 *  best-effort *preview* only; render fidelity is unaffected (the raw JSON is
 *  POSTed verbatim). `render/maps.test.ts` asserts every value is a valid caption
 *  animation. */
export const WORD_ANIM_TO_CAPTION: Record<WordAnimationStyle, string> = {
  glow: "highlight",
  box: "boxHighlight",
  scale_pop: "impactPop",
  slide_up: "reveal",
  fly_in: "reveal",
  color: "highlight",
};

/** API transition type → editor transition `kind`. Inverse of the forward
 *  `TRANSITION` table in `sceneToRenderRequest.ts` (all 16 API types covered).
 *  Transitions map to editor *kinds*, not renderer ids, so this stays editor-side. */
export const TRANSITION_TO_SCENE_KIND: Record<TransitionType, string> = {
  cross_dissolve: "crossfade",
  dip_to_black: "fade-black",
  dip_to_white: "fade-white",
  wipe_left: "slide-left",
  wipe_right: "slide-right",
  wipe_up: "slide-up",
  wipe_down: "slide-down",
  diagonal_wipe: "diagonal-splice",
  barn_doors_horizontal: "sliding-door-horizontal",
  barn_doors_vertical: "sliding-door-vertical",
  iris: "bullseye",
  page_turn: "page-flip",
  cross_zoom: "simple-zoom",
  gradient_wipe: "gradient-fade",
  band_wipe: "two-stripes",
  box_wipe: "box",
};
