// src/scene.ts
var defaultFilters = () => ({
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  hue: 0,
  sharpen: 0,
  blur: 0,
  noise: 0,
  vignette: 0,
  opacity: 1
});
var effectShaderFile = (name) => {
  if (!name) return null;
  const base = name === "posterize" ? "posterise" : name;
  return /^[a-z0-9_]+$/.test(base) ? `effect_${base}.frag` : null;
};
var scaleFiltersToEngine = (f) => ({
  brightness: f.brightness * 100,
  contrast: f.contrast * 100,
  saturation: f.saturation * 100,
  exposure: f.exposure * 100,
  hue: f.hue * 180,
  sharpen: f.sharpen * 100,
  blur: f.blur * 100,
  noise: f.noise * 100,
  vignette: f.vignette * 100
});
var isVisual = (el) => el.kind !== "audio";
var defaultSubtitleStyle = () => ({
  preset: "default",
  animation: "none"
});
var SCHEMA_VERSION = 1;
var createEmptyScene = () => ({
  schemaVersion: SCHEMA_VERSION,
  canvas: { width: 1920, height: 1080 },
  backgroundColor: "#000000",
  backgroundImage: null,
  fps: 30,
  duration: 0,
  elements: {},
  elementOrder: [],
  subtitleTracks: {},
  transitions: {}
});

// src/animations.ts
var AnimationSlot = /* @__PURE__ */ ((AnimationSlot2) => {
  AnimationSlot2[AnimationSlot2["In"] = 0] = "In";
  AnimationSlot2[AnimationSlot2["Out"] = 1] = "Out";
  AnimationSlot2[AnimationSlot2["Loop"] = 2] = "Loop";
  return AnimationSlot2;
})(AnimationSlot || {});
var ANIMATION_DURATION = 0.6;
var MIN_ANIMATION_DURATION = 0.2;
var noneData = () => ({
  animation: "none",
  animationParams: { length: 0, startTime: 0 }
});
var animationDefaults = () => [
  noneData(),
  noneData(),
  noneData()
];
var getElementTotalDuration = (el) => Math.max(0, el.endTime - el.startTime);
var getEndTime = (el) => el.endTime;
var getStartTime = (slot, el, length) => slot === 1 /* Out */ ? getEndTime(el) - length : el.startTime;
var migrateLegacyAnimation = (a) => {
  if (!a || !a.id || a.id === "none") return null;
  return [
    {
      animation: a.id,
      animationParams: {
        length: a.duration,
        startTime: a.startTime,
        delay: 0,
        calculateTimings: true
      }
    },
    noneData(),
    noneData()
  ];
};
var isAnyAnimationSet = (el) => {
  if (el.animations) return el.animations.some((a) => a.animation !== "none");
  return Boolean(el.animation && el.animation.id && el.animation.id !== "none");
};
var updateAnimationStartTime = (animations, startTime, endTime) => {
  const a = animations ?? animationDefaults();
  return [
    { ...a[0], animationParams: { ...a[0].animationParams, startTime } },
    {
      ...a[1],
      animationParams: {
        ...a[1].animationParams,
        startTime: a[1].animation !== "none" ? endTime - a[1].animationParams.length : 0
      }
    },
    { ...a[2], animationParams: { ...a[2].animationParams, startTime } }
  ];
};
var defaultCategoryAnimations = () => ({
  in: { animation: "none", duration: ANIMATION_DURATION },
  out: { animation: "none", duration: ANIMATION_DURATION },
  loop: { animation: "none", duration: ANIMATION_DURATION }
});
var mapSavedAnimationsToCategories = (animations) => {
  if (!animations || animations.length !== 3)
    return defaultCategoryAnimations();
  const dur = (n) => n > 0 ? n : ANIMATION_DURATION;
  return {
    in: {
      animation: animations[0].animation,
      duration: dur(animations[0].animationParams.length)
    },
    out: {
      animation: animations[1].animation,
      duration: dur(animations[1].animationParams.length)
    },
    loop: {
      animation: animations[2].animation,
      duration: dur(animations[2].animationParams.loop?.length ?? 0)
    }
  };
};
var mapCategoriesToSavedAnimations = (categories, el) => {
  const total = getElementTotalDuration(el);
  return [
    {
      animation: categories.in.animation,
      animationParams: {
        length: categories.in.duration,
        startTime: getStartTime(0 /* In */, el, categories.in.duration),
        delay: 0,
        calculateTimings: true
      }
    },
    {
      animation: categories.out.animation,
      animationParams: {
        length: categories.out.duration,
        startTime: getStartTime(1 /* Out */, el, categories.out.duration),
        delay: 0,
        calculateTimings: true
      }
    },
    {
      animation: categories.loop.animation,
      animationParams: {
        length: total,
        startTime: getStartTime(2 /* Loop */, el, total),
        delay: 0,
        loop: { length: categories.loop.duration },
        calculateTimings: true
      }
    }
  ];
};
var resolveEngineAnimations = (el) => {
  const out = [];
  const multi = el.animations ?? migrateLegacyAnimation(el.animation);
  if (multi) {
    const [inA, outA, loopA] = multi;
    const total = getElementTotalDuration(el);
    if (inA.animation !== "none") {
      const length = inA.animationParams.length;
      out.push({
        animation: inA.animation,
        animationParams: {
          length,
          startTime: getStartTime(0 /* In */, el, length),
          delay: 0,
          calculateTimings: true
        }
      });
    }
    if (outA.animation !== "none") {
      const length = outA.animationParams.length;
      out.push({
        animation: outA.animation,
        animationParams: {
          length,
          startTime: getStartTime(1 /* Out */, el, length),
          delay: 0,
          calculateTimings: true
        }
      });
    }
    if (loopA.animation !== "none") {
      out.push({
        animation: loopA.animation,
        animationParams: {
          length: total,
          startTime: getStartTime(2 /* Loop */, el, total),
          delay: 0,
          loop: {
            length: loopA.animationParams.loop?.length ?? loopA.animationParams.length
          },
          calculateTimings: true
        }
      });
    }
  }
  if (el.fadeIn && el.fadeIn > 0) {
    out.push({
      animation: "fade",
      animationParams: {
        length: el.fadeIn,
        startTime: el.startTime,
        delay: 0,
        calculateTimings: true
      }
    });
  }
  if (el.fadeOut && el.fadeOut > 0) {
    out.push({
      animation: "out-fade",
      animationParams: {
        length: el.fadeOut,
        startTime: el.endTime - el.fadeOut,
        delay: 0,
        calculateTimings: true
      }
    });
  }
  return out;
};

// src/animationCatalog.ts
var ELEMENT_IN_ANIMATIONS = [
  "none",
  "fade",
  "slideLeft",
  "slideRight",
  "slideUp",
  "slideDown",
  "slideBounceLeft",
  "slideBounceRight",
  "slideBounceUp",
  "slideBounceDown",
  "floatLeft",
  "floatRight",
  "floatUp",
  "floatDown",
  "gentleFloatLeft",
  "gentleFloatRight",
  "gentleFloatUp",
  "gentleFloatDown",
  "wipeLeft",
  "wipeRight",
  "wipeUp",
  "wipeDown",
  "zoomIn",
  "pop",
  "drop",
  "bounceIn",
  "spinClockwise",
  "spinAntiClockwise",
  "kenBurnsIn",
  "kenBurnsOut",
  "kenBurnsInOut",
  // F2 dual-build element preset pack (2026-07-05):
  "swingIn",
  "elasticRise",
  "tiltZoom",
  // F9: bezier-eased preset.
  "smoothPop",
  // F14: spatial-path preset (arc entrance).
  "arcRise",
  // Spring-eased preset (scale pop with physical overshoot).
  "springPop"
];
var ELEMENT_OUT_ANIMATIONS = [
  "none",
  "out-fade",
  "out-slideLeft",
  "out-slideRight",
  "out-slideUp",
  "out-slideDown",
  "out-slideBounceLeft",
  "out-slideBounceRight",
  "out-slideBounceUp",
  "out-slideBounceDown",
  "out-floatLeft",
  "out-floatRight",
  "out-floatUp",
  "out-floatDown",
  "out-gentleFloatLeft",
  "out-gentleFloatRight",
  "out-gentleFloatUp",
  "out-gentleFloatDown",
  "out-wipeLeft",
  "out-wipeRight",
  "out-wipeUp",
  "out-wipeDown",
  "out-zoomOut",
  "out-pop",
  "out-dropOut",
  "out-bounceOut",
  "out-spinClockwise",
  "out-spinAntiClockwise",
  // F2 dual-build element preset pack (2026-07-05):
  "out-swingOut",
  "out-elasticDrop"
];
var ELEMENT_LOOP_ANIMATIONS = [
  "none",
  "loop-bounce",
  "loop-heartBeat",
  "loop-jiggle",
  "loop-sway",
  "loop-squeezy",
  "loop-rotateBasic",
  "loop-rotateSmooth",
  "loop-3DSpin",
  "loop-3DSway",
  // F2 dual-build element preset pack (2026-07-05):
  "loop-orbit"
];
var TEXT_IN_ANIMATIONS = [
  "none",
  "fade",
  "slideLeft",
  "slideRight",
  "slideUp",
  "slideDown",
  "block",
  "compress",
  "stomp",
  "zoomIn",
  "scale",
  "ascent",
  "burst",
  "bounce",
  "wave",
  "wavey",
  "fall",
  "roll",
  "skid",
  "vogue",
  "billboard",
  "blur",
  "dragonfly",
  "evaporate",
  "flipboard",
  "typewriter",
  "verticalStretch",
  // F1 dual-build preset pack (2026-07-05):
  "rubberIn",
  "whipUp",
  "glitchPop",
  "driftIn"
];
var TEXT_OUT_ANIMATIONS = [
  "none",
  "out-fade",
  "out-slideLeft",
  "out-slideRight",
  "out-slideUp",
  "out-slideDown",
  "out-block",
  "out-decompress",
  "out-stomp",
  "out-zoomOut",
  "out-scale",
  "out-burst",
  "out-fall",
  "out-roll",
  "out-skid",
  "out-sink",
  "out-vogue",
  "out-billboard",
  "out-dragonfly",
  "out-flipboard",
  "out-verticalStretch",
  "out-wavey",
  // F1 dual-build preset pack (2026-07-05):
  "out-whipDown",
  "out-driftOut"
];
var TEXT_LOOP_ANIMATIONS = [
  "none",
  "loop-heartBeat",
  "loop-scale",
  "loop-slide",
  "loop-stretch",
  "loop-verticalStretch",
  "loop-roll",
  // 'loop-rotateBasic' removed (E6b): the glyphon text engine never rotates
  // glyphs (ADR-0001), so on text it routed to the element engine and rendered
  // NOTHING. Re-add when text rotation exists. Legacy docs that still carry it
  // stay a harmless no-op.
  "loop-vogue",
  "loop-wavey",
  "loop-billboard",
  "loop-dragonfly",
  "loop-flipboard",
  // F1 dual-build preset pack (2026-07-05):
  "loop-breathe",
  "loop-shimmer"
];
var animationPaletteFor = (family, slot) => {
  if (family === "text") {
    return slot === "in" ? TEXT_IN_ANIMATIONS : slot === "out" ? TEXT_OUT_ANIMATIONS : TEXT_LOOP_ANIMATIONS;
  }
  return slot === "in" ? ELEMENT_IN_ANIMATIONS : slot === "out" ? ELEMENT_OUT_ANIMATIONS : ELEMENT_LOOP_ANIMATIONS;
};

// src/captionStyles.ts
var CAPTION_PRESETS = [
  "default",
  "plain",
  "block",
  "outline",
  "highlight",
  "boxHighlight",
  "karaoke",
  "social",
  // F10 dual-build caption variants (2026-07-05) — data-only combos of the
  // proven engine mechanisms (plate, outline, active-word box/colour):
  "impact",
  "neon",
  "contrast",
  "mint",
  "bubblegum"
];
var CAPTION_ANIMATIONS = [
  "none",
  "karaoke",
  "highlight",
  "boxHighlight",
  "reveal",
  "impactPop"
];
var TEXT_BACKGROUND_STYLES = ["block", "lineHard", "lineRound"];
var backgroundDisplayMode = (hasBackground, style = "block") => {
  if (!hasBackground) return "normal";
  return style === "lineHard" ? "line_block_hard" : style === "lineRound" ? "line_block_round" : "block";
};
var CAPTION_PRESET_VISUALS = {
  default: {
    fontFamily: "IBM Plex Sans",
    fontSize: 0.05,
    bold: true,
    uppercase: false,
    color: "#ffffff",
    backgroundColor: null,
    outlineWidth: 4e-3,
    outlineColor: "#000000",
    activeWordColor: "#ffd60a",
    activeWordBackground: null
  },
  plain: {
    fontFamily: "IBM Plex Sans",
    fontSize: 0.045,
    bold: false,
    uppercase: false,
    color: "#ffffff",
    backgroundColor: null,
    outlineWidth: 0,
    outlineColor: "#000000",
    activeWordColor: "#ffffff",
    activeWordBackground: null
  },
  block: {
    fontFamily: "IBM Plex Sans",
    fontSize: 0.05,
    bold: true,
    uppercase: false,
    color: "#ffffff",
    backgroundColor: "#000000cc",
    outlineWidth: 0,
    outlineColor: "#000000",
    activeWordColor: "#ffd60a",
    activeWordBackground: null
  },
  outline: {
    fontFamily: "IBM Plex Sans",
    fontSize: 0.055,
    bold: true,
    uppercase: true,
    color: "#ffffff",
    backgroundColor: null,
    outlineWidth: 6e-3,
    outlineColor: "#000000",
    activeWordColor: "#7df9aa",
    activeWordBackground: null
  },
  highlight: {
    fontFamily: "IBM Plex Sans",
    fontSize: 0.05,
    bold: true,
    uppercase: false,
    color: "#ffffff",
    backgroundColor: null,
    outlineWidth: 4e-3,
    outlineColor: "#000000",
    activeWordColor: "#0a0a0a",
    activeWordBackground: "#ffd60a"
  },
  boxHighlight: {
    fontFamily: "IBM Plex Sans",
    fontSize: 0.05,
    bold: true,
    uppercase: true,
    color: "#ffffff",
    backgroundColor: null,
    outlineWidth: 0,
    outlineColor: "#000000",
    activeWordColor: "#ffffff",
    activeWordBackground: "#5865f2"
  },
  karaoke: {
    fontFamily: "IBM Plex Sans",
    fontSize: 0.05,
    bold: true,
    uppercase: false,
    color: "#ffffff99",
    backgroundColor: null,
    outlineWidth: 4e-3,
    outlineColor: "#000000",
    activeWordColor: "#ffffff",
    activeWordBackground: null
  },
  social: {
    fontFamily: "IBM Plex Sans",
    fontSize: 0.06,
    bold: true,
    uppercase: true,
    color: "#ffffff",
    backgroundColor: null,
    outlineWidth: 8e-3,
    outlineColor: "#000000",
    activeWordColor: "#ff4d4d",
    activeWordBackground: null
  },
  // F10: the creator-economy "impact" look — big yellow uppercase, heavy
  // outline, red hot word.
  impact: {
    fontFamily: "IBM Plex Sans",
    fontSize: 0.065,
    bold: true,
    uppercase: true,
    color: "#ffd60a",
    backgroundColor: null,
    outlineWidth: 0.01,
    outlineColor: "#000000",
    activeWordColor: "#ff3131",
    activeWordBackground: null
  },
  neon: {
    fontFamily: "IBM Plex Sans",
    fontSize: 0.055,
    bold: true,
    uppercase: false,
    color: "#00f0ff",
    backgroundColor: "#000000aa",
    outlineWidth: 0,
    outlineColor: "#000000",
    activeWordColor: "#ff00e5",
    activeWordBackground: null
  },
  contrast: {
    fontFamily: "IBM Plex Sans",
    fontSize: 0.05,
    bold: true,
    uppercase: false,
    color: "#0a0a0a",
    backgroundColor: "#ffffffe6",
    outlineWidth: 0,
    outlineColor: "#000000",
    activeWordColor: "#d90429",
    activeWordBackground: null
  },
  mint: {
    fontFamily: "IBM Plex Sans",
    fontSize: 0.05,
    bold: true,
    uppercase: false,
    color: "#eafff5",
    backgroundColor: "#0c3b2ecc",
    outlineWidth: 0,
    outlineColor: "#000000",
    activeWordColor: "#0c3b2e",
    activeWordBackground: "#7df9aa"
  },
  bubblegum: {
    fontFamily: "IBM Plex Sans",
    fontSize: 0.055,
    bold: true,
    uppercase: false,
    color: "#ffffff",
    backgroundColor: null,
    outlineWidth: 5e-3,
    outlineColor: "#7a1e5c",
    activeWordColor: "#ffffff",
    activeWordBackground: "#ff5fa2"
  }
};
var defaultCaptionAnimation = (preset) => {
  if (preset === "karaoke") return "karaoke";
  if (preset === "impact") return "impactPop";
  const v = CAPTION_PRESET_VISUALS[preset];
  if (v.activeWordBackground != null) return "boxHighlight";
  if (v.activeWordColor !== v.color) return "highlight";
  return "none";
};
var isCaptionPreset = (v) => typeof v === "string" && CAPTION_PRESETS.includes(v);
var isCaptionAnimation = (v) => typeof v === "string" && CAPTION_ANIMATIONS.includes(v);
var isTextBackgroundStyle = (v) => typeof v === "string" && TEXT_BACKGROUND_STYLES.includes(v);
var resolveCaptionVisual = (preset, overrides) => ({
  ...CAPTION_PRESET_VISUALS[preset],
  ...overrides
});
var captionAnimationColorParam = (animation) => animation === "boxHighlight" ? "boxColour" : animation === "colourHighlight" ? "textColour" : null;
var resolveCaptionAnimation = (animation, color = "#000000") => {
  const param = captionAnimationColorParam(animation);
  return param ? { key: `${animation}V2`, extraParams: [{ key: param, value: color }] } : { key: animation };
};
var captionAnimationColor = (visual, animation) => {
  const param = captionAnimationColorParam(animation);
  const presetColour = param === "boxColour" ? visual.activeWordBackground : param === "textColour" ? visual.activeWordColor : null;
  return visual.animationColor ?? presetColour ?? "#000000";
};
var subtitleWordCount = (text) => text.split("	").join(" ").split("\n").join(" ").split(" ").length || 1;
var captionAnimationLength = (cueStart, cueEnd, text) => (cueEnd - cueStart) / subtitleWordCount(text);

// src/exportPresets.ts
var EXPORT_PRESETS = {
  draft: { crf: 23, preset: "veryfast", maxWidth: 854, fpsLimit: 30 },
  standard: { crf: 20, preset: "veryfast", maxWidth: 1280, fpsLimit: 30 },
  hd: { crf: 20, preset: "veryfast", maxWidth: 1920, fpsLimit: 30 },
  uhd: { crf: 20, preset: "veryfast", maxWidth: 4096, fpsLimit: 60 }
};
var EXPORT_QUALITIES = Object.keys(
  EXPORT_PRESETS
);
var scaledOutputSize = (width, height, quality) => {
  const { maxWidth } = EXPORT_PRESETS[quality];
  const factor = width > maxWidth ? maxWidth / width : 1;
  const even = (n) => Math.max(2, 2 * Math.floor(n * factor / 2));
  return { width: even(width), height: even(height) };
};

// src/codec.ts
var encodeProject = (scene) => ({
  schemaVersion: SCHEMA_VERSION,
  scene
});
var num = (v, def) => typeof v === "number" && Number.isFinite(v) ? v : def;
var str = (v, def) => typeof v === "string" ? v : def;
var bool = (v, def) => typeof v === "boolean" ? v : def;
var asRecord = (v) => v && typeof v === "object" ? v : {};
var decodeFilters = (v) => {
  const o = asRecord(v);
  const d = defaultFilters();
  return {
    brightness: num(o.brightness, d.brightness),
    contrast: num(o.contrast, d.contrast),
    saturation: num(o.saturation, d.saturation),
    exposure: num(o.exposure, d.exposure),
    hue: num(o.hue, d.hue),
    sharpen: num(o.sharpen, d.sharpen),
    blur: num(o.blur, d.blur),
    noise: num(o.noise, d.noise),
    vignette: num(o.vignette, d.vignette),
    opacity: num(o.opacity, d.opacity)
  };
};
var decodeTransform = (v) => {
  const o = asRecord(v);
  const pos = asRecord(o.position);
  const size = asRecord(o.size);
  return {
    position: { x: num(pos.x, 0.5), y: num(pos.y, 0.5) },
    size: { w: num(size.w, 0.3), h: num(size.h, 0.3) },
    rotation: num(o.rotation, 0)
  };
};
var decodeAnimation = (v) => {
  if (!v || typeof v !== "object") return null;
  const o = v;
  return {
    id: str(o.id, ""),
    startTime: num(o.startTime, 0),
    duration: num(o.duration, 0)
  };
};
var decodeAnimationData = (v) => {
  const o = asRecord(v);
  const p = asRecord(o.animationParams);
  const loop = p.loop ? asRecord(p.loop) : null;
  return {
    animation: str(o.animation, "none"),
    animationParams: {
      length: num(p.length, 0),
      startTime: num(p.startTime, 0),
      ...p.delay !== void 0 ? { delay: num(p.delay, 0) } : {},
      ...loop ? { loop: { length: num(loop.length, 0) } } : {},
      ...p.calculateTimings !== void 0 ? { calculateTimings: bool(p.calculateTimings, false) } : {}
    }
  };
};
var decodeAnimations = (v) => {
  if (!Array.isArray(v) || v.length !== 3) return void 0;
  return [
    decodeAnimationData(v[0]),
    decodeAnimationData(v[1]),
    decodeAnimationData(v[2])
  ];
};
var decodeOrigin = (v) => {
  if (!v || typeof v !== "object") return null;
  const o = v;
  if (o.by !== "user" && o.by !== "agent") return null;
  return {
    by: o.by,
    runId: typeof o.runId === "string" ? o.runId : null
  };
};
var decodeElement = (raw) => {
  const o = asRecord(raw);
  const id = str(o.id, "");
  if (!id) return null;
  const kind = o.kind;
  const animations = decodeAnimations(o.animations);
  const base = {
    id,
    startTime: num(o.startTime, 0),
    endTime: num(o.endTime, 0),
    zIndex: num(o.zIndex, 0),
    animation: decodeAnimation(o.animation),
    ...animations ? { animations } : {},
    fadeIn: num(o.fadeIn, 0),
    fadeOut: num(o.fadeOut, 0),
    origin: decodeOrigin(o.origin)
  };
  switch (kind) {
    case "video":
      return {
        ...base,
        kind: "video",
        assetId: str(o.assetId, ""),
        src: str(o.src, ""),
        transform: decodeTransform(o.transform),
        filters: decodeFilters(o.filters),
        volume: num(o.volume, 1),
        playbackRate: num(o.playbackRate, 1),
        trimStart: num(o.trimStart, 0),
        trimEnd: num(o.trimEnd, base.endTime),
        flipX: bool(o.flipX, false),
        flipY: bool(o.flipY, false),
        loop: bool(o.loop, false),
        ...Array.isArray(o.effects) ? {
          effects: o.effects.filter(
            (e) => typeof e === "string"
          )
        } : {}
      };
    case "audio":
      return {
        ...base,
        kind: "audio",
        assetId: str(o.assetId, ""),
        src: str(o.src, ""),
        volume: num(o.volume, 1),
        playbackRate: num(o.playbackRate, 1),
        trimStart: num(o.trimStart, 0),
        trimEnd: num(o.trimEnd, base.endTime)
      };
    case "text":
      return {
        ...base,
        kind: "text",
        text: str(o.text, ""),
        transform: decodeTransform(o.transform),
        filters: decodeFilters(o.filters),
        fontFamily: str(o.fontFamily, "Inter, sans-serif"),
        fontSize: num(o.fontSize, 0.06),
        lineHeight: num(o.lineHeight, 1.2),
        color: str(o.color, "#ffffff"),
        align: o.align === "left" || o.align === "right" ? o.align : "center",
        bold: bool(o.bold, false),
        italic: bool(o.italic, false),
        backgroundColor: typeof o.backgroundColor === "string" ? o.backgroundColor : null,
        ...isTextBackgroundStyle(o.backgroundStyle) ? { backgroundStyle: o.backgroundStyle } : {},
        outlineWidth: num(o.outlineWidth, 0),
        outlineColor: str(o.outlineColor, "#000000"),
        shadowBlur: num(o.shadowBlur, 0),
        shadowColor: str(o.shadowColor, "#000000")
      };
    case "sticker":
      return {
        ...base,
        kind: "sticker",
        assetId: typeof o.assetId === "string" ? o.assetId : null,
        src: str(o.src, ""),
        transform: decodeTransform(o.transform),
        filters: decodeFilters(o.filters),
        scalable: bool(o.scalable, false)
      };
    default:
      return null;
  }
};
var decodeWords = (raw) => {
  if (!Array.isArray(raw)) return [];
  const words = [];
  for (const w of raw) {
    const o = asRecord(w);
    const text = str(o.text, "");
    if (!text) continue;
    words.push({ start: num(o.start, 0), end: num(o.end, 0), text });
  }
  return words;
};
var decodeCue = (raw) => {
  const o = asRecord(raw);
  return {
    id: str(o.id, ""),
    start: num(o.start, 0),
    end: num(o.end, 0),
    text: str(o.text, ""),
    words: decodeWords(o.words),
    speaker: typeof o.speaker === "string" ? o.speaker : null,
    origin: decodeOrigin(o.origin)
  };
};
var decodeCaptionOverrides = (raw) => {
  if (typeof raw !== "object" || raw === null) return void 0;
  const o = raw;
  const out = {};
  if (typeof o.fontFamily === "string") out.fontFamily = o.fontFamily;
  if (typeof o.fontSize === "number") out.fontSize = o.fontSize;
  if (typeof o.bold === "boolean") out.bold = o.bold;
  if (typeof o.uppercase === "boolean") out.uppercase = o.uppercase;
  if (typeof o.color === "string") out.color = o.color;
  if (typeof o.backgroundColor === "string" || o.backgroundColor === null)
    out.backgroundColor = o.backgroundColor;
  if (isTextBackgroundStyle(o.backgroundStyle))
    out.backgroundStyle = o.backgroundStyle;
  if (typeof o.outlineWidth === "number") out.outlineWidth = o.outlineWidth;
  if (typeof o.outlineColor === "string") out.outlineColor = o.outlineColor;
  if (typeof o.activeWordColor === "string")
    out.activeWordColor = o.activeWordColor;
  if (typeof o.activeWordBackground === "string" || o.activeWordBackground === null)
    out.activeWordBackground = o.activeWordBackground;
  if (typeof o.animationColor === "string") out.animationColor = o.animationColor;
  return Object.keys(out).length > 0 ? out : void 0;
};
var decodeSubtitleTracks = (raw) => {
  const out = {};
  const o = asRecord(raw);
  for (const key of Object.keys(o)) {
    const t = asRecord(o[key]);
    const id = str(t.id, key);
    const style = asRecord(t.style);
    const def = defaultSubtitleStyle();
    const overrides = decodeCaptionOverrides(style.overrides);
    out[id] = {
      id,
      language: str(t.language, "en"),
      cues: Array.isArray(t.cues) ? t.cues.map(decodeCue) : [],
      style: {
        preset: isCaptionPreset(style.preset) ? style.preset : def.preset,
        animation: isCaptionAnimation(style.animation) ? style.animation : def.animation,
        ...overrides ? { overrides } : {}
      }
    };
  }
  return out;
};
var decodeTransitions = (raw) => {
  const out = {};
  const o = asRecord(raw);
  for (const key of Object.keys(o)) {
    const t = asRecord(o[key]);
    const id = str(t.id, key);
    out[id] = {
      id,
      fromElementId: str(t.fromElementId, ""),
      toElementId: str(t.toElementId, ""),
      kind: str(t.kind, ""),
      duration: num(t.duration, 0)
    };
  }
  return out;
};
var decodeProject = (wire) => {
  const root = asRecord(wire);
  const rawScene = asRecord(root.scene);
  const base = createEmptyScene();
  const canvas = asRecord(rawScene.canvas);
  const elementsRaw = asRecord(rawScene.elements);
  const elements = {};
  for (const key of Object.keys(elementsRaw)) {
    const decoded = decodeElement(elementsRaw[key]);
    if (decoded) elements[decoded.id] = decoded;
  }
  const rawOrder = Array.isArray(rawScene.elementOrder) ? rawScene.elementOrder.filter(
    (id) => typeof id === "string"
  ) : [];
  const seen = /* @__PURE__ */ new Set();
  const order = [];
  for (const id of rawOrder) {
    if (elements[id] && !seen.has(id)) {
      seen.add(id);
      order.push(id);
    }
  }
  for (const id of Object.keys(elements)) {
    if (!seen.has(id)) {
      seen.add(id);
      order.push(id);
    }
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    canvas: {
      width: num(canvas.width, base.canvas.width),
      height: num(canvas.height, base.canvas.height)
    },
    backgroundColor: str(rawScene.backgroundColor, base.backgroundColor),
    backgroundImage: rawScene.backgroundImage && typeof rawScene.backgroundImage === "object" && typeof rawScene.backgroundImage.url === "string" ? { url: rawScene.backgroundImage.url } : null,
    fps: num(rawScene.fps, base.fps),
    duration: num(rawScene.duration, base.duration),
    elements,
    elementOrder: order,
    subtitleTracks: decodeSubtitleTracks(rawScene.subtitleTracks),
    transitions: decodeTransitions(rawScene.transitions)
  };
};

// src/invariants.ts
var isMedia = (el) => el.kind === "video" || el.kind === "audio";
var stableStringify = (v) => {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  const o = v;
  const keys = Object.keys(o).filter((k) => o[k] !== void 0).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(o[k])}`).join(",")}}`;
};
var validateSceneInvariants = (scene, opts = {}) => {
  const out = [];
  const push = (code, message, path) => out.push(path === void 0 ? { code, message } : { code, message, path });
  const frame = scene.fps > 0 ? 1 / scene.fps : 1 / 30;
  if (!(scene.fps > 0)) push("BAD_FPS", `fps must be > 0, got ${scene.fps}`);
  if (!(scene.canvas.width > 0) || !(scene.canvas.height > 0))
    push(
      "BAD_CANVAS",
      `canvas must be positive, got ${scene.canvas.width}x${scene.canvas.height}`
    );
  if (!(scene.duration >= 0))
    push("BAD_DURATION", `duration must be >= 0, got ${scene.duration}`);
  const roundTripped = decodeProject(encodeProject(scene));
  if (stableStringify(roundTripped) !== stableStringify(scene)) {
    push(
      "CODEC_UNSTABLE",
      "scene does not survive encode\u2192decode unchanged (unknown fields or out-of-contract values)"
    );
  }
  const ids = Object.keys(scene.elements);
  const orderSet = new Set(scene.elementOrder);
  if (orderSet.size !== scene.elementOrder.length)
    push("ORDER_DUPLICATES", "elementOrder contains duplicate ids");
  for (const id of scene.elementOrder)
    if (!scene.elements[id])
      push("ORDER_UNKNOWN_ID", `elementOrder references missing element`, id);
  for (const id of ids)
    if (!orderSet.has(id))
      push("ORDER_MISSING_ID", `element not present in elementOrder`, id);
  let maxEnd = 0;
  for (const id of ids) {
    const el = scene.elements[id];
    if (!el) continue;
    if (el.id !== id)
      push(
        "ELEMENT_KEY_MISMATCH",
        `record key ${id} != element.id ${el.id}`,
        id
      );
    if (!(el.startTime >= 0))
      push("NEGATIVE_START", `startTime ${el.startTime} < 0`, id);
    if (!(el.endTime > el.startTime))
      push(
        "EMPTY_RANGE",
        `endTime ${el.endTime} <= startTime ${el.startTime}`,
        id
      );
    maxEnd = Math.max(maxEnd, el.endTime);
    if (isVisual(el)) {
      const { w, h } = el.transform.size;
      if (!(w > 0) || !(h > 0))
        push("BAD_SIZE", `size must be positive, got ${w}x${h}`, id);
    }
    if (el.kind === "text" && !(el.fontSize > 0))
      push("BAD_FONT_SIZE", `fontSize must be > 0, got ${el.fontSize}`, id);
    if (isMedia(el)) {
      if (!(el.trimStart >= 0))
        push("TRIM_NEGATIVE", `trimStart ${el.trimStart} < 0`, id);
      if (!(el.trimEnd > el.trimStart))
        push(
          "TRIM_EMPTY",
          `trimEnd ${el.trimEnd} <= trimStart ${el.trimStart}`,
          id
        );
      if (!(el.playbackRate > 0))
        push("BAD_RATE", `playbackRate ${el.playbackRate} <= 0`, id);
      const timelineLen = el.endTime - el.startTime;
      const sourceLen = (el.trimEnd - el.trimStart) / el.playbackRate;
      if (el.kind === "video" && !el.loop && Math.abs(timelineLen - sourceLen) > frame) {
        push(
          "DURATION_MISMATCH",
          `timeline length ${timelineLen.toFixed(4)}s != trimmed source ${sourceLen.toFixed(4)}s (\xB11 frame)`,
          id
        );
      }
      if (opts.assets) {
        const asset = el.assetId ? opts.assets.get(el.assetId) : void 0;
        if (!asset)
          push("UNKNOWN_ASSET", `references unknown asset "${el.assetId}"`, id);
        else {
          if (asset.status !== "READY")
            push("ASSET_NOT_READY", `asset ${asset.id} is ${asset.status}`, id);
          if (typeof asset.durationSec === "number" && el.trimEnd > asset.durationSec + frame)
            push(
              "TRIM_OUT_OF_BOUNDS",
              `trimEnd ${el.trimEnd}s exceeds asset duration ${asset.durationSec}s`,
              id
            );
        }
      }
    }
  }
  if (ids.length > 0 && scene.duration + frame < maxEnd)
    push(
      "DURATION_TOO_SHORT",
      `scene.duration ${scene.duration}s < last element end ${maxEnd}s`
    );
  if (opts.expectContiguousVideo) {
    const allVideos = ids.map((id) => scene.elements[id]).filter(
      (el) => Boolean(el && el.kind === "video")
    );
    const baseZ = Math.min(...allVideos.map((v) => v.zIndex));
    const videos = allVideos.filter((v) => v.zIndex === baseZ).sort((a, b) => a.startTime - b.startTime);
    for (let i = 1; i < videos.length; i++) {
      const prev = videos[i - 1];
      const cur = videos[i];
      if (!prev || !cur) continue;
      const gap = cur.startTime - prev.endTime;
      if (gap > frame)
        push("VIDEO_GAP", `gap of ${gap.toFixed(4)}s before clip`, cur.id);
      if (gap < -frame)
        push(
          "VIDEO_OVERLAP",
          `overlaps previous clip by ${(-gap).toFixed(4)}s`,
          cur.id
        );
    }
    const last = videos[videos.length - 1];
    if (last && Math.abs(scene.duration - last.endTime) > frame)
      push(
        "DURATION_NOT_TIGHT",
        `scene.duration ${scene.duration}s != last video end ${last.endTime}s`
      );
  }
  for (const t of Object.values(scene.transitions)) {
    if (!scene.elements[t.fromElementId] || !scene.elements[t.toElementId])
      push(
        "TRANSITION_DANGLING",
        `transition references missing element(s)`,
        t.id
      );
  }
  if (opts.targetDuration) {
    const { seconds, toleranceSec } = opts.targetDuration;
    if (Math.abs(scene.duration - seconds) > toleranceSec)
      push(
        "TARGET_DURATION_MISSED",
        `scene.duration ${scene.duration}s outside ${seconds}\xB1${toleranceSec}s`
      );
  }
  const hasVideo = ids.some((id) => scene.elements[id]?.kind === "video");
  for (const trackId of Object.keys(scene.subtitleTracks)) {
    const track = scene.subtitleTracks[trackId];
    if (!track) continue;
    const sorted = [...track.cues].sort((a, b) => a.start - b.start);
    for (let i = 0; i < sorted.length; i++) {
      const cue = sorted[i];
      if (!cue) continue;
      const p = `${trackId}/${cue.id}`;
      if (!cue.text.trim()) push("EMPTY_CUE", "cue has no text", p);
      if (!(cue.end > cue.start))
        push("CUE_EMPTY_RANGE", `cue end ${cue.end} <= start ${cue.start}`, p);
      const prev = sorted[i - 1];
      if (prev && cue.start < prev.end - frame)
        push("CUE_OVERLAP", `cue overlaps previous cue ${prev.id}`, p);
      for (const w of cue.words) {
        if (w.start < cue.start - frame || w.end > cue.end + frame) {
          push("WORD_OUT_OF_CUE", `word "${w.text}" outside cue range`, p);
          break;
        }
      }
      if (hasVideo) {
        const covered = ids.some((id) => {
          const el = scene.elements[id];
          return el?.kind === "video" && cue.start >= el.startTime - frame && cue.end <= el.endTime + frame;
        });
        if (!covered)
          push("CUE_OUTSIDE_VIDEO", "cue is not covered by any video clip", p);
      }
    }
  }
  return out;
};

// src/renderTask.ts
var effectEntries = (names) => {
  const entries = (names ?? []).map((name) => ({ name, file: effectShaderFile(name) })).filter((e) => !!e.file).map((e, id) => ({ label: e.name, file: e.file, id, icon: null }));
  return entries.length ? entries : [{ label: "None", file: "", id: 0, icon: null }];
};
var sceneToRenderTask = (scene, opts) => {
  const videos = [];
  const audioStreams = [];
  const texts = [];
  const stickers = [];
  const zIndexOf = new Map(scene.elementOrder.map((id, i) => [id, i]));
  if (scene.backgroundImage?.url) {
    stickers.push({
      uuid: "__background-image",
      onlineURL: scene.backgroundImage.url,
      startTime: 0,
      endTime: scene.duration,
      position: { x: 0.5, y: 0.5 },
      size: { width: 1, height: 1 },
      rotation: 0,
      zIndex: -1,
      opacity: 100
    });
  }
  for (const id of scene.elementOrder) {
    const el = scene.elements[id];
    if (!el) continue;
    const z = zIndexOf.get(id) ?? 0;
    if (el.kind === "video") {
      const url = opts.resolveAssetUrl(el.assetId) ?? el.src;
      if (!url) continue;
      videos.push(mapVideo(el, url, z));
    } else if (el.kind === "audio") {
      const url = opts.resolveAssetUrl(el.assetId) ?? el.src;
      if (!url) continue;
      if (el.volume <= 0) continue;
      audioStreams.push({
        startTime: el.startTime,
        trimStart: el.trimStart,
        trimEnd: el.trimEnd,
        playbackRate: el.playbackRate,
        onlineURL: url,
        volume: el.volume,
        fadeInDuration: el.fadeIn,
        fadeOutDuration: el.fadeOut
      });
    } else if (el.kind === "text") {
      texts.push(mapText(el, scene, z));
    } else if (el.kind === "sticker") {
      const url = opts.resolveAssetUrl(el.assetId ?? "") ?? el.src;
      if (!url) continue;
      stickers.push(mapSticker(el, url, z));
    }
  }
  for (const track of Object.values(scene.subtitleTracks)) {
    const visual = resolveCaptionVisual(track.style.preset, track.style.overrides);
    for (const cue of track.cues) {
      texts.push(mapCueText(cue, visual, scene, track.style.animation));
    }
  }
  const quality = opts.quality ?? "hd";
  const preset = EXPORT_PRESETS[quality];
  const output = scaledOutputSize(
    scene.canvas.width,
    scene.canvas.height,
    quality
  );
  return {
    edit: {
      renderType: "project",
      version: "v4",
      projectName: opts.projectName ?? "FrameTake export",
      outputWidth: output.width,
      outputHeight: output.height,
      outputDuration: scene.duration,
      backgroundColor: scene.backgroundColor,
      videos,
      audioStreams,
      texts,
      stickers,
      transitions: Object.values(scene.transitions).map((t) => ({
        startTarget: t.fromElementId,
        endTarget: t.toElementId,
        type: transitionTypeFor(t.kind),
        duration: t.duration
      })),
      exportSettings: {
        mode: "crf",
        crf: preset.crf,
        preset: preset.preset,
        fpsLimit: Math.min(opts.fpsLimit ?? scene.fps, preset.fpsLimit),
        name: quality
      },
      fontAssets: opts.fontAssets ?? [],
      gpuDecode: false,
      gpuEncode: false
    },
    uuid: opts.uuid
  };
};
var engineAdjustments = (f) => {
  const scaled = scaleFiltersToEngine(f);
  const out = {};
  for (const key of Object.keys(scaled)) {
    if (scaled[key] !== 0) out[key] = scaled[key];
  }
  return out;
};
var mapVideo = (el, url, zIndex) => ({
  uuid: el.id,
  url,
  startTime: el.startTime,
  trimStart: el.trimStart,
  trimEnd: el.trimEnd,
  playbackRate: el.playbackRate,
  translateX: el.transform.position.x,
  translateY: el.transform.position.y,
  width: el.transform.size.w,
  height: el.transform.size.h,
  rotationAngle: el.transform.rotation,
  flipX: el.flipX,
  flipY: el.flipY,
  zIndex,
  volume: el.volume,
  opacity: el.filters.opacity * 100,
  // Audio ramp (the engine's only use of these fields on videos).
  fadeInDuration: el.fadeIn,
  fadeOutDuration: el.fadeOut,
  // In/out/loop + fade animations via the shared resolveEngineAnimations —
  // the SAME builder the WebGL preview uses, so export matches the editor.
  ...animationsField(el),
  // Named effects (engine kernels by `file`), or the explicit no-op when none —
  // omitting `effects` makes the engine try a default LUT's metadata and fail.
  effects: effectEntries(el.effects),
  lutURL: "",
  lutIntensity: 1,
  // Colour correction + effects (brightness/contrast/saturation/exposure/hue/
  // sharpen/blur/noise/vignette) at the engine scale, root-keyed.
  ...engineAdjustments(el.filters)
});
var mapSticker = (el, url, zIndex) => ({
  // BOTH uuid and onlineURL are required — the parser silently SKIPS
  // stickers missing either.
  uuid: el.id,
  onlineURL: url,
  startTime: el.startTime,
  endTime: el.endTime,
  // ParseFields' vec2 reader matches keys x/y and width/height (NOT w/h).
  position: { x: el.transform.position.x, y: el.transform.position.y },
  size: { width: el.transform.size.w, height: el.transform.size.h },
  rotation: el.transform.rotation,
  zIndex,
  opacity: el.filters.opacity * 100,
  ...animationsField(el),
  // Stickers carry the same colour/effects adjustments as videos (the engine
  // parses them identically and the preview's mapBase applies them too).
  ...engineAdjustments(el.filters)
});
var mapText = (el, scene, zIndex) => ({
  value: el.text,
  from: el.startTime,
  to: el.endTime,
  x: el.transform.position.x,
  y: el.transform.position.y,
  // Task text size is width-relative; scene fontSize is height-relative.
  size: el.fontSize * (scene.canvas.height / scene.canvas.width),
  font: el.fontFamily.split(",")[0]?.trim() ?? "Arial",
  color: el.color,
  ...el.backgroundColor ? { bg: el.backgroundColor } : {},
  align: el.align,
  lineHeight: el.lineHeight,
  letterSpacing: 0,
  wrapWidth: el.transform.size.w,
  rotation: el.transform.rotation,
  zIndex,
  display: backgroundDisplayMode(!!el.backgroundColor, el.backgroundStyle),
  emphasis: el.bold ? "bold" : "normal",
  opacity: el.filters.opacity * 100,
  ...animationsField(el),
  // Guarded: em-fraction sizes divide by fontSize; a zero fontSize (invalid,
  // also caught by BAD_FONT_SIZE) must not put Infinity into the task JSON.
  ...el.outlineWidth > 0 && el.fontSize > 0 ? {
    outline: {
      size: el.outlineWidth / el.fontSize,
      color: el.outlineColor
    }
  } : {},
  ...el.shadowBlur > 0 && el.fontSize > 0 ? {
    shadow: {
      size: el.shadowBlur / el.fontSize,
      color: el.shadowColor,
      offset: { x: 0, y: 0 }
    }
  } : {}
});
var mapCueText = (cue, visual, scene, animation) => {
  const anim = resolveCaptionAnimation(
    animation,
    captionAnimationColor(visual, animation)
  );
  const animLength = captionAnimationLength(cue.start, cue.end, cue.text);
  return {
    value: visual.uppercase ? cue.text.toUpperCase() : cue.text,
    from: cue.start,
    to: cue.end,
    x: 0.5,
    y: 0.85,
    size: visual.fontSize * (scene.canvas.height / scene.canvas.width),
    font: visual.fontFamily.split(",")[0]?.trim() ?? "Arial",
    color: visual.color,
    ...visual.backgroundColor ? { bg: visual.backgroundColor } : {},
    align: "center",
    lineHeight: 1.25,
    letterSpacing: 0,
    wrapWidth: 0.8,
    rotation: 0,
    zIndex: 1e3,
    display: backgroundDisplayMode(!!visual.backgroundColor, visual.backgroundStyle),
    emphasis: visual.bold ? "bold" : "normal",
    opacity: 100,
    ...visual.outlineWidth > 0 && visual.fontSize > 0 ? {
      outline: {
        size: visual.outlineWidth / visual.fontSize,
        color: visual.outlineColor
      }
    } : {},
    // Word-synced caption animation: the engine's textAnimations/<key>.json
    // driven by per-word timings. Timeline seconds, NOT cue-relative — the
    // renderer walks word starts against frame.timelineTime. The headless
    // parser ONLY honours customTimings.words (a top-level words array is
    // the internal composition contract and gets ignored).
    ...animation !== "none" && cue.words.length > 0 ? {
      animations: [
        {
          animation: anim.key,
          animationParams: {
            startTime: cue.start,
            length: animLength,
            ...anim.extraParams ? { extraParams: anim.extraParams } : {}
          }
        }
      ],
      customTimings: {
        words: cue.words.map((w) => ({ start: w.start, end: w.end }))
      },
      ...anim.extraParams ? { extraParams: anim.extraParams } : {}
    } : {}
  };
};
var TRANSITION_TYPES = {
  // Friendly aliases.
  crossfade: "transition_crossDissolve",
  dissolve: "transition_crossDissolve",
  "fade-black": "transition_fadeColorBlack",
  "fade-white": "transition_fadeColorWhite",
  "slide-left": "transition_directionalHorizontal",
  "slide-right": "transition_directionalRight",
  "slide-up": "transition_directionalUp",
  "slide-down": "transition_directionalVertical",
  // The full engine inventory (shaders/transitions/*.frag), kebab-cased.
  "simple-zoom": "transition_simpleZoom",
  "linear-blur": "transition_linearBlur",
  rotate: "transition_rotate",
  "circle-crop": "transition_circleCrop",
  "cross-warp": "transition_crossWarp",
  splice: "transition_splice",
  "page-flip": "transition_pageFlip",
  "minimise-top-left": "transition_minimiseTopLeft",
  "minimise-top-right": "transition_minimiseTopRight",
  "minimise-bottom-left": "transition_minimiseBottomLeft",
  "minimise-bottom-right": "transition_minimiseBottomRight",
  "two-stripes": "transition_twoStripes",
  // F5 dual-build gl-transitions ports (2026-07-05):
  swirl: "transition_swirl",
  "glitch-memories": "transition_glitchMemories",
  "window-slice": "transition_windowSlice",
  cube: "transition_cube",
  doorway: "transition_doorway",
  pinwheel: "transition_pinwheel",
  "water-drop": "transition_waterDrop",
  crosshatch: "transition_crosshatch",
  dreamy: "transition_dreamy",
  angular: "transition_angular",
  burn: "transition_burn",
  heart: "transition_heart",
  "circle-open": "transition_circleOpen",
  "color-phase": "transition_colorPhase",
  "squares-wire": "transition_squaresWire",
  "three-stripes": "transition_threeStripes",
  box: "transition_box",
  "sliding-door-horizontal": "transition_slidingDoorHorizontal",
  "sliding-door-vertical": "transition_slidingDoorVertical",
  "diagonal-splice": "transition_diagonalSplice",
  ripple: "transition_ripple",
  "fold-horizontal": "transition_foldHorizontal",
  "fold-vertical": "transition_foldVertical",
  "gradient-fade": "transition_gradientFade",
  bullseye: "transition_bullseye"
};
var TRANSITION_KINDS = Object.keys(TRANSITION_TYPES);
var transitionTypeFor = (kind) => kind.startsWith("transition_") ? kind : TRANSITION_TYPES[kind] ?? kind;
var animationsField = (el) => {
  const animations = resolveEngineAnimations(el);
  return animations.length > 0 ? { animations } : {};
};

// src/rustScene.ts
var BLACK = { r: 0, g: 0, b: 0, a: 1 };
var CSS_NAMED_COLORS = {
  black: "#000000",
  silver: "#c0c0c0",
  gray: "#808080",
  grey: "#808080",
  white: "#ffffff",
  maroon: "#800000",
  red: "#ff0000",
  purple: "#800080",
  fuchsia: "#ff00ff",
  magenta: "#ff00ff",
  green: "#008000",
  lime: "#00ff00",
  olive: "#808000",
  yellow: "#ffff00",
  navy: "#000080",
  blue: "#0000ff",
  teal: "#008080",
  aqua: "#00ffff",
  cyan: "#00ffff",
  orange: "#ffa500",
  transparent: "#00000000"
};
var hexToRustColor = (hex) => {
  const named = CSS_NAMED_COLORS[hex.trim().toLowerCase()];
  const h = /^#?([0-9a-fA-F]{3,8})$/.exec(named ?? hex.trim())?.[1];
  if (h === void 0) {
    if (hex.trim() !== "") {
      console.warn(`[scene-schema] unparseable colour '${hex}' \u2014 using black`);
    }
    return BLACK;
  }
  const at = (i) => h[i] ?? "0";
  const dup = (i) => parseInt(at(i) + at(i), 16) / 255;
  const pair = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
  switch (h.length) {
    case 3:
      return { r: dup(0), g: dup(1), b: dup(2), a: 1 };
    case 4:
      return { r: dup(0), g: dup(1), b: dup(2), a: dup(3) };
    case 6:
      return { r: pair(0), g: pair(2), b: pair(4), a: 1 };
    case 8:
      return { r: pair(0), g: pair(2), b: pair(4), a: pair(6) };
    default:
      console.warn(`[scene-schema] unparseable colour '${hex}' \u2014 using black`);
      return BLACK;
  }
};
var transformOf = (el, scene) => {
  const w = el.transform.size.w * scene.canvas.width;
  const h = el.transform.size.h * scene.canvas.height;
  return {
    position: [
      el.transform.position.x * scene.canvas.width - w / 2,
      el.transform.position.y * scene.canvas.height - h / 2
    ],
    size: [w, h],
    rotation_degrees: el.transform.rotation,
    ...el.transform.anchor ? { anchor: [el.transform.anchor.x, el.transform.anchor.y] } : {}
  };
};
var RUST_TEXT_ANIMATIONS = /* @__PURE__ */ new Set([
  "billboard",
  "block",
  "bounce",
  "boxBounce",
  "boxHighlight",
  "boxHighlightV2",
  "burst",
  "colourHighlight",
  "colourHighlightV2",
  "dragonfly",
  "dropIn",
  "fade",
  "fall",
  "flipClock",
  "flipboard",
  "floatInBottom",
  "floatInTop",
  "highlight",
  "impact",
  "impactPop",
  "karaoke",
  "loop-billboard",
  "loop-dragonfly",
  "loop-flipboard",
  "loop-heartBeat",
  "loop-roll",
  "loop-scale",
  "loop-slide",
  "loop-stretch",
  "loop-verticalStretch",
  "loop-vogue",
  "loop-wavey",
  "out-billboard",
  "out-burst",
  "out-dragonfly",
  "out-fall",
  "out-flipboard",
  "out-roll",
  "out-scale",
  "out-skid",
  "out-verticalStretch",
  "out-vogue",
  "out-wavey",
  "reveal",
  "roll",
  "scale",
  "scaleIn",
  "skid",
  "slideDown",
  "slideLeft",
  "slideRight",
  "slideUp",
  "stomp",
  "typewriter",
  "verticalStretch",
  "vogue",
  "wave",
  "wavey",
  "zoomIn",
  // W6: 8 newly-ported IN/OUT text presets (now data-driven render-lib builtins).
  "ascent",
  "compress",
  "blur",
  "evaporate",
  "out-block",
  "out-decompress",
  "out-sink",
  "out-stomp",
  // E6b: text-native block-group reverse of zoomIn (previously element-routed,
  // which shrank the layout box without zooming the glyphs).
  "out-zoomOut",
  // F1 dual-build preset pack (2026-07-05):
  "rubberIn",
  "whipUp",
  "glitchPop",
  "driftIn",
  "out-whipDown",
  "out-driftOut",
  "loop-breathe",
  "loop-shimmer"
]);
var animationsOf = (el, timelineFrom) => {
  const isText = el.kind === "text";
  const element = [];
  const text = [];
  for (const a of resolveEngineAnimations(el)) {
    const start_time = a.animationParams.startTime - timelineFrom;
    const loopInfo = a.animationParams.loop;
    const length = loopInfo ? loopInfo.length : a.animationParams.length;
    const loop = loopInfo ? { loop: true } : {};
    if (isText && RUST_TEXT_ANIMATIONS.has(a.animation)) {
      text.push({ name: a.animation, params: { start_time, length }, ...loop });
    } else {
      element.push({ name: a.animation, start_time, length, ...loop });
    }
  }
  return { element, text };
};
var NO_CROP = { left: 0, top: 0, right: 0, bottom: 0 };
var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
var hasFilters = (f) => f.lut != null && f.lut.intensity > 0 || f.brightness !== 0 || f.contrast !== 0 || f.saturation !== 0 || f.exposure !== 0 || f.hue !== 0 || f.sharpen !== 0 || f.blur !== 0 || f.noise !== 0 || f.vignette !== 0;
var adjustmentsOf = (f) => {
  const s = clamp(f.saturation, -1, 1);
  const e = clamp(f.exposure, -1, 1);
  return {
    brightness: 1 + clamp(f.brightness, -1, 1),
    contrast: 1 + clamp(f.contrast, -1, 1),
    saturation: s >= 0 ? 1 + 3 * s : s,
    exposure: e >= 0 ? 2 * e : e,
    hue_degrees: clamp(f.hue, -1, 1) * 180,
    sharpen: clamp(f.sharpen, 0, 1),
    blur: clamp(f.blur, 0, 1),
    noise: clamp(f.noise, 0, 1),
    vignette: clamp(f.vignette, 0, 1)
  };
};
var effectsOf = (f, names) => {
  const named = (names ?? []).filter((n) => !!n);
  if (!hasFilters(f) && named.length === 0) return {};
  const effects = { adjustments: adjustmentsOf(f) };
  if (named.length > 0)
    effects.effects = named.map((name) => ({
      name,
      shader_id: "",
      intensity: 1,
      props: {}
    }));
  if (f.lut != null && f.lut.intensity > 0) {
    effects.lut = {
      texture_id: `lut-${f.lut.name}`,
      intensity: clamp(f.lut.intensity, 0, 1)
    };
  }
  return { effects };
};
var textKind = (el, scene, textAnimations) => {
  const { width: W, height: H } = scene.canvas;
  const decoration = {
    outline_width: el.outlineWidth * H,
    shadow_offset: [0, 0],
    shadow_blur: el.shadowBlur * H,
    ...el.backgroundColor ? { background_color: hexToRustColor(el.backgroundColor) } : {},
    ...el.outlineWidth > 0 ? { outline_color: hexToRustColor(el.outlineColor) } : {},
    ...el.shadowBlur > 0 ? { shadow_color: hexToRustColor(el.shadowColor) } : {}
  };
  return {
    type: "text",
    text: el.text,
    font: {
      family: el.fontFamily.split(",")[0]?.trim() ?? "Inter",
      weight: el.bold ? 700 : 400,
      italic: el.italic
    },
    font_size: el.fontSize * H,
    align: el.align,
    // Background plate mode from the element's backgroundStyle (block = combined
    // plate; lineHard/lineRound = per-line plates). `normal` when no plate.
    display: backgroundDisplayMode(
      el.backgroundColor != null,
      el.backgroundStyle
    ),
    // veed always uses WORD wrap (CanvasRenderer `TextFeed.ts`: textWrap: Wrap.WRAP)
    // so oversized text wraps to multiple tight lines instead of stretching to one.
    text_wrap: "word",
    wrap_width: el.transform.size.w * W,
    // The engine's `line_height` is ABSOLUTE px (cosmic-text `Metrics::new(font_size,
    // line_height)`), NOT the multiplier FrameTake stores — so multiply by the px
    // font size. Passing the bare 1.15 ⇒ ~1px line height ⇒ wrapped lines collapse
    // onto each other (every word at the same y → garbled overlap).
    line_height: el.lineHeight * el.fontSize * H,
    letter_spacing: 0,
    color: hexToRustColor(el.color),
    opacity: el.filters.opacity,
    decoration,
    ...textAnimations.length > 0 ? { text_animations: textAnimations } : {}
  };
};
var RUST_TRANSITION_WIRE_KINDS = /* @__PURE__ */ new Set([
  "dissolve",
  "box",
  "bullseye",
  "circleCrop",
  "crossDissolve",
  "crossWarp",
  "diagonalSplice",
  "blur_reveal",
  "directional_left",
  "directional_right",
  "directional_up",
  "directional_down",
  "displacement",
  "fadeColorBlack",
  "fadeColorWhite",
  "foldHorizontal",
  "foldVertical",
  "gradientFade",
  "linearBlur",
  "minimiseBottomLeft",
  "minimiseBottomRight",
  "minimiseTopLeft",
  "minimiseTopRight",
  "pageFlip",
  "ripple",
  "rotate",
  "simpleZoom",
  "slidingDoorHorizontal",
  "slidingDoorVertical",
  "splice",
  "threeStripes",
  "twoStripes",
  // F5 dual-build gl-transitions ports (2026-07-05):
  "swirl",
  "glitchMemories",
  "windowSlice",
  "cube",
  "doorway",
  "pinwheel",
  "waterDrop",
  "crosshatch",
  "dreamy",
  "angular",
  "burn",
  "heart",
  "circleOpen",
  "colorPhase",
  "squaresWire"
]);
var EDITOR_TRANSITION_TO_WIRE = {
  crossfade: "dissolve",
  dissolve: "dissolve",
  "fade-black": "fadeColorBlack",
  "fade-white": "fadeColorWhite",
  "slide-left": "directional_left",
  "slide-right": "directional_right",
  "slide-up": "directional_up",
  "slide-down": "directional_down",
  "simple-zoom": "simpleZoom",
  "linear-blur": "linearBlur",
  rotate: "rotate",
  "circle-crop": "circleCrop",
  "cross-warp": "crossWarp",
  splice: "splice",
  "page-flip": "pageFlip",
  "minimise-top-left": "minimiseTopLeft",
  "minimise-top-right": "minimiseTopRight",
  "minimise-bottom-left": "minimiseBottomLeft",
  "minimise-bottom-right": "minimiseBottomRight",
  "two-stripes": "twoStripes",
  "three-stripes": "threeStripes",
  box: "box",
  "sliding-door-horizontal": "slidingDoorHorizontal",
  "sliding-door-vertical": "slidingDoorVertical",
  "diagonal-splice": "diagonalSplice",
  ripple: "ripple",
  "fold-horizontal": "foldHorizontal",
  "fold-vertical": "foldVertical",
  "gradient-fade": "gradientFade",
  bullseye: "bullseye",
  // F5 dual-build gl-transitions ports (2026-07-05):
  swirl: "swirl",
  "glitch-memories": "glitchMemories",
  "window-slice": "windowSlice",
  cube: "cube",
  doorway: "doorway",
  pinwheel: "pinwheel",
  "water-drop": "waterDrop",
  crosshatch: "crosshatch",
  dreamy: "dreamy",
  angular: "angular",
  burn: "burn",
  heart: "heart",
  "circle-open": "circleOpen",
  "color-phase": "colorPhase",
  "squares-wire": "squaresWire"
};
var TRANSITION_WIRE_ALIASES = {
  crossDissolve: "dissolve",
  cross_dissolve: "dissolve",
  directionalLeft: "directional_left",
  directionalHorizontal: "directional_left",
  directionalRight: "directional_right",
  directionalUp: "directional_up",
  directionalDown: "directional_down",
  directionalVertical: "directional_down",
  blurReveal: "blur_reveal"
};
var rustTransitionKind = (kind) => {
  const mapped = EDITOR_TRANSITION_TO_WIRE[kind];
  if (mapped) return mapped;
  const raw = kind.startsWith("transition_") ? kind.slice("transition_".length) : kind;
  const alias = TRANSITION_WIRE_ALIASES[raw];
  if (alias) return alias;
  return RUST_TRANSITION_WIRE_KINDS.has(raw) ? raw : null;
};
var MEDIA_BLEND_MODES = [
  "normal",
  "overlay",
  "difference",
  "multiply",
  "screen",
  "add",
  "lighten",
  "darken",
  "soft_light"
];
var MEDIA_MASK_SHAPES = [
  "none",
  "circle",
  "diamond",
  "hexagon",
  "star",
  "heart",
  "triangle"
];
function mediaCompositing(el) {
  const out = {};
  if (el.blendMode && el.blendMode !== "normal" && MEDIA_BLEND_MODES.includes(el.blendMode)) {
    out.blend_mode = el.blendMode;
  }
  if (el.maskShape === "circle" || el.maskShape === "diamond" || el.maskShape === "hexagon" || el.maskShape === "star" || el.maskShape === "heart" || el.maskShape === "triangle") {
    out.mask_shape = el.maskShape;
  }
  return out;
}
var RENDERED_TRANSITION_KINDS = TRANSITION_KINDS.filter(
  (k) => rustTransitionKind(k) !== null
);
var resolveTimelinesAndTransitions = (scene) => {
  const timelines = /* @__PURE__ */ new Map();
  for (const id of scene.elementOrder) {
    const el = scene.elements[id];
    if (el && el.kind !== "audio") {
      timelines.set(id, { from: el.startTime, to: el.endTime });
    }
  }
  const transitions = [];
  for (const t of Object.values(scene.transitions)) {
    const kind = rustTransitionKind(t.kind);
    const fromEl = scene.elements[t.fromElementId];
    const fromTl = timelines.get(t.fromElementId);
    const toTl = timelines.get(t.toElementId);
    if (!kind || !fromEl || !fromTl || !toTl) continue;
    const half = t.duration / 2;
    const boundary = fromEl.endTime;
    transitions.push({
      from: t.fromElementId,
      to: t.toElementId,
      timeline: { from: boundary - half, to: boundary + half },
      kind
    });
    fromTl.to = boundary + half;
    toTl.from = toTl.from - half;
  }
  return { timelines, transitions };
};
var captionMoveables = (scene) => {
  const out = [];
  for (const track of Object.values(scene.subtitleTracks)) {
    const visual = resolveCaptionVisual(
      track.style.preset,
      track.style.overrides
    );
    for (const cue of track.cues) {
      const el = {
        id: `${track.id}:${cue.id}`,
        kind: "text",
        startTime: cue.start,
        endTime: cue.end,
        zIndex: 1e3,
        animation: null,
        fadeIn: 0,
        fadeOut: 0,
        text: visual.uppercase ? cue.text.toUpperCase() : cue.text,
        transform: {
          position: { x: 0.5, y: 0.85 },
          // Tall invisible layout frame (only the text-hugging plate draws): the
          // Rust engine vertically CENTERS text in the moveable box but stops
          // centering — and cosmic-text CLIPS — once the wrapped text exceeds the
          // box height. A short box (0.2) drops/clips a 4+-line caption; a tall
          // box keeps the plate centred at y=0.85 for any line count. C++ sends a
          // point anchor with no height, so it never clips (buildCaptionMoveable).
          size: { w: 0.8, h: 0.7 },
          rotation: 0
        },
        filters: defaultFilters(),
        fontFamily: visual.fontFamily,
        fontSize: visual.fontSize,
        lineHeight: 1.25,
        color: visual.color,
        align: "center",
        bold: visual.bold,
        italic: visual.italic ?? false,
        backgroundColor: visual.backgroundColor,
        ...visual.backgroundStyle ? { backgroundStyle: visual.backgroundStyle } : {},
        outlineWidth: visual.outlineWidth,
        outlineColor: visual.outlineColor,
        shadowBlur: 0,
        shadowColor: "#000000"
      };
      const captionAnimationName = track.style.animation;
      const captionAnims = captionAnimationName !== "none" && captionAnimationColorParam(captionAnimationName) !== "boxColour" && cue.words.length > 0 ? [
        {
          name: resolveCaptionAnimation(
            captionAnimationName,
            captionAnimationColor(visual, captionAnimationName)
          ).key,
          params: {
            start_time: 0,
            // Fallback for OLDER engine binaries (no word_windows):
            // length = uniform per-word window; delay = same so words
            // reveal SEQUENTIALLY across the cue. The explicit delay is
            // required — hydration only inherits the builtin stagger
            // when delay is ABSENT, and the builtin stagger is a glyph
            // cascade, not the per-word cadence captions need.
            length: captionAnimationLength(cue.start, cue.end, cue.text),
            delay: captionAnimationLength(cue.start, cue.end, cue.text)
          },
          // E6c: real spoken word windows (moveable-local) — newer
          // engines sample each word over ITS OWN window, so karaoke/
          // highlight/reveal track speech instead of ticking uniformly.
          word_windows: cue.words.map((w) => ({
            from: w.start - cue.start,
            to: w.end - cue.start
          }))
        }
      ] : [];
      const kind = textKind(el, scene, captionAnims);
      if (kind.type === "text" && captionAnimationColorParam(track.style.animation) === "boxColour" && cue.words.length > 0) {
        const boxColor = visual.animationColor ?? visual.activeWordColor;
        const textChars = [...el.text];
        let cursor = 0;
        const findWord = (wordChars) => {
          for (let i = cursor; i + wordChars.length <= textChars.length; i++) {
            if (wordChars.every((c, j) => textChars[i + j] === c)) return i;
          }
          return -1;
        };
        const words = cue.words.map((w) => {
          const wtext = visual.uppercase ? w.text.toUpperCase() : w.text;
          const wordChars = [...wtext];
          const idx = findWord(wordChars);
          const start = idx >= 0 ? idx : cursor;
          const end = start + wordChars.length;
          cursor = end;
          return {
            start,
            end,
            from: w.start - cue.start,
            to: w.end - cue.start
          };
        });
        kind.word_highlight = { color: hexToRustColor(boxColor), words };
      }
      out.push({
        id: el.id,
        timeline: { from: cue.start, to: cue.end },
        transform: transformOf(el, scene),
        z_index: 1e3,
        kind
      });
    }
  }
  return out;
};
var BACKGROUND_IMAGE_TEXTURE_ID = "__background-image";
var sceneToRustScene = (scene) => {
  const { timelines, transitions } = resolveTimelinesAndTransitions(scene);
  const moveables = [];
  if (scene.backgroundImage?.url) {
    const to = Math.max(
      scene.duration,
      ...Object.values(scene.elements).map((el) => el.endTime),
      ...Object.values(scene.subtitleTracks).flatMap(
        (t) => t.cues.map((c) => c.end)
      )
    );
    moveables.push({
      id: BACKGROUND_IMAGE_TEXTURE_ID,
      timeline: { from: 0, to: Math.max(to, 1) },
      transform: {
        position: [0, 0],
        size: [scene.canvas.width, scene.canvas.height],
        rotation_degrees: 0
      },
      z_index: -1,
      kind: {
        type: "image",
        texture_id: BACKGROUND_IMAGE_TEXTURE_ID,
        opacity: 1,
        crop: NO_CROP,
        flip_x: false,
        flip_y: false
      }
    });
  }
  const zIndexOf = new Map(scene.elementOrder.map((id, i) => [id, i]));
  for (const id of scene.elementOrder) {
    const el = scene.elements[id];
    if (!el || el.kind === "audio") continue;
    const timeline = timelines.get(id);
    if (!timeline) continue;
    const { element, text } = animationsOf(el, timeline.from);
    let kind;
    if (el.kind === "video") {
      kind = {
        type: "video",
        texture_id: el.id,
        opacity: el.filters.opacity,
        crop: NO_CROP,
        flip_x: el.flipX,
        flip_y: el.flipY,
        ...effectsOf(el.filters, el.effects),
        ...mediaCompositing(el)
      };
    } else if (el.kind === "sticker") {
      kind = {
        type: "image",
        texture_id: el.id,
        opacity: el.filters.opacity,
        crop: NO_CROP,
        flip_x: false,
        flip_y: false,
        ...effectsOf(el.filters),
        ...mediaCompositing(el)
      };
    } else {
      kind = textKind(el, scene, text);
    }
    moveables.push({
      id: el.id,
      timeline: { from: timeline.from, to: timeline.to },
      transform: transformOf(el, scene),
      z_index: zIndexOf.get(el.id) ?? 0,
      ...element.length > 0 ? { element_animations: element } : {},
      kind
    });
  }
  moveables.push(...captionMoveables(scene));
  return {
    version: 1,
    resolution: { width: scene.canvas.width, height: scene.canvas.height },
    background: hexToRustColor(scene.backgroundColor),
    moveables,
    transitions,
    fontAssets: [],
    groups: Object.values(scene.groups ?? {}).map((group) => ({
      id: group.id,
      members: group.memberIds,
      ...group.pivot ? { pivot: [group.pivot.x, group.pivot.y] } : {},
      ...group.translate ? { translate: [group.translate.x, group.translate.y] } : {},
      ...group.scale !== void 0 ? { scale: group.scale } : {},
      ...group.rotationDegrees !== void 0 ? { rotation_degrees: group.rotationDegrees } : {},
      ...group.opacity !== void 0 ? { opacity: group.opacity } : {}
    }))
  };
};
export {
  ANIMATION_DURATION,
  AnimationSlot,
  BACKGROUND_IMAGE_TEXTURE_ID,
  CAPTION_ANIMATIONS,
  CAPTION_PRESETS,
  CAPTION_PRESET_VISUALS,
  ELEMENT_IN_ANIMATIONS,
  ELEMENT_LOOP_ANIMATIONS,
  ELEMENT_OUT_ANIMATIONS,
  EXPORT_PRESETS,
  EXPORT_QUALITIES,
  MEDIA_BLEND_MODES,
  MEDIA_MASK_SHAPES,
  MIN_ANIMATION_DURATION,
  RENDERED_TRANSITION_KINDS,
  RUST_TEXT_ANIMATIONS,
  RUST_TRANSITION_WIRE_KINDS,
  SCHEMA_VERSION,
  TEXT_BACKGROUND_STYLES,
  TEXT_IN_ANIMATIONS,
  TEXT_LOOP_ANIMATIONS,
  TEXT_OUT_ANIMATIONS,
  TRANSITION_KINDS,
  animationDefaults,
  animationPaletteFor,
  backgroundDisplayMode,
  captionAnimationColor,
  captionAnimationColorParam,
  captionAnimationLength,
  createEmptyScene,
  decodeProject,
  defaultCaptionAnimation,
  defaultCategoryAnimations,
  defaultFilters,
  defaultSubtitleStyle,
  effectShaderFile,
  encodeProject,
  getElementTotalDuration,
  getEndTime,
  getStartTime,
  hexToRustColor,
  isAnyAnimationSet,
  isCaptionAnimation,
  isCaptionPreset,
  isTextBackgroundStyle,
  isVisual,
  mapCategoriesToSavedAnimations,
  mapSavedAnimationsToCategories,
  migrateLegacyAnimation,
  resolveCaptionAnimation,
  resolveCaptionVisual,
  resolveEngineAnimations,
  rustTransitionKind,
  scaleFiltersToEngine,
  scaledOutputSize,
  sceneToRenderTask,
  sceneToRustScene,
  subtitleWordCount,
  transitionTypeFor,
  updateAnimationStartTime,
  validateSceneInvariants
};
//# sourceMappingURL=index.js.map