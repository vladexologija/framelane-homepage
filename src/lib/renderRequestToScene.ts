/**
 * Full-fidelity inverse of `sceneToRenderRequest`: a `POST /v1/renders` request
 * body → an editor `Scene` so pasted JSON can drive the visual editor + wasm
 * preview. Best-effort and NEVER throws (returns `null` on failure). Field/enum
 * mappings mirror the FrameLane API (`render/maps.ts` + `sceneToRenderRequest.ts`).
 *
 * Render fidelity is guaranteed elsewhere (the playground POSTs the raw JSON
 * verbatim). This mapper only builds the preview Scene, covering every field the
 * editor model can represent (see plan "Preview limitations" for render-only fields).
 */
import {
  decodeProject,
  defaultFilters,
  defaultSubtitleStyle,
  animationDefaults,
  ELEMENT_IN_ANIMATIONS,
  ELEMENT_OUT_ANIMATIONS,
  ELEMENT_LOOP_ANIMATIONS,
  TEXT_IN_ANIMATIONS,
  TEXT_OUT_ANIMATIONS,
  TEXT_LOOP_ANIMATIONS,
  type Scene,
  type ElementFilters,
  type MultiAnimations,
  type AnimationData,
} from "@frametake/scene-schema";
import {
  MOTION_TO_SCENE,
  GLYPH_MOTION_TO_SCENE,
  EFFECT_TO_SCENE,
  WORD_ANIM_TO_CAPTION,
  TRANSITION_TO_SCENE_KIND,
  PREVIEW_FONTS,
  type MotionType,
  type EffectType,
  type TransitionType,
  type WordAnimationStyle,
} from "@/lib/render/maps";

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const asArr = (v: unknown): Obj[] => (Array.isArray(v) ? v.filter(isObj) : []);
const numOr = (v: unknown, fb: number): number => (typeof v === "number" && Number.isFinite(v) ? v : fb);
const strOr = (v: unknown, fb: string): string => (typeof v === "string" ? v : fb);

/** Bake a Percent (0–100) opacity into a #RRGGBB hex as the alpha byte. A hex that
 *  already carries alpha (or a non-hex value) is returned unchanged. */
function withAlpha(hex: string, opacityPct: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const a = Math.round((Math.max(0, Math.min(100, opacityPct)) / 100) * 255);
  return hex + a.toString(16).padStart(2, "0");
}

/** Mirror of api/translation/units.py `parse_norm`: "50%"→0.5; "12px" or a bare
 *  number → pixels / canvasAxis; plain numeric string → / canvasAxis. */
function pctToNorm(v: unknown, axis: number, fb: number): number {
  if (typeof v === "number") return axis > 0 ? v / axis : fb;
  if (typeof v === "string") {
    const s = v.trim();
    if (s.endsWith("%")) return parseFloat(s) / 100;
    if (s.endsWith("px")) return axis > 0 ? parseFloat(s) / axis : fb;
    const n = parseFloat(s);
    return Number.isFinite(n) && axis > 0 ? n / axis : fb;
  }
  return fb;
}

/** "45deg" | "45°" | "45rad" | number → degrees. */
function degFrom(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const s = v.trim();
    const n = parseFloat(s);
    if (!Number.isFinite(n)) return 0;
    if (s.endsWith("rad")) return (n * 180) / Math.PI;
    return n; // deg / ° / bare
  }
  return 0;
}

/** Inverse of `scaleFiltersToEngine` (engine scale → scene units) + opacity. */
function filtersFromEngine(el: Obj): ElementFilters {
  const f = defaultFilters();
  if (typeof el.brightness === "number") f.brightness = el.brightness / 100;
  if (typeof el.contrast === "number") f.contrast = el.contrast / 100;
  if (typeof el.saturation === "number") f.saturation = el.saturation / 100;
  if (typeof el.exposure === "number") f.exposure = el.exposure / 100;
  if (typeof el.hue_rotate === "number") f.hue = el.hue_rotate / 180;
  if (typeof el.sharpness === "number") f.sharpen = el.sharpness / 100;
  if (typeof el.blur === "number") f.blur = el.blur / 100;
  if (typeof el.noise === "number") f.noise = el.noise / 100;
  if (typeof el.vignette === "number") f.vignette = el.vignette / 100;
  f.opacity = typeof el.opacity === "number" ? el.opacity / 100 : 1;
  return f;
}

function transformOf(el: Obj, w: number, h: number) {
  return {
    position: { x: pctToNorm(el.x, w, 0.5), y: pctToNorm(el.y, h, 0.5) },
    size: { w: pctToNorm(el.width, w, 1), h: pctToNorm(el.height, h, 1) },
    rotation: degFrom(el.z_rotation),
  };
}

// Animation ids the editor + wasm preview can render, split by slot [in, out, loop].
// `MOTION_MAP` (mirrored by MOTION_TO_SCENE) also names ids the *render engine*
// supports but the preview does not — element blends (`overlay`/`difference`),
// cinematic text presets (`explode`/`bounce_motion`), and text-only ids on a
// non-text element. It also names entrance-only ids (e.g. `evaporate`) that must
// go in the ENTRANCE slot even when the API marks them reversed. Emitting an id
// the preview can't resolve for its slot aborts the whole pump ("unsupported Rust
// renderer feature: element_animation ..."), so each id is validated against its
// own slot's set. Render is unaffected (the raw JSON is POSTed verbatim).
const ELEMENT_SLOT_SETS: ReadonlyArray<ReadonlySet<string>> = [
  new Set<string>(ELEMENT_IN_ANIMATIONS),
  new Set<string>(ELEMENT_OUT_ANIMATIONS),
  new Set<string>(ELEMENT_LOOP_ANIMATIONS),
];
const TEXT_SLOT_SETS: ReadonlyArray<ReadonlySet<string>> = [
  new Set<string>(TEXT_IN_ANIMATIONS),
  new Set<string>(TEXT_OUT_ANIMATIONS),
  new Set<string>(TEXT_LOOP_ANIMATIONS),
];

/** The MultiAnimations slot an editor animation id belongs to (0=in, 1=out, 2=loop),
 *  keyed off the id's family — NOT the API `reversed` flag. */
const slotForId = (id: string): 0 | 1 | 2 =>
  id.startsWith("loop-") ? 2 : id.startsWith("out-") ? 1 : 0;

/** A render feature that maps/renders on the server but the editor preview can't
 *  show yet, so the reverse mapper dropped it (surfaced as a panel warning). */
export interface PreviewDrop {
  path: string;
  message: string;
}

/** API `motion[]` → a `MultiAnimations` [in, out, loop] triple. Motions the
 *  preview can't render are dropped and reported via `drops`. */
function animationsOf(motions: Obj[], isText: boolean, drops?: PreviewDrop[], basePath = ""): MultiAnimations {
  const triple = animationDefaults();
  const slotSets = isText ? TEXT_SLOT_SETS : ELEMENT_SLOT_SETS;
  motions.forEach((m, j) => {
    const type = m.type as MotionType;
    const table = isText && m.scope === "character" ? GLYPH_MOTION_TO_SCENE : MOTION_TO_SCENE;
    const entry = table[type];
    const reversed = m.reversed === true || type === "evaporate" || type === "zoom_out";
    const id = entry ? entry[reversed ? 1 : 0] : null;
    const slot = id ? slotForId(id) : 0;
    if (!id || !slotSets[slot].has(id)) {
      // Warn only for valid motion types (unknown ones are schema errors) whose
      // editor animation the preview can't render in its slot — render is unaffected.
      if (drops && MOTION_TO_SCENE[type]) {
        drops.push({
          path: `${basePath}.motion[${j}].type`,
          message: `motion "${type}" isn't supported in the editor preview yet (it still renders)`,
        });
      }
      return;
    }
    const isLoop = slot === 2;
    const length = numOr(m.duration, 0.6);
    const data: AnimationData = {
      animation: id,
      animationParams: {
        length,
        startTime: numOr(m.time, 0),
        calculateTimings: true,
        ...(isLoop ? { loop: { length } } : {}),
      },
    };
    triple[slot] = data;
  });
  return triple;
}

/** API video/image `effects[]` → editor kernel-name list (drops chroma_key +
 *  unknowns). chroma_key drops are reported via `drops` (it renders but the
 *  Scene can't hold its hue/sat/lum settings). */
function effectsOf(el: Obj, drops?: PreviewDrop[], basePath = ""): string[] {
  const out: string[] = [];
  asArr(el.effects).forEach((e, j) => {
    const name = EFFECT_TO_SCENE[e.type as EffectType];
    if (!name || name === "chroma") {
      if (drops && name === "chroma") {
        drops.push({
          path: `${basePath}.effects[${j}].type`,
          message: `effect "chroma_key" isn't supported in the editor preview yet (it still renders)`,
        });
      }
      return;
    }
    out.push(name);
  });
  return out;
}

/** Mirror of api/translation/translator.py `_derive_duration`: use `duration`
 *  when set, else the latest element end-time — video/audio only count when they
 *  carry an explicit `out_point` (their source length is unknown here); every
 *  other type uses `time + duration`. Falls back to the contract default of 10s.
 *  Without this, a request that omits `duration` (legal — the API infers it)
 *  would collapse the preview timeline and drop every later element. */
function deriveDuration(request: Obj): number {
  if (typeof request.duration === "number" && request.duration > 0) return request.duration;
  let latest = 0;
  for (const el of asArr(request.elements)) {
    const start = numOr(el.time, 0);
    if (el.type === "video" || el.type === "audio") {
      if (typeof el.out_point === "number") {
        const inPoint = numOr(el.in_point, 0);
        const speed = Math.max(numOr(el.speed, 1), 0.01);
        latest = Math.max(latest, start + (el.out_point - inPoint) / speed);
      }
    } else {
      const dur = numOr(el.duration, 0);
      if (dur > 0) latest = Math.max(latest, start + dur);
    }
  }
  return latest > 0 ? latest : 10;
}

export function renderRequestToScene(
  request: unknown,
  drops?: PreviewDrop[],
  /** Probed natural source lengths (seconds), keyed by `source_url`. Lets the
   *  preview place a no-`out_point` clip at its real end instead of stretching
   *  it to the composition end (the playground probes these client-side). */
  sourceDurations?: ReadonlyMap<string, number>,
): Scene | null {
  try {
    if (!isObj(request)) return null;
    const w = numOr(request.width, 1280);
    const h = numOr(request.height, 720);
    const duration = deriveDuration(request);

    const elements: Record<string, Obj> = {};
    const visualOrder: { id: string; z: number; i: number }[] = [];
    const audioIds: string[] = [];
    // `decodeProject` drops `effects`, so re-attach it after decoding.
    const videoEffects: Record<string, string[]> = {};
    const subtitleTracks: Record<string, unknown> = {};
    let subIdx = 0;
    // Give every element a unique scene id so duplicate request ids don't
    // overwrite each other in the `elements` record (dropping elements silently).
    const usedIds = new Set<string>();

    asArr(request.elements).forEach((el, i) => {
      const type = el.type;
      let id = strOr(el.id, `el_${i}`);
      if (usedIds.has(id)) id = `${id}#${i}`;
      usedIds.add(id);
      // Mirror the API's per-type z_index defaults (translator.py): text stacks
      // above video/image. Explicit z_index wins; within a z-layer, EARLIER in
      // the request array renders on top (front) — see the tie-break below.
      const z = typeof el.z_index === "number" ? el.z_index : type === "text" ? 1 : 0;
      const time = numOr(el.time, 0);

      if (type === "video" || type === "audio") {
        const inPoint = numOr(el.in_point, 0);
        const speed = numOr(el.speed, 1);
        const safeSpeed = Math.max(speed, 0.01);
        const url = strOr(el.source_url, "");
        // With out_point, use the trimmed source range. Without one the API plays
        // the full source to its end (`trimEnd -1`). The source length isn't in
        // the JSON, so use a probed length when the caller supplies one
        // (playground probes the URL); otherwise fall back to filling `time` →
        // composition end — never overflowing the timeline.
        const hasOut = typeof el.out_point === "number";
        const probed = hasOut ? undefined : sourceDurations?.get(url);
        let endTime: number;
        let trimEnd: number;
        if (hasOut) {
          endTime = time + Math.max(0.01, ((el.out_point as number) - inPoint) / safeSpeed);
          trimEnd = el.out_point as number;
        } else if (typeof probed === "number" && probed > inPoint) {
          // Real source range [in_point, source end], clamped to the composition
          // (the renderer slices at `duration`) — matches `trimEnd -1`.
          const naturalEnd = time + Math.max(0.01, (probed - inPoint) / safeSpeed);
          endTime = Math.min(naturalEnd, Math.max(time + 0.01, duration));
          trimEnd = endTime < naturalEnd ? inPoint + (endTime - time) * safeSpeed : probed;
        } else {
          endTime = Math.max(time + 0.01, duration);
          trimEnd = inPoint + (endTime - time) * safeSpeed;
        }
        const common = {
          id,
          src: url,
          assetId: "",
          startTime: time,
          endTime,
          trimStart: inPoint,
          trimEnd,
          playbackRate: speed,
          volume: numOr(el.volume, 100) / 100,
          fadeIn: numOr(el.fade_in_duration, 0),
          fadeOut: numOr(el.fade_out_duration, 0),
        };
        if (type === "audio") {
          elements[id] = { ...common, kind: "audio", zIndex: z };
          audioIds.push(id);
        } else {
          const fx = effectsOf(el, drops, `elements[${i}]`);
          if (fx.length) videoEffects[id] = fx;
          elements[id] = {
            ...common,
            kind: "video",
            zIndex: z,
            transform: transformOf(el, w, h),
            filters: filtersFromEngine(el),
            flipX: el.flip_horizontal === true,
            flipY: el.flip_vertical === true,
            loop: false,
            effects: fx,
            animations: animationsOf(asArr(el.motion), false, drops, `elements[${i}]`),
          };
          visualOrder.push({ id, z, i });
        }
        return;
      }

      if (type === "image") {
        elements[id] = {
          id,
          kind: "sticker",
          zIndex: z,
          src: strOr(el.source_url, ""),
          assetId: null,
          scalable: false,
          startTime: time,
          endTime: time + numOr(el.duration, duration),
          transform: transformOf(el, w, h),
          filters: filtersFromEngine(el),
          animations: animationsOf(asArr(el.motion), false, drops, `elements[${i}]`),
        };
        visualOrder.push({ id, z, i });
        return;
      }

      if (type === "text") {
        const dur = numOr(el.duration, duration);
        const fontSize = numOr(el.font_size, 48) / h;
        // The wasm preview only ships a fixed set of fonts; others fall back to a
        // default here (but render correctly server-side).
        if (drops && typeof el.font_family === "string" && el.font_family) {
          const fam = el.font_family.split(",")[0].trim();
          if (fam && !PREVIEW_FONTS.has(fam)) {
            drops.push({
              path: `elements[${i}].font_family`,
              message: `font "${fam}" isn't available in the editor preview yet (it still renders)`,
            });
          }
        }
        // A text element carrying word_animation is a CAPTION → subtitle track.
        if (isObj(el.word_animation)) {
          const wa = el.word_animation;
          const words = asArr(wa.words).map((word) => ({
            text: strOr(word.text, ""),
            start: numOr(word.start, time),
            end: numOr(word.end, time + dur),
          }));
          const animation = WORD_ANIM_TO_CAPTION[wa.style as WordAnimationStyle] ?? "highlight";
          const bgColor = typeof el.background_color === "string" ? el.background_color : null;
          // The API paints a full plate behind the caption ONLY when background:true
          // (translator `display:"block"`); otherwise there is no block, and the
          // colour instead drives the box-highlight/colour-highlight word animation
          // (CaptionVisual.animationColor). Mixing these was the "wrong box" bug.
          const blockColor =
            el.background === true && bgColor
              ? typeof el.background_opacity === "number"
                ? withAlpha(bgColor, el.background_opacity)
                : bgColor
              : null;
          // The word-animation colour targets a different CaptionVisual field per
          // style: `box` colours the box (animationColor — the only field the
          // engine reads per-animation); `color` recolours the active word text
          // (activeWordColor, no pill — mirrors the render's colourHighlight).
          const wordColor: Record<string, string | null> =
            !bgColor
              ? {}
              : wa.style === "box"
                ? { animationColor: bgColor }
                : wa.style === "color"
                  ? { activeWordColor: bgColor, activeWordBackground: null }
                  : {};
          const style = defaultSubtitleStyle();
          const trackId = `subs-${subIdx++}`;
          subtitleTracks[trackId] = {
            id: trackId,
            language: "en",
            cues: [
              {
                id: `${trackId}-0`,
                start: words.length ? Math.min(...words.map((x) => x.start)) : time,
                end: words.length ? Math.max(...words.map((x) => x.end)) : time + dur,
                text: strOr(el.text, ""),
                words,
              },
            ],
            style: {
              ...style,
              animation,
              overrides: {
                fontFamily: strOr(el.font_family, "Inter"),
                fontSize,
                bold: numOr(el.font_weight, 400) >= 700,
                color: strOr(el.text_color, "#ffffff"),
                backgroundColor: blockColor,
                ...wordColor,
              },
            },
          };
          return;
        }

        const strokeWidth = numOr(el.stroke_width, 0) * fontSize;
        elements[id] = {
          id,
          kind: "text",
          zIndex: z,
          text: strOr(el.text, ""),
          startTime: time,
          endTime: time + dur,
          transform: transformOf(el, w, h),
          filters: filtersFromEngine(el),
          fontFamily: strOr(el.font_family, "Inter"),
          fontSize,
          lineHeight: numOr(el.leading, 1.2),
          color: strOr(el.text_color, "#ffffff"),
          align: strOr(el.text_align, "center"),
          bold: numOr(el.font_weight, 400) >= 700 || el.font_style === "bold" || el.font_style === "bolditalic",
          italic: el.font_style === "italic" || el.font_style === "bolditalic",
          backgroundColor: typeof el.background_color === "string" ? el.background_color : null,
          outlineWidth: strokeWidth,
          outlineColor: strOr(el.stroke_color, "#000000"),
          // The render sizes the text shadow as `shadow_blur / canvas_width` (an
          // em-fraction of the font, like the outline), so the preview's
          // height-relative `shadowBlur` must be `fontSize * shadow_blur / width`
          // to land at the same on-screen size (see renderRequestToScene tests).
          shadowBlur: w > 0 ? (fontSize * numOr(el.shadow_blur, 0)) / w : 0,
          shadowColor: strOr(el.shadow_color, "#000000"),
          animations: animationsOf(asArr(el.motion), true, drops, `elements[${i}]`),
        };
        visualOrder.push({ id, z, i });
      }
    });

    // Transitions: API type → editor kind (drop unknowns).
    const transitions: Record<string, unknown> = {};
    asArr(request.transitions).forEach((t, i) => {
      const kind = TRANSITION_TO_SCENE_KIND[t.type as TransitionType];
      if (!kind) return;
      const id = strOr(t.from_id, "") && strOr(t.to_id, "") ? `${t.from_id}->${t.to_id}` : `t_${i}`;
      transitions[id] = {
        id,
        fromElementId: strOr(t.from_id, ""),
        toElementId: strOr(t.to_id, ""),
        kind,
        duration: numOr(t.duration, 0.5),
      };
    });

    // Back-to-front by effective z_index. Within a z-layer, EARLIER in the
    // request array renders on top (front) — the framelane-api same-z
    // convention. `elementOrder` is back-to-front, so the frontmost element
    // must come LAST; hence the DESCENDING request-index (`b.i - a.i`)
    // tie-break. (The render/export path must enforce the same order for equal
    // z_index — a render-node/framelane-api concern, not fixable from here.)
    visualOrder.sort((a, b) => a.z - b.z || b.i - a.i);
    const elementOrder = [...visualOrder.map((v) => v.id), ...audioIds];

    const bgUrl = typeof request.background_image_url === "string" ? request.background_image_url : null;
    const scene = {
      schemaVersion: 1,
      canvas: { width: w, height: h },
      backgroundColor: strOr(request.background_color, "#000000ff"),
      backgroundImage: bgUrl ? { url: bgUrl } : null,
      fps: numOr(request.frame_rate, 30),
      duration,
      elements,
      elementOrder,
      subtitleTracks,
      transitions,
    };

    const decoded = decodeProject({ schemaVersion: 1, scene });
    // Re-attach `effects` (dropped by decodeProject's element decoder).
    for (const [id, fx] of Object.entries(videoEffects)) {
      const e = decoded.elements[id];
      if (e && e.kind === "video") (e as { effects?: string[] }).effects = fx;
    }
    return decoded;
  } catch {
    return null;
  }
}

/** Run the reverse mapper purely to collect the features it drops from the
 *  preview (unsupported motions, chroma_key), for surfacing as panel warnings.
 *  Never throws (mirrors `renderRequestToScene`). */
export function collectPreviewIssues(request: unknown): PreviewDrop[] {
  const drops: PreviewDrop[] = [];
  try {
    renderRequestToScene(request, drops);
  } catch {
    /* renderRequestToScene already swallows errors; guard defensively anyway */
  }
  return drops;
}
