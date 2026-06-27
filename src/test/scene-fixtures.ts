import {
  createEmptyScene,
  defaultFilters,
  type Scene,
  type VideoElement,
  type AudioElement,
  type TextElement,
} from "@frametake/scene-schema";

/** Test builders for editor scene elements (shared by mapper + component tests). */

export const video = (over: Partial<VideoElement> = {}): VideoElement => ({
  id: "v1",
  kind: "video",
  startTime: 0,
  endTime: 5,
  zIndex: 0,
  animation: null,
  fadeIn: 0,
  fadeOut: 0,
  assetId: "a1",
  src: "https://cdn.test/v.mp4",
  transform: { position: { x: 0.5, y: 0.5 }, size: { w: 0.5, h: 0.25 }, rotation: 0 },
  filters: defaultFilters(),
  volume: 1,
  playbackRate: 1,
  trimStart: 0,
  trimEnd: 5,
  flipX: false,
  flipY: false,
  loop: false,
  ...over,
});

export const audio = (over: Partial<AudioElement> = {}): AudioElement => ({
  id: "au1",
  kind: "audio",
  startTime: 0,
  endTime: 10,
  zIndex: 0,
  animation: null,
  fadeIn: 0,
  fadeOut: 0,
  assetId: "a2",
  src: "https://cdn.test/a.mp3",
  volume: 0.8,
  playbackRate: 1,
  trimStart: 0,
  trimEnd: 10,
  ...over,
});

export const text = (over: Partial<TextElement> = {}): TextElement => ({
  id: "t1",
  kind: "text",
  startTime: 1,
  endTime: 4,
  zIndex: 0,
  animation: null,
  fadeIn: 0,
  fadeOut: 0,
  text: "Hello",
  transform: { position: { x: 0.25, y: 0.5 }, size: { w: 0.8, h: 0.2 }, rotation: 0 },
  filters: defaultFilters(),
  fontFamily: "Inter, sans-serif",
  fontSize: 0.1,
  lineHeight: 1.2,
  color: "#ffffff",
  align: "center",
  bold: true,
  italic: false,
  backgroundColor: null,
  outlineWidth: 0,
  outlineColor: "#000000",
  shadowBlur: 0,
  shadowColor: "#000000",
  ...over,
});

export const sceneWith = (
  els: (VideoElement | AudioElement | TextElement)[],
): Scene => ({
  ...createEmptyScene(),
  duration: 10,
  canvas: { width: 1920, height: 1080 },
  backgroundColor: "#101010",
  elements: Object.fromEntries(els.map((e) => [e.id, e])),
  elementOrder: els.map((e) => e.id),
});
