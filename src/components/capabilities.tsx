"use client";

import { useEffect, useRef, useState } from "react";

type Pill = {
  label: string;
  param: string;
  on?: string;
  note?: string;
  example?: Record<string, unknown>;
};

type Cap = {
  key: string;
  label: string;
  icon: string;
  desc: string;
  pills: Pill[];
};

const CAPS: Cap[] = [
  {
    key: "ingest",
    label: "Asset ingest",
    icon: "↓",
    desc: "Upload or reference video, audio, images, fonts, and LUTs. FrameLane handles metadata, proxies, transcoding, and problematic media inputs.",
    pills: [
      { label: "MP4", param: "source_url", on: "video element", example: { source_url: "https://cdn.example.com/clip.mp4" } },
      { label: "MOV", param: "source_url", on: "video element", example: { source_url: "https://cdn.example.com/clip.mov" } },
      { label: "ProRes", param: "source_url", on: "video element", example: { source_url: "https://cdn.example.com/clip_prores.mov" } },
      { label: "H.264", param: "source_url", on: "video element", example: { source_url: "https://cdn.example.com/clip_h264.mp4" } },
      { label: "H.265", param: "source_url", on: "video element", example: { source_url: "https://cdn.example.com/clip_h265.mp4" } },
      { label: "JPEG", param: "source_url", on: "image element", example: { source_url: "https://cdn.example.com/photo.jpg" } },
      { label: "PNG", param: "source_url", on: "image element", example: { source_url: "https://cdn.example.com/overlay.png" } },
      { label: "WebP", param: "source_url", on: "image element", example: { source_url: "https://cdn.example.com/thumb.webp" } },
      { label: "GIF", param: "source_url", on: "image element", example: { source_url: "https://cdn.example.com/sticker.gif" } },
      { label: "MP3", param: "source_url", on: "audio element", example: { source_url: "https://cdn.example.com/music.mp3" } },
      { label: "WAV", param: "source_url", on: "audio element", example: { source_url: "https://cdn.example.com/sfx.wav" } },
      { label: "AAC", param: "source_url", on: "audio element", example: { source_url: "https://cdn.example.com/voiceover.aac" } },
      { label: "OGG", param: "source_url", on: "audio element", example: { source_url: "https://cdn.example.com/track.ogg" } },
      {
        label: "LUT",
        param: "lut_url",
        on: "video | image element",
        example: { lut_url: "https://cdn.example.com/film.cube", lut_intensity: 80 },
      },
    ],
  },
  {
    key: "timeline",
    label: "Timeline editing",
    icon: "⊞",
    desc: "Build multi-scene timelines from clips, images, and audio. Precise frame-level control over every element.",
    pills: [
      {
        label: "Trim",
        param: "in_point / out_point",
        on: "video | audio element",
        example: { in_point: 5.0, out_point: 30.0 },
      },
      {
        label: "Cut",
        param: "time / duration",
        on: "any element",
        example: { time: 0, duration: 10.0 },
      },
      {
        label: "Crop",
        param: "crop_top / crop_bottom / crop_left / crop_right",
        on: "video | image element",
        example: { crop_top: 0.1, crop_bottom: 0.1, crop_left: 0.0, crop_right: 0.0 },
      },
      {
        label: "Resize",
        param: "width / height",
        on: "any visual element",
        example: { width: "50%", height: "50%" },
      },
      {
        label: "Rotate",
        param: "z_rotation",
        on: "any visual element",
        example: { z_rotation: "45°" },
      },
      {
        label: "Flip",
        param: "flip_horizontal / flip_vertical",
        on: "any visual element",
        example: { flip_horizontal: true },
      },
      {
        label: "Scale",
        param: "width / height",
        on: "any visual element",
        example: { width: "150%", height: "150%" },
      },
      {
        label: "Speed change",
        param: "speed",
        on: "video | audio element",
        example: { speed: 2.0 },
      },
      {
        label: "Frame-accurate cuts",
        param: "in_point / out_point",
        on: "video element",
        example: { in_point: 12.033, out_point: 45.5 },
      },
      {
        label: "Aspect ratio conversion",
        param: "width / height",
        on: "render request",
        example: { width: 1080, height: 1920 },
      },
      {
        label: "9:16",
        param: "width / height",
        on: "render request",
        example: { width: 1080, height: 1920 },
      },
      {
        label: "16:9",
        param: "width / height",
        on: "render request",
        example: { width: 1920, height: 1080 },
      },
      {
        label: "1:1",
        param: "width / height",
        on: "render request",
        example: { width: 1080, height: 1080 },
      },
      {
        label: "4:5",
        param: "width / height",
        on: "render request",
        example: { width: 1080, height: 1350 },
      },
    ],
  },
  {
    key: "captions",
    label: "Captions & text",
    icon: "Aa",
    desc: "Add styled text, captions, per-text timing, motion and custom fonts to any layer.",
    pills: [
      {
        label: "Subtitles / Captions",
        param: "word_animation",
        on: "text element",
        example: {
          type: "text",
          text: "Hello world",
          word_animation: {
            style: "karaoke",
            words: [
              { text: "Hello", start: 0.0, end: 0.5 },
              { text: "world", start: 0.5, end: 1.0 },
            ],
          },
        },
      },
      {
        label: "Word-level timing",
        param: "word_animation.words",
        on: "text element",
        example: {
          word_animation: {
            style: "box_highlight",
            words: [{ text: "Hello", start: 0.0, end: 0.4 }],
          },
        },
      },
      {
        label: "Font size",
        param: "font_size",
        on: "text element",
        example: { font_size: 48 },
      },
      {
        label: "Font weight",
        param: "font_weight",
        on: "text element",
        example: { font_weight: 700 },
      },
      {
        label: "Letter spacing",
        param: "tracking",
        on: "text element",
        example: { tracking: 2 },
      },
      {
        label: "Line height",
        param: "leading",
        on: "text element",
        example: { leading: 1.5 },
      },
      {
        label: "Text shadow",
        param: "shadow_color / shadow_blur / shadow_x / shadow_y",
        on: "text element",
        example: { shadow_color: "#00000088", shadow_blur: 8, shadow_x: 4, shadow_y: 4 },
      },
      {
        label: "Stroke",
        param: "stroke_color / stroke_width",
        on: "text element",
        example: { stroke_color: "#ffffff", stroke_width: 2 },
      },
      {
        label: "Text motion",
        param: "motion[].type + scope: element",
        on: "text element",
        example: { motion: [{ type: "fade", time: 0, duration: 0.5, scope: "element" }] },
      },
      {
        label: "Character motion",
        param: "motion[].type + scope: character",
        on: "text element",
        example: {
          motion: [{ type: "slide_up", time: 0, duration: 0.3, scope: "character" }],
        },
      },
      {
        label: "Auto-wrap",
        param: "text_wrap",
        on: "text element",
        example: { text_wrap: "wrap" },
      },
      {
        label: "Box highlight",
        param: "word_animation.style: box_highlight",
        on: "text element",
        example: {
          text_color: "#ffffff",
          background_color: "#8B2FC9",
          text_effect: "normal",
          word_animation: { style: "box_highlight", words: [{ text: "word", start: 0, end: 0.5 }] },
        },
      },
    ],
  },
  {
    key: "compositing",
    label: "Compositing",
    icon: "◫",
    desc: "Layer videos, images, overlays, watermarks, and backgrounds with full control over position, opacity, blending, and z-order.",
    pills: [
      {
        label: "Multi-layer",
        param: "track / z_index",
        on: "any element",
        example: { track: 2, z_index: 10 },
      },
      {
        label: "Z-ordering",
        param: "z_index",
        on: "any visual element",
        example: { z_index: 5 },
      },
      {
        label: "Opacity",
        param: "opacity",
        on: "any visual element",
        example: { opacity: 75 },
      },
      {
        label: "Position XY",
        param: "x / y",
        on: "any visual element",
        example: { x: "25%", y: "50%" },
      },
      {
        label: "Scale",
        param: "width / height",
        on: "any visual element",
        example: { width: "30%", height: "30%" },
      },
      {
        label: "Rotation",
        param: "z_rotation",
        on: "any visual element",
        example: { z_rotation: "15°" },
      },
      {
        label: "Rounded corners",
        param: "border_radius",
        on: "any visual element",
        example: { border_radius: 16 },
      },
      {
        label: "Border",
        param: "border_color / border_width",
        on: "any visual element",
        example: { border_color: "#ffffff", border_width: 3 },
      },
      {
        label: "Drop shadow",
        param: "shadow_color / shadow_blur / shadow_x / shadow_y",
        on: "any visual element",
        example: { shadow_color: "#00000099", shadow_blur: 12, shadow_x: 6, shadow_y: 6 },
      },
      {
        label: "Logo overlay",
        param: "type: image + x/y/width/height",
        on: "image element",
        example: {
          type: "image",
          source_url: "https://cdn.example.com/logo.png",
          x: "85%",
          y: "10%",
          width: "10%",
          height: "10%",
          z_index: 99,
        },
      },
      {
        label: "Sticker",
        param: "type: image + position",
        on: "image element",
        example: {
          type: "image",
          source_url: "https://cdn.example.com/sticker.png",
          x: "50%",
          y: "50%",
          width: "20%",
        },
      },
      {
        label: "Background image",
        param: "background_image_url",
        on: "render request",
        example: { background_image_url: "https://cdn.example.com/bg.jpg" },
      },
      {
        label: "Background video",
        param: "type: video + z_index: 0",
        on: "video element",
        example: {
          type: "video",
          source_url: "https://cdn.example.com/bg.mp4",
          width: "100%",
          height: "100%",
          z_index: 0,
        },
      },
      {
        label: "Chroma key",
        param: "effects[].type: chroma_key",
        on: "video element",
        example: {
          effects: [
            {
              type: "chroma_key",
              intensity: 100,
              chroma_props: {
                hue_min: 90,
                hue_max: 150,
                sat_min: 0.3,
                sat_max: 1.0,
                lum_min: 0.2,
                lum_max: 0.9,
              },
            },
          ],
        },
      },
    ],
  },
  {
    key: "effects",
    label: "Effects & color",
    icon: "◐",
    desc: "Apply GPU-accelerated effects, color grades, and artistic filters from tools like Premiere Pro / Final Cut Pro.",
    pills: [
      {
        label: "LUT color grading",
        param: "lut_url / lut_intensity",
        on: "video | image element",
        example: { lut_url: "https://cdn.example.com/kodak.cube", lut_intensity: 80 },
      },
      {
        label: "Brightness",
        param: "brightness",
        on: "video | image element",
        example: { brightness: 0.3 },
      },
      {
        label: "Contrast",
        param: "contrast",
        on: "video | image element",
        example: { contrast: 0.2 },
      },
      {
        label: "Saturation",
        param: "saturation",
        on: "video | image element",
        example: { saturation: 0.5 },
      },
      {
        label: "Hue",
        param: "hue_rotate",
        on: "video | image element",
        example: { hue_rotate: 45 },
      },
      {
        label: "Vignette",
        param: "vignette",
        on: "video | image element",
        example: { vignette: 0.6 },
      },
      {
        label: "Film grain",
        param: "effects[].type: film_grain",
        on: "video | image element",
        example: { effects: [{ type: "film_grain", intensity: 50 }] },
      },
      {
        label: "Invert",
        param: "effects[].type: invert",
        on: "video | image element",
        example: { effects: [{ type: "invert", intensity: 100 }] },
      },
      {
        label: "Posterize",
        param: "effects[].type: posterize",
        on: "video | image element",
        example: { effects: [{ type: "posterize", intensity: 50 }] },
      },
      {
        label: "Sharpen",
        param: "sharpness",
        on: "video | image element",
        example: { sharpness: 0.7 },
      },
      {
        label: "Blur",
        param: "blur",
        on: "video | image element",
        example: { blur: 10 },
      },
      {
        label: "Bokeh blur",
        param: "effects[].type: bokeh_blur",
        on: "video | image element",
        example: { effects: [{ type: "bokeh_blur", intensity: 60 }] },
      },
      {
        label: "Lens flare",
        param: "effects[].type: lens_flare",
        on: "video | image element",
        example: { effects: [{ type: "lens_flare", intensity: 70 }] },
      },
      {
        label: "Fisheye",
        param: "effects[].type: fisheye",
        on: "video | image element",
        example: { effects: [{ type: "fisheye", intensity: 60 }] },
      },
      {
        label: "Chromatic aberration",
        param: "effects[].type: chromatic_aberration",
        on: "video | image element",
        example: { effects: [{ type: "chromatic_aberration", intensity: 40 }] },
      },
      {
        label: "Halftone",
        param: "effects[].type: halftone",
        on: "video | image element",
        example: { effects: [{ type: "halftone", intensity: 50 }] },
      },
      {
        label: "Pixelate",
        param: "effects[].type: pixelate",
        on: "video | image element",
        example: { effects: [{ type: "pixelate", intensity: 50 }] },
      },
      {
        label: "Fade",
        param: "fade_in_duration / fade_out_duration",
        on: "video | audio element",
        example: { fade_in_duration: 0.5, fade_out_duration: 0.5 },
      },
      {
        label: "Dissolve",
        param: "transitions[].type: cross_dissolve",
        on: "render request",
        example: {
          transitions: [
            {
              type: "cross_dissolve",
              duration: 0.5,
              from_id: "clip_01",
              to_id: "clip_02",
            },
          ],
        },
      },
      {
        label: "Wipe",
        param: "transitions[].type: wipe_left",
        on: "render request",
        example: {
          transitions: [
            { type: "wipe_left", duration: 0.5, from_id: "clip_01", to_id: "clip_02" },
          ],
        },
      },
      {
        label: "Slide",
        param: "transitions[].type: sliding_door_horizontal",
        on: "render request",
        example: { transitions: [{ type: "sliding_door_horizontal", duration: 0.4 }] },
      },
      {
        label: "Zoom",
        param: "transitions[].type: zoom",
        on: "render request",
        example: { transitions: [{ type: "zoom", duration: 0.4 }] },
      },
      {
        label: "Spin",
        param: "transitions[].type: rotate",
        on: "render request",
        example: { transitions: [{ type: "rotate", duration: 0.5 }] },
      },
      {
        label: "Page flip",
        param: "transitions[].type: page_flip",
        on: "render request",
        example: { transitions: [{ type: "page_flip", duration: 0.6 }] },
      },
      {
        label: "Ripple",
        param: "transitions[].type: ripple",
        on: "render request",
        example: { transitions: [{ type: "ripple", duration: 0.5 }] },
      },
    ],
  },
  {
    key: "ai",
    label: "AI video effects",
    icon: "✦",
    desc: "GPU-accelerated AI effects that run inside the render pipeline — no separate processing step required.",
    pills: [
      {
        label: "Background removal",
        param: "remove_background",
        on: "video element",
        example: { remove_background: true },
      },
      {
        label: "Gaze redirect",
        param: "gaze_redirect",
        on: "video element",
        example: { gaze_redirect: true },
      },
      {
        label: "Super resolution",
        param: "super_resolution",
        on: "video element",
        example: { super_resolution: 2.0 },
      },
      {
        label: "2× upscale",
        param: "super_resolution: 2",
        on: "video element",
        example: { super_resolution: 2.0 },
      },
      {
        label: "4× upscale",
        param: "super_resolution: 4",
        on: "video element",
        example: { super_resolution: 4.0 },
      },
      {
        label: "Transparent video export",
        param: "alpha + output_format: webm",
        on: "render request",
        example: { alpha: true, output_format: "webm" },
      },
    ],
  },
  {
    key: "audio",
    label: "Audio",
    icon: "♪",
    desc: "Mix and replace audio.",
    pills: [
      {
        label: "Multi-track mixing",
        param: "track",
        on: "audio element",
        example: { type: "audio", source_url: "https://cdn.example.com/music.mp3", track: 2 },
      },
      {
        label: "Volume control",
        param: "volume",
        on: "video | audio element",
        example: { volume: 80 },
      },
      {
        label: "Fade in",
        param: "fade_in_duration",
        on: "video | audio element",
        example: { fade_in_duration: 1.0 },
      },
      {
        label: "Fade out",
        param: "fade_out_duration",
        on: "video | audio element",
        example: { fade_out_duration: 1.0 },
      },
      {
        label: "Trim audio",
        param: "in_point / out_point",
        on: "audio element",
        example: { in_point: 10.0, out_point: 60.0 },
      },
      {
        label: "Mute track",
        param: "volume: 0",
        on: "video | audio element",
        example: { volume: 0 },
      },
      {
        label: "Audio delay",
        param: "time",
        on: "audio element",
        example: { time: 2.5 },
      },
      {
        label: "Audio speed",
        param: "speed",
        on: "audio element",
        example: { speed: 1.5 },
      },
      {
        label: "Add music",
        param: "type: audio + source_url",
        on: "audio element",
        example: {
          type: "audio",
          source_url: "https://cdn.example.com/music.mp3",
          volume: 40,
        },
      },
      {
        label: "Add SFX",
        param: "type: audio + source_url",
        on: "audio element",
        example: {
          type: "audio",
          source_url: "https://cdn.example.com/sfx.wav",
          time: 3.0,
        },
      },
      {
        label: "Cross-fade",
        param: "fade_out_duration + fade_in_duration",
        on: "audio element",
        example: { fade_out_duration: 0.5, fade_in_duration: 0.5 },
      },
    ],
  },
  {
    key: "preview",
    label: "Render & preview",
    icon: "▶",
    desc: "Export production-ready video in multiple formats, resolutions, and delivery modes.  Preview via WASM",
    pills: [
      {
        label: "MP4 export",
        param: "output_format: mp4",
        on: "render request",
        example: { output_format: "mp4" },
      },
      {
        label: "WebM export",
        param: "output_format: webm",
        on: "render request",
        example: { output_format: "webm" },
      },
      {
        label: "Alpha video",
        param: "alpha + output_format: webm",
        on: "render request",
        example: { alpha: true, output_format: "webm" },
      },
      {
        label: "MOV export",
        param: "output_format: mov",
        on: "render request",
        example: { output_format: "mov" },
      },
      {
        label: "1080p",
        param: "width / height",
        on: "render request",
        example: { width: 1920, height: 1080 },
      },
      {
        label: "4K",
        param: "width / height",
        on: "render request",
        example: { width: 3840, height: 2160 },
      },
      {
        label: "Custom resolution",
        param: "width / height",
        on: "render request",
        example: { width: 1280, height: 720 },
      },
      {
        label: "frame_rate",
        param: "frame_rate",
        on: "render request",
        example: { frame_rate: 30 },
      },
    ],
  },
  {
    key: "delivery",
    label: "Delivery & webhooks",
    icon: "↑",
    desc: "Submit jobs, track progress, receive completion events, and retrieve final output URLs through a simple event model.",
    pills: [
      {
        label: "REST API",
        param: "POST /v1/renders",
        note: "All operations via standard HTTP + JSON",
      },
      {
        label: "MCP",
        param: "MCP server",
        note: "Cursor/Claude tool integration",
      },
      {
        label: "NPM",
        param: "@framelane/sdk",
        note: "Official TypeScript/Node.js SDK",
      },
      {
        label: "Webhook",
        param: "webhook_url",
        on: "render request / POST /v1/webhooks",
        example: { webhook_url: "https://app.example.com/hooks/framelane" },
      },
      {
        label: "Priority queues",
        param: "infrastructure",
        note: "Managed queue — no client-side param",
      },
      {
        label: "CDN delivery",
        param: "output.url (signed GCS URL)",
        note: "All outputs served via signed CDN URL",
      },
      {
        label: "Expiry control",
        param: "signed_url_view_seconds / signed_url_download_seconds",
        note: "Configurable at workspace level",
      },
    ],
  },
];

type CapKey = (typeof CAPS)[number]["key"];

const PILL_INTERVAL = 2200;

export function Capabilities() {
  const [active, setActive] = useState<CapKey>("ingest");
  const [activePill, setActivePill] = useState(0);
  const paused = useRef(false);
  const cap = CAPS.find((c) => c.key === active) ?? CAPS[0];
  const pill = cap.pills[activePill] ?? cap.pills[0];

  const selectCap = (key: CapKey) => {
    setActive(key);
    setActivePill(0);
  };

  useEffect(() => {
    paused.current = false;
    const id = setInterval(() => {
      if (!paused.current) {
        setActivePill((prev) => {
          const cap = CAPS.find((c) => c.key === active) ?? CAPS[0];
          return (prev + 1) % cap.pills.length;
        });
      }
    }, PILL_INTERVAL);
    return () => clearInterval(id);
  }, [active]);

  return (
    <section
      id="capabilities"
      style={{
        background:
          "linear-gradient(180deg, transparent, rgba(255,255,255,0.012), transparent)",
      }}
    >
      <div className="section-tag">
        <span className="num-marker">02 / PIPELINE</span>
      </div>
      <div className="wrap">
        <div style={{ maxWidth: 880, marginBottom: 56 }}>
          <h2>
            Everything an agent needs
            <br />
            <span className="serif-i" style={{ color: "var(--fg-2)" }}>
              to produce video.
            </span>
          </h2>
          <p className="lede" style={{ marginTop: 24 }}>
            A complete editing and rendering pipeline exposed through API, SDKs,
            and MCP.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: 0,
            border: "1px solid var(--line)",
            borderRadius: 8,
            overflow: "hidden",
            background: "var(--bg-2)",
          }}
        >
          {/* Sidebar */}
          <div
            style={{
              borderRight: "1px solid var(--line)",
              padding: "14px 0",
              background: "rgba(0,0,0,0.15)",
            }}
          >
            {CAPS.map((c, i) => (
              <button
                key={c.key}
                onClick={() => selectCap(c.key)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 22px",
                  textAlign: "left",
                  color: active === c.key ? "var(--fg)" : "var(--fg-2)",
                  background:
                    active === c.key ? "rgba(255,122,26,0.06)" : "transparent",
                  borderLeft: `2px solid ${active === c.key ? "var(--orange)" : "transparent"}`,
                  transition: "all 0.15s",
                  fontSize: 14,
                }}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    width: 22,
                    color:
                      active === c.key ? "var(--orange)" : "var(--fg-dim)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: 14, letterSpacing: "-0.005em" }}>
                  {c.label}
                </span>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div
            key={cap.key}
            className="fade-in"
            style={{ padding: "40px 44px", minHeight: 380 }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: "rgba(255,122,26,0.1)",
                border: "1px solid rgba(255,122,26,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                color: "var(--orange)",
                marginBottom: 22,
              }}
            >
              {cap.icon}
            </div>

            <h3
              style={{
                fontSize: 28,
                letterSpacing: "-0.02em",
                marginBottom: 14,
              }}
            >
              {cap.label}
            </h3>
            <p
              style={{
                color: "var(--fg-2)",
                fontSize: 16,
                lineHeight: 1.6,
                maxWidth: "58ch",
                marginBottom: 24,
              }}
            >
              {cap.desc}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px 6px",
                marginBottom: 24,
              }}
              onMouseEnter={() => { paused.current = true; }}
              onMouseLeave={() => { paused.current = false; }}
            >
              {cap.pills.map((p, idx) => {
                const isActive = idx === activePill;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onMouseEnter={() => setActivePill(idx)}
                    onFocus={() => setActivePill(idx)}
                    onClick={() => setActivePill(idx)}
                    style={{
                      fontSize: 12,
                      padding: "3px 10px",
                      borderRadius: 3,
                      background: isActive
                        ? "rgba(255,122,26,0.12)"
                        : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isActive ? "rgba(255,122,26,0.4)" : "var(--line)"}`,
                      color: isActive ? "var(--orange)" : "var(--fg-2)",
                      letterSpacing: "0.01em",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      transition: "background 0.12s, border-color 0.12s, color 0.12s",
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", alignItems: "center", minHeight: 180, width: 120 }}>              
            <div
              className="mono"
              style={{
                padding: 16,
                background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--line)",
                borderRadius: 4,
                fontSize: 12,
                lineHeight: 1.7,
                alignItems: "center",                
                color: "var(--fg-2)",
                minWidth: 480,
              }}
            >
              {pill.example && (
                <pre
                  style={{
                    margin: 0,
                    padding: 0,
                    background: "transparent",
                    border: "none",
                    color: "var(--green)",
                    fontSize: 12,
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    fontFamily: "inherit",
                  }}
                >
                  {JSON.stringify(pill.example, null, 2)}
                </pre>
              )}

              {!pill.example && pill.note && (
                <div
                  style={{
                    color: "var(--fg-2)",
                    fontSize: 12,
                    lineHeight: 1.6,
                    whiteSpace: "normal",
                  }}
                >
                  {pill.note}
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
