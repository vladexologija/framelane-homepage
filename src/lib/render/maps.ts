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
  // Bundled + hand-curated faces, plus the generated popular Google set that
  // engine/renderer/wasm-gpu/googleFontFaces.ts registers (regenerate via
  // scripts/sync-editor.sh when the editor's face map changes).
  "ABeeZee", "Abel", "Abril Fatface", "Acme",
  "Actor", "Advent Pro", "Alata", "Albert Sans",
  "Alegreya", "Alegreya Sans", "Aleo", "Alexandria",
  "Alfa Slab One", "Allura", "Almarai", "Alumni Sans",
  "Amaranth", "Amatic SC", "Amiri", "Anek Telugu",
  "Angkor", "Antic Slab", "Anton", "Antonio",
  "Archivo", "Archivo Black", "Archivo Narrow", "Arimo",
  "Arvo", "Asap", "Asap Condensed", "Assistant",
  "Atkinson Hyperlegible", "BIZ UDPGothic", "Baloo 2", "Bangers",
  "Barlow", "Barlow Condensed", "Barlow Semi Condensed", "Baskervville",
  "Be Vietnam Pro", "Bebas Neue", "Berkshire Swash", "Bitter",
  "Black Ops One", "Blinker", "Bodoni Moda", "Bree Serif",
  "Bungee", "Cabin", "Cairo", "Cantarell",
  "Cardo", "Catamaran", "Caveat", "Chakra Petch",
  "Changa", "Changa One", "Chango", "Chelsea Market",
  "Chivo", "Cinzel", "Comfortaa", "Comic Neue",
  "Commissioner", "Cookie", "Cormorant", "Cormorant Garamond",
  "Courgette", "Courier Prime", "Creepster", "Crete Round",
  "Crimson Pro", "Crimson Text", "DM Mono", "DM Sans",
  "DM Serif Display", "DM Serif Text", "Dancing Script", "Didact Gothic",
  "Domine", "Dosis", "EB Garamond", "Encode Sans",
  "Epilogue", "Exo", "Exo 2", "Figtree",
  "Fira Code", "Fira Sans", "Fira Sans Condensed", "Fjalla One",
  "Francois One", "Frank Ruhl Libre", "Fraunces", "Fredoka",
  "Fugaz One", "Gelasio", "Geologica", "Gilda Display",
  "Golos Text", "Gothic A1", "Gravitas One", "Great Vibes",
  "Gruppo", "Hammersmith One", "Hanken Grotesk", "Heebo",
  "Hind", "Hind Madurai", "Hind Siliguri", "IBM Plex Mono",
  "IBM Plex Sans", "IBM Plex Sans Arabic", "IBM Plex Sans Condensed", "IBM Plex Serif",
  "Inconsolata", "Indie Flower", "Instrument Sans", "Instrument Serif",
  "Inter", "Inter Tight", "JetBrains Mono", "Josefin Sans",
  "Jost", "Kalam", "Kanit", "Karla",
  "Kaushan Script", "Khand", "Kosugi Maru", "Kumbh Sans",
  "Lato", "League Gothic", "League Spartan", "Lemon",
  "Lexend", "Lexend Deca", "Lexend Giga", "Libre Barcode 39",
  "Libre Baskerville", "Libre Caslon Text", "Libre Franklin", "Lilita One",
  "Literata", "Lobster", "Lobster Two", "Lora",
  "Luckiest Guy", "M PLUS 1p", "M PLUS Rounded 1c", "Manrope",
  "Marcellus", "Martel", "Material Symbols Outlined", "Material Symbols Rounded",
  "Material Symbols Sharp", "Maven Pro", "Merriweather", "Merriweather Sans",
  "Monda", "Montserrat", "Montserrat Alternates", "Mukta",
  "Mulish", "Nanum Gothic", "Nanum Gothic Coding", "Nanum Myeongjo",
  "Neuton", "News Cycle", "Newsreader", "Noticia Text",
  "Noto Kufi Arabic", "Noto Naskh Arabic", "Noto Nastaliq Urdu", "Noto Sans",
  "Noto Sans Arabic", "Noto Sans Bengali", "Noto Sans Devanagari", "Noto Sans Display",
  "Noto Sans Hebrew", "Noto Sans JP", "Noto Sans KR", "Noto Sans Khmer",
  "Noto Sans Mono", "Noto Sans SC", "Noto Sans TC", "Noto Sans Tamil",
  "Noto Sans Telugu", "Noto Sans Thai", "Noto Serif", "Noto Serif JP",
  "Noto Serif KR", "Noto Serif TC", "Nunito", "Nunito Sans",
  "Old Standard TT", "Open Sans", "Orbitron", "Oswald",
  "Outfit", "Overpass", "Oxanium", "Oxygen",
  "PT Mono", "PT Sans", "PT Sans Caption", "PT Sans Narrow",
  "PT Serif", "Pacifico", "Passion One", "Patrick Hand",
  "Patua One", "Paytone One", "Permanent Marker", "Philosopher",
  "Play", "Playfair", "Playfair Display", "Plus Jakarta Sans",
  "Poppins", "Prata", "Press Start 2P", "Prompt",
  "Public Sans", "Quattrocento", "Questrial", "Quicksand",
  "Rajdhani", "Raleway", "Ramabhadra", "Readex Pro",
  "Red Hat Display", "Red Hat Text", "Righteous", "Roboto",
  "Roboto Condensed", "Roboto Mono", "Roboto Serif", "Roboto Slab",
  "Rokkitt", "Rowdies", "Rubik", "Rubik Mono One",
  "Russo One", "STIX Two Text", "Sacramento", "Saira",
  "Saira Condensed", "Sanchez", "Sarabun", "Satisfy",
  "Sawarabi Gothic", "Sawarabi Mincho", "Schibsted Grotesk", "Sen",
  "Shadows Into Light", "Share Tech", "Share Tech Mono", "Shippori Mincho",
  "Signika", "Signika Negative", "Slabo 27px", "Smooch Sans",
  "Sofia Sans", "Sofia Sans Condensed", "Sora", "Source Code Pro",
  "Source Sans 3", "Source Serif 4", "Space Grotesk", "Space Mono",
  "Special Elite", "Spectral", "Syne", "Tajawal",
  "Teko", "Tenor Sans", "Tinos", "Titan One",
  "Titillium Web", "Ubuntu", "Ubuntu Condensed", "Unbounded",
  "Unica One", "Unna", "Urbanist", "VT323",
  "Varela Round", "Viga", "Vollkorn", "Work Sans",
  "Yanone Kaffeesatz", "Yantramanav", "Yellowtail", "Zen Kaku Gothic New",
  "Zen Maru Gothic", "Zen Old Mincho", "Zeyada", "Zilla Slab",
]);

export const MOTION_TYPES = [
  "fade", "slide_up", "slide_down", "slide_left", "slide_right",
  "zoom_in", "zoom_out", "rotate_cw", "rotate_ccw", "bounce",
  "wipe_left", "wipe_right", "wipe_up", "wipe_down",
  "ken_burns_in", "ken_burns_out", "ken_burns_in_out",
  "loop_wiggle", "loop_rotate", "loop_rotate_smooth", "loop_3d_spin", "loop_3d_sway",
  "blur", "bounce_motion", "explode", "evaporate", "overlay", "difference",
  // F1 text preset pack (per-glyph)
  "rubber_in", "whip_up", "whip_down", "glitch_pop", "drift_in", "drift_out",
  "loop_breathe", "loop_shimmer",
  // F2/F9 element preset pack
  "swing_in", "swing_out", "elastic_rise", "elastic_drop", "tilt_zoom",
  "loop_orbit", "smooth_pop",
] as const;

export const TRANSITION_TYPES = [
  "cross_dissolve", "dip_to_black", "dip_to_white",
  "wipe_left", "wipe_right", "wipe_up", "wipe_down", "diagonal_wipe",
  "barn_doors_horizontal", "barn_doors_vertical", "iris", "page_turn",
  "cross_zoom", "gradient_wipe", "band_wipe", "box_wipe",
  // F5 dual-build transitions
  "swirl", "glitch_memories", "window_slice", "cube", "doorway", "pinwheel",
  "water_drop", "crosshatch", "dreamy", "angular", "burn", "heart",
  "circle_open", "color_phase", "squares_wire",
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
  "scanlines", "prism", "light_leaks", "film_burn",
  // F6 colour-grade wave
  "duotone", "cross_process", "bleach_bypass",
  "chroma_key",
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
  // F1 text preset pack
  rubber_in: ["rubberIn", null],
  whip_up: ["whipUp", null],
  whip_down: [null, "out-whipDown"],
  glitch_pop: ["glitchPop", null],
  drift_in: ["driftIn", null],
  drift_out: [null, "out-driftOut"],
  loop_breathe: ["loop-breathe", null],
  loop_shimmer: ["loop-shimmer", null],
  // F2/F9 element preset pack
  swing_in: ["swingIn", null],
  swing_out: [null, "out-swingOut"],
  elastic_rise: ["elasticRise", null],
  elastic_drop: [null, "out-elasticDrop"],
  tilt_zoom: ["tiltZoom", null],
  loop_orbit: ["loop-orbit", null],
  smooth_pop: ["smoothPop", null],
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
  // F1 text preset pack (per-glyph)
  rubber_in: ["rubberIn", null],
  whip_up: ["whipUp", null],
  whip_down: [null, "out-whipDown"],
  glitch_pop: ["glitchPop", null],
  drift_in: ["driftIn", null],
  drift_out: [null, "out-driftOut"],
  loop_breathe: ["loop-breathe", null],
  loop_shimmer: ["loop-shimmer", null],
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
  duotone: "duotone",
  cross_process: "cross_process",
  bleach_bypass: "bleach_bypass",
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
  // F5 dual-build transitions (API type -> editor kebab kind)
  swirl: "swirl",
  glitch_memories: "glitch-memories",
  window_slice: "window-slice",
  cube: "cube",
  doorway: "doorway",
  pinwheel: "pinwheel",
  water_drop: "water-drop",
  crosshatch: "crosshatch",
  dreamy: "dreamy",
  angular: "angular",
  burn: "burn",
  heart: "heart",
  circle_open: "circle-open",
  color_phase: "color-phase",
  squares_wire: "squares-wire",
};
