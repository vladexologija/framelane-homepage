// Capability comparison matrix shared by the homepage <Comparisons> section and
// the /compare/* pages. Extracted verbatim from the original comparisons.tsx so
// both surfaces render the exact same claims and can never drift apart.

/** A single table cell: a status keyword (or a freeform label like "Rust/WGPU")
 *  plus an optional short note shown underneath. */
export type CompCell = [status: string, note?: string];

/** Columns, in order. FrameLane is always first (highlighted). */
export const COMPARISON_COLS = ["FrameLane", "Remotion", "Shotstack", "FFmpeg"] as const;

export type Competitor = "Remotion" | "Shotstack" | "FFmpeg";

export interface ComparisonRow {
  /** Row label (the capability being compared). */
  capability: string;
  /** One cell per column, aligned to COMPARISON_COLS. */
  cells: CompCell[];
}

// Full matrix: FrameLane vs Remotion vs Shotstack vs FFmpeg.
// Competitor cells reflect each vendor's own current public docs (2025-2026);
// see src/lib/landing-pages.ts issue sections for the cited sources.
export const COMPARISON_ROWS: ComparisonRow[] = [
  { capability: "Timeline editing", cells: [["yes"], ["limited"], ["yes"], ["yes", "Manual"]] },
  { capability: "GPU shader effects", cells: [["yes", "40+"], ["limited", "No GPU on Lambda"], ["no", "Fixed catalog"], ["no"]] },
  { capability: "AI background removal", cells: [["yes", "In pipeline"], ["no"], ["no", "Chromakey only"], ["no", "Separate"]] },
  { capability: "Gaze correction", cells: [["yes"], ["no"], ["no"], ["no"]] },
  { capability: "Preview = render output", cells: [["yes", "WASM"], ["yes", "Sometimes wrong"], ["no", "Separate engine"], ["no"]] },
  { capability: "MCP / agent native", cells: [["yes"], ["no"], ["yes"], ["no"]] },
  { capability: "4K + HDR output", cells: [["yes"], ["no", "Browser bound"], ["no", "1080p SDR"], ["limited", "Manual"]] },
  { capability: "No browser required", cells: [["yes"], ["no", "Core architecture"], ["yes"], ["yes"]] },
  { capability: "Built with", cells: [["Rust/WGPU"], ["React"], ["Managed cloud"], ["C"]] },
];

/**
 * A two-column slice of the matrix (FrameLane + one competitor) for the
 * dedicated /compare/<competitor> pages.
 */
export function comparisonFor(competitor: Competitor): {
  cols: string[];
  rows: ComparisonRow[];
} {
  const idx = COMPARISON_COLS.indexOf(competitor);
  return {
    cols: ["FrameLane", competitor],
    rows: COMPARISON_ROWS.map((r) => ({
      capability: r.capability,
      cells: [r.cells[0], r.cells[idx]],
    })),
  };
}

export interface Objection {
  /** Short category badge, e.g. "GPU". */
  tag: string;
  title: string;
  /** The limitation, grounded in the competitor's own docs / behaviour. */
  quote: string;
  /** FrameLane's factual counter. */
  counter: string;
  /** Citation for the limitation (rendered as a small link on compare pages). */
  source?: { label: string; url: string };
}

// SOURCE: the GPU, Rendering and Performance quotes paraphrase Remotion's own
// public documentation (Lambda/GPU limits, CSS-animation guidance, 4K render
// performance). The AI Agents and Timeline entries describe the open-loop
// iteration problem agents hit with current stacks. Keep all of these grounded,
// do not "improve" them into claims the sources do not support.
export const REMOTION_OBJECTIONS: Objection[] = [
  {
    tag: "GPU",
    title: "No GPU on Lambda",
    quote:
      "Lambda and Vercel Sandbox do not have GPUs. You are limited to CPU-only rendering.",
    counter: "FrameLane renders on GPU. Every job.",
  },
  {
    tag: "Rendering",
    title: "CSS animations are forbidden",
    quote:
      "CSS transitions or animations are FORBIDDEN, they will not render correctly.",
    counter:
      "FrameLane is GPU-native. No browser. No frame simulation. No flickering.",
  },
  {
    tag: "AI Agents",
    title: "Agents have to write React",
    quote:
      "No React, no proprietary DSL. AI-first, agents already speak HTML/JSON.",
    counter:
      "FrameLane is JSON-in, video-out. Any agent, any language, one API call.",
  },
  {
    tag: "Timeline",
    title: "The edit layer is a black box",
    quote:
      "Agents can write scripts and captions, but they cannot read or modify the edit, so every pass is a regeneration, not a refinement.",
    counter:
      "FrameLane exposes the edit as a JSON timeline your agent reads and patches: tracks, clips, captions, timing.",
  },
  {
    tag: "Performance",
    title: "Grinds to a crawl with real video",
    quote:
      "After about 20-30% of rendering 4k video is complete, it grinds to a crawl and renders at about 5fps and continues to slow.",
    counter: "GPU decode, GPU encode, parallel rendering.",
  },
];
