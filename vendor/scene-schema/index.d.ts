/**
 * Curated caption style vocabulary — a subset of VEED's SubtitlePreset /
 * SubtitleAnimation (veed-app src/redux/types/subtitles.ts). render-node
 * renders these natively, so any preset/animation named here stays
 * export-compatible. The editor preview renders `visual` statically plus an
 * active-word highlight; full animation fidelity arrives with the render-lib
 * text path at export time.
 */
declare const CAPTION_PRESETS: readonly ["default", "plain", "block", "outline", "highlight", "boxHighlight", "karaoke", "social"];
type CaptionPreset = (typeof CAPTION_PRESETS)[number];
declare const CAPTION_ANIMATIONS: readonly ["none", "karaoke", "highlight", "boxHighlight", "reveal", "impactPop"];
type CaptionAnimation = (typeof CAPTION_ANIMATIONS)[number];
/**
 * Background plate SHAPE for text/captions (when a background colour is set).
 * `block` = one full plate behind the whole text; `lineHard`/`lineRound` = a
 * per-line plate with hard / rounded corners. Maps to the render lib's `display`
 * modes via {@link backgroundDisplayMode}.
 */
declare const TEXT_BACKGROUND_STYLES: readonly ["block", "lineHard", "lineRound"];
type TextBackgroundStyle = (typeof TEXT_BACKGROUND_STYLES)[number];
/** The render-lib text `display` mode for a background plate. The engine only
 * paints `bg` under a block mode; `'normal'` = no plate. SINGLE source of truth
 * so the preview (buildTextMoveable) and export (renderTask) cannot drift. */
declare const backgroundDisplayMode: (hasBackground: boolean, style?: TextBackgroundStyle) => "normal" | "block" | "line_block_hard" | "line_block_round";
/** Static visual properties the editor's bitmap text path can render today. */
interface CaptionVisual {
    fontFamily: string;
    /** Font size as a fraction of canvas height. */
    fontSize: number;
    bold: boolean;
    /** Render the caption text italic (e.g. a script/handwriting preset). */
    italic?: boolean;
    uppercase: boolean;
    color: string;
    /** null = no plate behind the text. */
    backgroundColor: string | null;
    /** Plate shape when `backgroundColor` is set (default `block`). */
    backgroundStyle?: TextBackgroundStyle;
    /** Outline width as a fraction of canvas height (0 = none). */
    outlineWidth: number;
    outlineColor: string;
    /** Colour applied to the currently-spoken word (active-word highlight). */
    activeWordColor: string;
    /** Background pill behind the active word, if any. */
    activeWordBackground: string | null;
    /** Colour fed to a colour-taking word animation (box-highlight box / colour-
     * highlight text). Only used by `boxHighlight`/`colourHighlight` (see
     * {@link resolveCaptionAnimation}); ignored by others. */
    animationColor?: string;
}
declare const CAPTION_PRESET_VISUALS: Record<CaptionPreset, CaptionVisual>;
declare const isCaptionPreset: (v: unknown) => v is CaptionPreset;
declare const isCaptionAnimation: (v: unknown) => v is CaptionAnimation;
declare const isTextBackgroundStyle: (v: unknown) => v is TextBackgroundStyle;
/**
 * Effective caption visual = the preset's defaults with the track's per-cue
 * `overrides` applied on top. The SINGLE resolver both the preview
 * (`captions.ts`) and the export (`renderTask.ts`) call, so a custom background /
 * colour / font shows identically in both.
 */
declare const resolveCaptionVisual: (preset: CaptionPreset, overrides?: Partial<CaptionVisual>) => CaptionVisual;
/** The extra-param key a colour-taking caption animation reads, or null when the
 * animation has no custom colour (veed `getExtraAnimationParam`). */
declare const captionAnimationColorParam: (animation: string) => "boxColour" | "textColour" | null;
/**
 * Engine animation key + extra params for a caption animation. A colour-taking
 * animation switches to its `…V2` variant and carries the chosen colour as an
 * extra param (veed `WGLDSubtitleItem`: `desc.key += 'V2'` + `addExtraParam`).
 * The SINGLE source both the preview and export use, so the box/highlight colour
 * matches. `'none'` animations never reach here.
 */
declare const resolveCaptionAnimation: (animation: string, color?: string) => {
    key: string;
    extraParams?: Array<{
        key: string;
        value: string;
    }>;
};
/** The effective colour for a colour-taking caption animation: an explicit
 * `animationColor` override wins, else the preset's intended highlight colour
 * (box → `activeWordBackground`, text → `activeWordColor`), else black. */
declare const captionAnimationColor: (visual: CaptionVisual, animation: string) => string;
/** Word count the way veed's `CalculateNumWords` splits (spaces/tabs/newlines).
 * Used to size a caption word animation's per-word window. */
declare const subtitleWordCount: (text: string) => number;
/** A caption word animation's per-word length: total cue length ÷ word count
 * (veed `BuildSubtitleWordTimings`: `desc.length = length / numWords`). */
declare const captionAnimationLength: (cueStart: number, cueEnd: number, text: string) => number;

/**
 * Scene model — the single source of truth for a project document, shared by
 * the editor (frametake-frontend), the agent backend (frametake-api), and —
 * via `renderTask.ts` — the future render-node export adapter.
 *
 * Design rules (mirrors the editor's ARCHITECTURE.md §1):
 *  - All geometry is NORMALISED (0–1, relative to canvas). No pixel values.
 *    Pixels exist only at boundaries (pointer code, WASM feed, render adapter).
 *  - Time is seconds (float) on a single timeline; media elements carry
 *    trimStart/trimEnd into their source plus playbackRate; `fps` is for
 *    frame snapping.
 *  - Elements reference assets by `assetId`; `src` is a RESOLVED URL injected
 *    by the API at read time (GCS signed URLs expire — never persist them).
 *  - Captions are a first-class subtitle track (word timings + style preset),
 *    NOT text elements.
 *  - Serialises directly to JSON — plain objects, no class instances.
 */

/** Centre point of an element, normalised to canvas (0–1). */
interface NormVec2 {
    x: number;
    y: number;
}
/** Size relative to canvas (0–1). */
interface NormSize {
    w: number;
    h: number;
}
interface Transform {
    /** Centre position, normalised. */
    position: NormVec2;
    /** Size, normalised to canvas. */
    size: NormSize;
    /** Rotation in degrees, clockwise. */
    rotation: number;
}
interface ElementFilters {
    /** Colour correction. Scene units −1..1, 0 = neutral (engine ±100 scale). */
    brightness: number;
    contrast: number;
    saturation: number;
    /** Exposure (stops). Scene units −1..1, 0 = neutral. */
    exposure: number;
    /** Hue rotation. Scene units −1..1 → −180..180°, 0 = no shift. */
    hue: number;
    /** Effects. Scene units 0..1, 0 = off (engine 0..100 scale). */
    sharpen: number;
    blur: number;
    noise: number;
    vignette: number;
    /** 0..1. */
    opacity: number;
}
declare const defaultFilters: () => ElementFilters;
/** Editor effect kernel name (`VideoElement.effects`) → the engine effect-shader
 * file the C++/render-node path resolves (the wasm-gl `shaderSources` map and the
 * render-node task `file`). Returns `null` for an empty/non-shader-safe name. The
 * single spelling mismatch is `posterize` → `effect_posterise.frag`. (The
 * wasm-gpu/Rust path doesn't use this — it resolves the kernel from the bare name
 * via `rustScene`.) */
declare const effectShaderFile: (name: string) => string | null;
/** The per-element colour/effect adjustments at the render engine's scale,
 * excluding `opacity` (which the engine takes as a separate top-level field).
 * The keys mirror render-node's `Adjustments::Parse`. */
interface EngineAdjustments {
    brightness: number;
    contrast: number;
    saturation: number;
    exposure: number;
    hue: number;
    sharpen: number;
    blur: number;
    noise: number;
    vignette: number;
}
/**
 * The SINGLE source of truth for scene-units → render-engine-units. Colour
 * (brightness/contrast/saturation/exposure) is ±1 → ±100, hue is ±1 → ±180°,
 * effects (sharpen/blur/noise/vignette) are 0..1 → 0..100 — matching
 * render-node `Adjustments.cpp`. Both consumers use this so the WebGL preview
 * and the headless export cannot drift apart:
 *  - the preview (`WasmGLSceneRenderer.mapBase`) sends the whole object every
 *    frame (a nested `filters` — the WASM keeps per-moveable adjustment state,
 *    so every field must be re-sent to overwrite a previously-set value);
 *  - the export (`engineAdjustments`) keeps only the non-zero entries, root-
 *    keyed, since the headless parser reads them at the moveable root and the
 *    engine's parse defaults are already 0-neutral.
 */
declare const scaleFiltersToEngine: (f: ElementFilters) => EngineAdjustments;
interface ElementAnimation {
    id: string;
    startTime: number;
    duration: number;
}
/**
 * One engine animation entry, mirroring the WGLD `AnimationData` the render lib
 * + render-node consume (veed `redux/types/common.ts`). `animation` is the preset
 * key (e.g. `'slideLeft'`, `'out-fade'`, `'loop-bounce'`); `'none'` = empty slot.
 * `calculateTimings: true` lets the engine compute per-keyframe/word/glyph timing
 * from `length`.
 */
interface AnimationData {
    animation: string;
    animationParams: {
        length: number;
        startTime: number;
        delay?: number;
        loop?: {
            length: number;
        };
        calculateTimings?: boolean;
    };
}
/** Per-element [entrance, exit, loop] animations (veed `MultiAnimations`). */
type MultiAnimations = [AnimationData, AnimationData, AnimationData];
/** Who created/last produced this element or cue (agent-diff + rollback). */
interface Origin {
    by: 'user' | 'agent';
    runId?: string | null;
}
type ElementKind = 'video' | 'audio' | 'text' | 'sticker';
interface BaseElement {
    readonly id: string;
    readonly kind: ElementKind;
    /** Position on the timeline, in seconds. */
    startTime: number;
    /** End on the timeline, in seconds. */
    endTime: number;
    /** Back-to-front order is owned by Scene.elementOrder; this is a tiebreak hint. */
    zIndex: number;
    animation: ElementAnimation | null;
    /**
     * Engine-native [in, out, loop] animations (mirrors veed's `MultiAnimations`).
     * When present, supersedes the legacy `animation` field. Start times are
     * re-derived from element timing at the render boundary (`resolveEngineAnimations`).
     */
    animations?: MultiAnimations;
    /** Fade-in duration at the clip start, in seconds (0 = none). */
    fadeIn: number;
    /** Fade-out duration at the clip end, in seconds (0 = none). */
    fadeOut: number;
    /** Provenance; absent/null means user-authored (pre-agent documents). */
    origin?: Origin | null;
}
interface VideoElement extends BaseElement {
    readonly kind: 'video';
    assetId: string;
    /** Resolved playable URL — injected at read time, never persisted as truth. */
    src: string;
    transform: Transform;
    filters: ElementFilters;
    volume: number;
    playbackRate: number;
    /** Seconds trimmed from the start of the source media. */
    trimStart: number;
    /** End of the used range within the source media, in source seconds. */
    trimEnd: number;
    flipX: boolean;
    flipY: boolean;
    loop: boolean;
    /** Named engine effects applied to the clip, e.g. `['vhs']`. Resolved by the
     * render engine's effect-kernel registry (render-lib `effect_kernel.rs`) — send
     * the kernel name (`vhs`, `super8`, `rgb_split`, `night_vision`, …). Empty/absent
     * = none. Single-effect in the UI today; the engine pipeline takes a list. */
    effects?: string[];
}
interface AudioElement extends BaseElement {
    readonly kind: 'audio';
    assetId: string;
    src: string;
    volume: number;
    playbackRate: number;
    trimStart: number;
    trimEnd: number;
}
type TextAlign = 'left' | 'center' | 'right';
interface TextElement extends BaseElement {
    readonly kind: 'text';
    text: string;
    transform: Transform;
    filters: ElementFilters;
    fontFamily: string;
    /** Font size as a fraction of canvas height (normalised). */
    fontSize: number;
    /** Line height as a multiple of font size. */
    lineHeight: number;
    color: string;
    align: TextAlign;
    bold: boolean;
    italic: boolean;
    backgroundColor: string | null;
    /** Background plate shape when `backgroundColor` is set (default `block`). */
    backgroundStyle?: TextBackgroundStyle;
    /** Text outline width as a fraction of canvas height (0 = none). */
    outlineWidth: number;
    outlineColor: string;
    /** Drop-shadow blur as a fraction of canvas height (0 = none). */
    shadowBlur: number;
    shadowColor: string;
}
interface StickerElement extends BaseElement {
    readonly kind: 'sticker';
    /** Set when the sticker is a stored asset (e.g. generated image). */
    assetId?: string | null;
    src: string;
    transform: Transform;
    filters: ElementFilters;
    /** Scalable (SVG/shape) vs raster (image). Affects texture upload path. */
    scalable: boolean;
}
type SceneElement = VideoElement | AudioElement | TextElement | StickerElement;
/** An element that has a spatial transform (everything except audio). */
type VisualElement = VideoElement | TextElement | StickerElement;
declare const isVisual: (el: SceneElement) => el is VisualElement;
/** A single word with source-accurate timing, in timeline seconds. */
interface SubtitleWord {
    start: number;
    end: number;
    text: string;
}
interface SubtitleCue {
    id: string;
    /** Timeline seconds. */
    start: number;
    end: number;
    text: string;
    /** Word-level timings within [start, end]; empty when unknown. */
    words: SubtitleWord[];
    speaker?: string | null;
    origin?: Origin | null;
}
interface SubtitleStyle {
    preset: CaptionPreset;
    animation: CaptionAnimation;
    /** Per-track visual tweaks layered on top of the preset (colour, background,
     * background shape, font, size, outline…). Resolved via `resolveCaptionVisual`. */
    overrides?: Partial<CaptionVisual>;
}
interface SubtitleTrack {
    id: string;
    /** BCP-47-ish language code, e.g. "en". */
    language: string;
    cues: SubtitleCue[];
    style: SubtitleStyle;
}
declare const defaultSubtitleStyle: () => SubtitleStyle;
interface Transition {
    id: string;
    fromElementId: string;
    toElementId: string;
    kind: string;
    duration: number;
}
interface Scene {
    readonly schemaVersion: number;
    canvas: {
        width: number;
        height: number;
    };
    backgroundColor: string;
    backgroundImage: {
        url: string;
    } | null;
    fps: number;
    /** Total timeline duration in seconds. */
    duration: number;
    elements: Record<string, SceneElement>;
    /** Back-to-front render order (element ids). */
    elementOrder: string[];
    subtitleTracks: Record<string, SubtitleTrack>;
    transitions: Record<string, Transition>;
}
declare const SCHEMA_VERSION = 1;
declare const createEmptyScene: () => Scene;

/**
 * Engine animation mapping — the SINGLE source of truth for turning a scene
 * element's stored animations into the engine-ready `AnimationData[]` that the
 * WGLD compositor consumes. Both the WebGL preview (`WasmGLSceneRenderer`) and
 * the headless export (`sceneToRenderTask`) call `resolveEngineAnimations`, so
 * the preview and the exported video cannot drift (the same discipline as
 * `scaleFiltersToEngine`).
 *
 * Logic ported from veed-app's `modules/common/Animations/utils.ts`
 * (`getStartTime` / the `[IN, OUT, LOOP]` model). FrameTake adaptation: start
 * times are RE-DERIVED from the element's current timing here rather than
 * trusted from storage, so moving/trimming a clip can never leave a stale
 * animation start. `calculateTimings: true` is always set — the engine computes
 * the intra-window keyframe/word/glyph timing from `length`.
 */

/** Slot order within {@link MultiAnimations}. */
declare const enum AnimationSlot {
    In = 0,
    Out = 1,
    Loop = 2
}
/** Default per-slot duration, seconds (veed `ANIMATION_DURATION` is 0.6). */
declare const ANIMATION_DURATION = 0.6;
declare const MIN_ANIMATION_DURATION = 0.2;
/** Minimal timing surface needed to place an animation. */
interface Timed {
    startTime: number;
    endTime: number;
}
/** An all-`'none'` triple — an element with no animations set. */
declare const animationDefaults: () => MultiAnimations;
declare const getElementTotalDuration: (el: Timed) => number;
declare const getEndTime: (el: Timed) => number;
/** IN/LOOP start at the element start; OUT ends at the element end. */
declare const getStartTime: (slot: AnimationSlot, el: Timed, length: number) => number;
/** Legacy single-entrance `animation` → a triple with only the IN slot set. */
declare const migrateLegacyAnimation: (a: ElementAnimation | null) => MultiAnimations | null;
/** Whether any of in/out/loop (or the legacy field) is set to a real preset. */
declare const isAnyAnimationSet: (el: {
    animation?: ElementAnimation | null;
    animations?: MultiAnimations;
}) => boolean;
/**
 * Re-stamp the stored triple's start times from the element's current timing.
 * Used by the inspector to keep stored data tidy; the render boundary
 * ({@link resolveEngineAnimations}) re-derives regardless, so this is advisory.
 */
declare const updateAnimationStartTime: (animations: MultiAnimations | undefined, startTime: number, endTime: number) => MultiAnimations;
/** UI-facing per-slot choice: which preset + how long (seconds). */
interface AnimationChoice {
    animation: string;
    duration: number;
}
/** The three editable slots the inspector presents (veed's In/Out/Loop tabs). */
interface CategoryAnimations {
    in: AnimationChoice;
    out: AnimationChoice;
    loop: AnimationChoice;
}
declare const defaultCategoryAnimations: () => CategoryAnimations;
/** Stored triple → editable per-slot choices for the inspector. */
declare const mapSavedAnimationsToCategories: (animations?: MultiAnimations) => CategoryAnimations;
/**
 * Inspector choices → the stored triple (ported from veed's
 * `mapCategoriesToSavedAnimations`). Start times are derived from the element's
 * timing; the loop's overall length tracks the element, with the chosen
 * duration as the loop cycle. `calculateTimings: true` lets the engine schedule.
 */
declare const mapCategoriesToSavedAnimations: (categories: CategoryAnimations, el: Timed) => MultiAnimations;
/**
 * The render boundary — the SINGLE source both the preview and the export
 * consume. Reads an element's animations (preferring the multi triple, falling
 * back to the legacy `animation`), re-derives each slot's start time from the
 * element's current timing, appends `fadeIn`/`fadeOut` as engine `fade`/
 * `out-fade` entries, drops `'none'` slots, and returns the engine-ready array.
 * Loop length tracks the full element duration. Because both consumers call
 * this, the WebGL preview and the headless export cannot drift.
 */
declare const resolveEngineAnimations: (el: Timed & {
    animation: ElementAnimation | null;
    animations?: MultiAnimations;
    fadeIn?: number;
    fadeOut?: number;
}) => AnimationData[];

/**
 * The animation preset palette — the set of engine preset keys the editor may
 * assign per slot, by element family. Keys mirror the JSON filenames shipped in
 * `@itishq/wasm-render-lib` (`elementAnimations/`, `elementAnimationsOut/`,
 * `elementAnimationsLoop/`, `textAnimations/`, `textAnimationsOut/`,
 * `textAnimationsLoop/`). `'none'` is a valid empty slot. Shared by the inspector
 * UI (option lists) and validation.
 */
declare const ELEMENT_IN_ANIMATIONS: readonly ["none", "fade", "slideLeft", "slideRight", "slideUp", "slideDown", "slideBounceLeft", "slideBounceRight", "slideBounceUp", "slideBounceDown", "floatLeft", "floatRight", "floatUp", "floatDown", "gentleFloatLeft", "gentleFloatRight", "gentleFloatUp", "gentleFloatDown", "wipeLeft", "wipeRight", "wipeUp", "wipeDown", "zoomIn", "pop", "drop", "bounceIn", "spinClockwise", "spinAntiClockwise", "kenBurnsIn", "kenBurnsOut", "kenBurnsInOut"];
declare const ELEMENT_OUT_ANIMATIONS: readonly ["none", "out-fade", "out-slideLeft", "out-slideRight", "out-slideUp", "out-slideDown", "out-slideBounceLeft", "out-slideBounceRight", "out-slideBounceUp", "out-slideBounceDown", "out-floatLeft", "out-floatRight", "out-floatUp", "out-floatDown", "out-gentleFloatLeft", "out-gentleFloatRight", "out-gentleFloatUp", "out-gentleFloatDown", "out-wipeLeft", "out-wipeRight", "out-wipeUp", "out-wipeDown", "out-zoomOut", "out-pop", "out-dropOut", "out-bounceOut", "out-spinClockwise", "out-spinAntiClockwise"];
declare const ELEMENT_LOOP_ANIMATIONS: readonly ["none", "loop-bounce", "loop-heartBeat", "loop-jiggle", "loop-sway", "loop-squeezy", "loop-rotateBasic", "loop-rotateSmooth", "loop-3DSpin", "loop-3DSway"];
declare const TEXT_IN_ANIMATIONS: readonly ["none", "fade", "slideLeft", "slideRight", "slideUp", "slideDown", "block", "compress", "stomp", "zoomIn", "scale", "ascent", "burst", "bounce", "wave", "wavey", "fall", "roll", "skid", "vogue", "billboard", "blur", "dragonfly", "evaporate", "flipboard", "typewriter", "verticalStretch"];
declare const TEXT_OUT_ANIMATIONS: readonly ["none", "out-fade", "out-slideLeft", "out-slideRight", "out-slideUp", "out-slideDown", "out-block", "out-decompress", "out-stomp", "out-zoomOut", "out-scale", "out-burst", "out-fall", "out-roll", "out-skid", "out-sink", "out-vogue", "out-billboard", "out-dragonfly", "out-flipboard", "out-verticalStretch", "out-wavey"];
declare const TEXT_LOOP_ANIMATIONS: readonly ["none", "loop-heartBeat", "loop-scale", "loop-slide", "loop-stretch", "loop-verticalStretch", "loop-roll", "loop-rotateBasic", "loop-vogue", "loop-wavey", "loop-billboard", "loop-dragonfly", "loop-flipboard"];
type ElementInAnimation = (typeof ELEMENT_IN_ANIMATIONS)[number];
type ElementOutAnimation = (typeof ELEMENT_OUT_ANIMATIONS)[number];
type ElementLoopAnimation = (typeof ELEMENT_LOOP_ANIMATIONS)[number];
type TextInAnimation = (typeof TEXT_IN_ANIMATIONS)[number];
type TextOutAnimation = (typeof TEXT_OUT_ANIMATIONS)[number];
type TextLoopAnimation = (typeof TEXT_LOOP_ANIMATIONS)[number];
/** Animation slot a preset belongs to. */
type AnimationSlotKind = 'in' | 'out' | 'loop';
/** Whether `kind` is a text element (text has its own richer preset palette). */
declare const animationPaletteFor: (family: "element" | "text", slot: AnimationSlotKind) => readonly string[];

/**
 * Export quality presets, modeled on veed's production ExportModal table
 * (draft → uhd; width-keyed resolution scaling, CRF quality curve, fps
 * caps). Used by BOTH render drivers so a quality choice means the same
 * thing regardless of engine. YouTube bitrate-mode presets are deferred
 * until a publish flow exists.
 */
interface ExportPreset {
    crf: number;
    /** x264 speed preset. */
    preset: 'veryfast' | 'fast' | 'medium';
    /** Output is scaled (down only) to fit this width, keeping aspect. */
    maxWidth: number;
    fpsLimit: number;
}
declare const EXPORT_PRESETS: {
    readonly draft: {
        readonly crf: 23;
        readonly preset: "veryfast";
        readonly maxWidth: 854;
        readonly fpsLimit: 30;
    };
    readonly standard: {
        readonly crf: 20;
        readonly preset: "veryfast";
        readonly maxWidth: 1280;
        readonly fpsLimit: 30;
    };
    readonly hd: {
        readonly crf: 20;
        readonly preset: "veryfast";
        readonly maxWidth: 1920;
        readonly fpsLimit: 30;
    };
    readonly uhd: {
        readonly crf: 20;
        readonly preset: "veryfast";
        readonly maxWidth: 4096;
        readonly fpsLimit: 60;
    };
};
type ExportQuality = keyof typeof EXPORT_PRESETS;
declare const EXPORT_QUALITIES: ExportQuality[];
/**
 * Scale canvas dimensions to fit the preset's maxWidth (never upscale),
 * rounded DOWN to even numbers — yuv420p encoders require both dimensions
 * even, and odd inputs are the classic libx264 failure.
 */
declare const scaledOutputSize: (width: number, height: number, quality: ExportQuality) => {
    width: number;
    height: number;
};

/**
 * Wire-format codec (v1) — the boundary between persisted/transported JSON and
 * the typed Scene. `encodeProject` serialises; `decodeProject` validates and
 * COERCES untrusted input into a valid Scene, filling defaults.
 *
 * `decodeProject` never throws on bad data — it repairs or drops it. This is a
 * superset-compatible port of the editor's original v1 adapter; documents
 * saved by the pre-API editor decode unchanged.
 */

interface ProjectWire {
    schemaVersion: number;
    scene: unknown;
}
declare const encodeProject: (scene: Scene) => ProjectWire;
declare const decodeProject: (wire: unknown) => Scene;

/**
 * Deterministic scene invariants — the first verification layer for
 * agent-produced (and user-saved) scenes. Pure: no I/O, no throwing; returns
 * a list of violations. Shared by the backend verifier and frontend tests.
 */

interface Violation {
    /** Stable machine code, e.g. "TRIM_OUT_OF_BOUNDS". */
    code: string;
    message: string;
    /** Where it happened: element id, track id, cue id… */
    path?: string;
}
/** What the verifier needs to know about an asset. Decoupled from the DB. */
interface AssetInfo {
    id: string;
    status: 'PENDING' | 'UPLOADED' | 'READY' | 'FAILED';
    durationSec?: number | null;
}
interface InvariantOptions {
    /** Map of assetId → info; when provided, asset references are checked. */
    assets?: ReadonlyMap<string, AssetInfo>;
    /**
     * Require video elements to form one contiguous, non-overlapping track
     * (what the agent's cut-list builder guarantees). Off for free-form
     * user-authored scenes.
     */
    expectContiguousVideo?: boolean;
    /** Target duration check (e.g. from an EditPlan), in seconds. */
    targetDuration?: {
        seconds: number;
        toleranceSec: number;
    };
}
declare const validateSceneInvariants: (scene: Scene, opts?: InvariantOptions) => Violation[];

/**
 * Scene → render-node headless task JSON.
 *
 * Grounded against render-node@main:
 *  - src/RenderNodeLib/render_node.cpp ParseHeadlessTask: `{ edit: {...}, uuid }`
 *    (or `params`), renderType "project"
 *  - src/RenderNodeLib/project_render_task_parse_json.cpp field names/defaults
 *  - scripts/pyrendertasks + benchmark fixtures for canonical examples
 *
 * Mapping notes (the parts that bite):
 *  - geometry is normalised 0–1 CENTER-origin in the task too (translateX/Y,
 *    width/height) — same space as the scene, no pixel conversion;
 *  - text `size` is a fraction of output WIDTH (scene fontSize is a fraction
 *    of height → multiply by H/W); text x/y are normalised positions;
 *  - audio streams use `onlineURL` (not `url`) and fadeIn/OutDuration;
 *  - opacity is 0–100 (default 100); filter fields are omitted when at scene
 *    defaults — the engine's parse defaults (0-neutral) differ from what the
 *    veed UI emits, so we only pass through deliberately-set values;
 *  - subtitle tracks are BURNED as styled text items (the parser has no
 *    `subtitles` field; veed pre-converts cues the same way). Word-synced
 *    animations (karaoke/highlight/…) are `animations` entries plus
 *    `customTimings.words` — the HEADLESS task parser only reads
 *    ParseTextAnimationTimings(jText)["customTimings"]["words"]; TextData
 *    re-emits them as the composition-level `words` array internally. All
 *    times are TIMELINE seconds (SlugTextRenderer compares word starts to
 *    frame.timelineTime; veed's getAnimationWordsTimings is absolute too);
 *  - video/text `fadeIn/fadeOut` are VISUAL fades in the scene; the engine's
 *    `fadeInDuration/fadeOutDuration` on videos only ramp AUDIO volume
 *    (decode_node), so visual fades go as `fade`/`out-fade` element
 *    animations (the veed Animations panel convention) and the duration
 *    fields are kept for the audio ramp;
 *  - text outline/shadow go as the STRUCTURED `outline {size,color}` /
 *    `shadow {size,color,offset}` objects (TextMoveable reads them from
 *    rawJson); `size` is a fraction of the em (engine multiplies by
 *    viewport.width * fontSize), hence outlineWidth / fontSize;
 *  - the parser CULLS audio streams with volume <= 0 silently — we skip them
 *    here so the loss is explicit at adapter level;
 *  - asset URLs are resolved fresh by the caller (signed URLs expire — the
 *    stored scene never contains usable URLs);
 *  - stickers require BOTH uuid and onlineURL (parser skips otherwise);
 *    ParseFields reads position {x,y} / size {width,height} — the key 'w'
 *    is NOT recognised by the vec2 reader.
 */
interface RenderTaskOptions {
    /** Maps element.assetId → downloadable URL reachable by the renderer. */
    resolveAssetUrl: (assetId: string) => string | null;
    projectName?: string;
    /** Output framerate cap; defaults to the scene fps. */
    fpsLimit?: number;
    /** Quality preset (resolution scale + CRF + fps cap); default 'hd'. */
    quality?: ExportQuality;
    /** Custom font files for families outside the engine's built-in lists. */
    fontAssets?: Array<{
        font: string;
        url: string;
    }>;
    uuid: string;
}
interface RenderTask {
    edit: Record<string, unknown>;
    uuid: string;
}
declare const sceneToRenderTask: (scene: Scene, opts: RenderTaskOptions) => RenderTask;
/** Agent-facing transition kinds (everything the engine can draw). */
declare const TRANSITION_KINDS: [string, ...string[]];
/** Engine shader name for a transition kind (pass-through if already prefixed). */
declare const transitionTypeFor: (kind: string) => string;

/** sRGB straight-alpha colour, 0–1 (render-lib `Color`). */
interface RustColor {
    r: number;
    g: number;
    b: number;
    a: number;
}
interface RustCrop {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
interface RustTransform {
    /** Centre position, normalised — `[x, y]`. */
    position: [number, number];
    /** Size, normalised to canvas — `[w, h]`. */
    size: [number, number];
    rotation_degrees: number;
}
interface RustFontRef {
    family: string;
    weight: number;
    italic: boolean;
}
interface RustTextDecoration {
    background_color?: RustColor;
    outline_color?: RustColor;
    outline_width: number;
    shadow_color?: RustColor;
    shadow_offset: [number, number];
    shadow_blur: number;
}
/**
 * Colour/effect adjustments at the engine's SHADER scale (render-lib `effects.rs`
 * AdjustmentUniforms): brightness/contrast/saturation are multipliers (1 = neutral),
 * exposure/hue_degrees/sharpen/blur/noise/vignette are additive (0 = neutral). The
 * converter pre-applies the engine's own `from_legacy_sliders` math, so these are
 * final uniform values, not slider units.
 */
interface RustAdjustments {
    brightness: number;
    contrast: number;
    saturation: number;
    exposure: number;
    hue_degrees: number;
    sharpen: number;
    blur: number;
    noise: number;
    vignette: number;
}
/** The kind's `effects` pipeline → render-lib `EffectPipeline`: colour
 * `adjustments` plus any named effect kernels (resolved by name in the engine). */
interface RustEffects {
    adjustments: RustAdjustments;
    /** Named effect kernels (render-lib `EffectDesc`). `shader_id: ''` makes the
     * engine resolve the kernel from `name`; `intensity`/`props` are sent
     * explicitly because some shipped engine builds don't `#[serde(default)]`
     * them — a missing field fails the whole scene deserialization. */
    effects?: {
        name: string;
        shader_id: string;
        intensity: number;
        props: Record<string, number>;
    }[];
}
type RustMoveableKind = {
    type: 'video';
    texture_id: string;
    opacity: number;
    crop: RustCrop;
    flip_x: boolean;
    flip_y: boolean;
    effects?: RustEffects;
} | {
    type: 'image';
    texture_id: string;
    opacity: number;
    crop: RustCrop;
    flip_x: boolean;
    flip_y: boolean;
    effects?: RustEffects;
} | {
    type: 'text';
    text: string;
    font: RustFontRef;
    /** Absolute font size, px (resolution space). */
    font_size: number;
    align: 'left' | 'center' | 'right';
    /** Background plate mode (render-lib `text.rs` TextDisplayMode): `block` =
     * one combined plate; `line_block_hard`/`line_block_round` = one plate per
     * wrapped line (sharp / rounded); `normal` = no plate. */
    display: 'normal' | 'block' | 'line_block_hard' | 'line_block_round';
    /** Wrapping mode (render-lib `text.rs` TextWrapMode); 'none' = one line, clip. */
    text_wrap: 'none' | 'word' | 'character';
    /** Text-box width, px. */
    wrap_width: number;
    line_height: number;
    letter_spacing: number;
    color: RustColor;
    opacity: number;
    decoration: RustTextDecoration;
    /** Per-glyph text animations; engine hydrates keyframes by `name`. */
    text_animations?: RustTextAnimationSpec[];
    /** Per-word timings (caption word-sync); render-lib `text.rs` TextTiming. */
    timings?: RustTextTiming[];
    /** Caption active-word box highlight (render-lib `text.rs` WordHighlight):
     * a coloured box behind the active word; `words` reuse the TextTiming
     * shape (`from`/`to` are moveable-local seconds). */
    word_highlight?: {
        color: RustColor;
        words: RustTextTiming[];
    };
};
/**
 * A word's character span + timeline window, driving word-synced caption
 * animations (render-lib `text.rs` TextTiming). `start`/`end` index into the
 * (rendered) text; `from`/`to` are timeline seconds.
 */
interface RustTextTiming {
    start: number;
    end: number;
    from: number;
    to: number;
}
/**
 * An in/out/loop (or fade) animation. Carries only `{name, start_time, length,
 * loop?}` — NO `tracks`: the engine's `hydrate_scene_animations` resolves the
 * keyframes from `builtin_element_animation_spec(name)` (render-lib
 * `animation.rs`) when tracks are empty, and overwrites `group`/`length` from
 * the builtin. `start_time`/`length` are timeline seconds (same clock as
 * `timeline.from/to`); `loop` makes the keyframe cycle repeat instead of clamp.
 */
interface RustAnimationSpec {
    name: string;
    start_time: number;
    length: number;
    loop?: boolean;
}
/**
 * A per-glyph text animation (render-lib `text.rs` TextAnimationSpec), carried on
 * the text `kind`. Name-only (no `keyframes`): the engine hydrates from
 * `builtin_text_animation_spec(name)`. `params` bundles timing; the engine keeps
 * scene `params` only when they differ from its default `{start_time:0, length:1,
 * delay:0}` — so the builtin per-glyph `delay` (stagger) survives an IN animation
 * left at the default window, but a custom window drops it (a known v1 nuance).
 */
interface RustTextAnimationSpec {
    name: string;
    params: {
        start_time: number;
        length: number;
        delay?: number;
    };
    loop?: boolean;
}
interface RustMoveable {
    id: string;
    timeline: {
        from: number;
        to: number;
    };
    transform: RustTransform;
    z_index: number;
    /** In/out/loop + fade animations; engine hydrates keyframes by `name`. */
    element_animations?: RustAnimationSpec[];
    kind: RustMoveableKind;
}
/**
 * A cross-element transition (render-lib `transition.rs` Transition). `from`/`to`
 * are the paired moveable ids; `timeline` is the explicit play window in seconds
 * (`progress_at` maps it to 0..1); `kind` is a Rust `TransitionKind` enum value.
 */
interface RustTransition {
    from: string;
    to: string;
    timeline: {
        from: number;
        to: number;
    };
    kind: string;
}
interface RustScene {
    version: number;
    resolution: {
        width: number;
        height: number;
    };
    background: RustColor;
    moveables: RustMoveable[];
    transitions: RustTransition[];
    /** TODO(v2): custom fonts; v1 relies on the renderer's bundled font faces. */
    fontAssets: unknown[];
}
/** Parse a CSS hex colour (`#rgb` / `#rgba` / `#rrggbb` / `#rrggbbaa`) → 0–1 rgba. */
declare const hexToRustColor: (hex: string) => RustColor;
/**
 * FrameTake transition kind → Rust `TransitionKind` enum value, mirroring the
 * render-node C++→Rust bridge (`rust_scene_bridge.cpp`) which wires exactly these
 * SEVEN. Anything else returns null and the transition is skipped — so the Rust
 * preview supports precisely what the Rust EXPORT does (preview == export). Friendly
 * names, `transition_`-prefixed shader names, and raw Rust names are all accepted.
 */
declare const rustTransitionKind: (kind: string) => string | null;
/**
 * The transition kinds the engine actually renders: the subset of
 * `TRANSITION_KINDS` that `rustTransitionKind` maps to a real Rust `TransitionKind`
 * (preview == export). Every other kind is silently dropped, so any surface that
 * lets a user PICK a transition (e.g. the inspector dropdown) should offer only
 * these — otherwise the chosen transition no-ops in both preview and export.
 */
declare const RENDERED_TRANSITION_KINDS: string[];
/**
 * Convert a FrameTake {@link Scene} into the Rust renderer's native scene JSON
 * object (pass through `JSON.stringify` for `Composition.fromSceneJson`). Audio
 * elements are skipped (not visual). Texture ids are the element id — the
 * renderer loads each sticker's image and supplies each video's frame keyed by
 * that id. Subtitle cues are burned as styled text moveables.
 */
declare const sceneToRustScene: (scene: Scene) => RustScene;

export { ANIMATION_DURATION, type AnimationChoice, type AnimationData, AnimationSlot, type AnimationSlotKind, type AssetInfo, type AudioElement, CAPTION_ANIMATIONS, CAPTION_PRESETS, CAPTION_PRESET_VISUALS, type CaptionAnimation, type CaptionPreset, type CaptionVisual, type CategoryAnimations, ELEMENT_IN_ANIMATIONS, ELEMENT_LOOP_ANIMATIONS, ELEMENT_OUT_ANIMATIONS, EXPORT_PRESETS, EXPORT_QUALITIES, type ElementAnimation, type ElementFilters, type ElementInAnimation, type ElementKind, type ElementLoopAnimation, type ElementOutAnimation, type EngineAdjustments, type ExportPreset, type ExportQuality, type InvariantOptions, MIN_ANIMATION_DURATION, type MultiAnimations, type NormSize, type NormVec2, type Origin, type ProjectWire, RENDERED_TRANSITION_KINDS, type RenderTask, type RenderTaskOptions, type RustAdjustments, type RustAnimationSpec, type RustColor, type RustCrop, type RustEffects, type RustFontRef, type RustMoveable, type RustMoveableKind, type RustScene, type RustTextAnimationSpec, type RustTextDecoration, type RustTextTiming, type RustTransform, type RustTransition, SCHEMA_VERSION, type Scene, type SceneElement, type StickerElement, type SubtitleCue, type SubtitleStyle, type SubtitleTrack, type SubtitleWord, TEXT_BACKGROUND_STYLES, TEXT_IN_ANIMATIONS, TEXT_LOOP_ANIMATIONS, TEXT_OUT_ANIMATIONS, TRANSITION_KINDS, type TextAlign, type TextBackgroundStyle, type TextElement, type TextInAnimation, type TextLoopAnimation, type TextOutAnimation, type Transform, type Transition, type VideoElement, type Violation, type VisualElement, animationDefaults, animationPaletteFor, backgroundDisplayMode, captionAnimationColor, captionAnimationColorParam, captionAnimationLength, createEmptyScene, decodeProject, defaultCategoryAnimations, defaultFilters, defaultSubtitleStyle, effectShaderFile, encodeProject, getElementTotalDuration, getEndTime, getStartTime, hexToRustColor, isAnyAnimationSet, isCaptionAnimation, isCaptionPreset, isTextBackgroundStyle, isVisual, mapCategoriesToSavedAnimations, mapSavedAnimationsToCategories, migrateLegacyAnimation, resolveCaptionAnimation, resolveCaptionVisual, resolveEngineAnimations, rustTransitionKind, scaleFiltersToEngine, scaledOutputSize, sceneToRenderTask, sceneToRustScene, subtitleWordCount, transitionTypeFor, updateAnimationStartTime, validateSceneInvariants };
