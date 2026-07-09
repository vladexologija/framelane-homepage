import type { Competitor, Objection } from "@/lib/comparison-data";

export interface BenefitBlock {
  /** num-marker label, e.g. "01 / GPU NATIVE". */
  eyebrow?: string;
  heading: string;
  /** serif-i orange accent span appended to the heading. */
  accent?: string;
  body: string;
  bullets?: string[];
}

export interface IssueSection {
  heading: string;
  accent: string;
  intro?: string;
  /** Sourced limitations + FrameLane counters. */
  items: Objection[];
}

export interface LandingPageContent {
  /** Canonical path WITHOUT leading slash, e.g. "compare/remotion". */
  slug: string;
  /** Competitor this page compares against (drives the 2-column table). */
  competitor: Competitor;

  // ── SEO ──
  metaTitle: string; // title template appends " | FrameLane"
  metaDescription: string;
  keywords: string[];
  ogTitle?: string;

  // ── Hero ──
  eyebrow: string;
  h1: string;
  h1Accent?: string;
  lede: string;

  // ── Body ──
  benefits: BenefitBlock[];
  /** Competitor-specific, sourced limitations. */
  issues?: IssueSection;
  comparisonIntro: string;
  /** When set, the side-by-side table shows only these capabilities, in this order. Defaults to all rows. */
  tableCapabilities?: string[];

  // ── Breadcrumb (drives BreadcrumbList JSON-LD) ──
  breadcrumb: { name: string; path: string }[];

  // ── CTA ──
  ctaHeading: string;
  ctaAccent?: string;
  ctaBody: string;
}

function breadcrumb(name: string, slug: string) {
  return [
    { name: "Home", path: "/" },
    { name, path: `/${slug}` },
  ];
}

// Source URLs are the competitors' own current public docs (verified 2026).
const REMOTION = {
  cssAnimations: { label: "remotion.dev, CSS animations", url: "https://www.remotion.dev/docs/troubleshooting/css-animations" },
  gpu: { label: "remotion.dev, GPU", url: "https://www.remotion.dev/docs/gpu" },
  renderFrames: { label: "remotion.dev, renderFrames", url: "https://www.remotion.dev/docs/renderer/render-frames" },
  lambdaFaq: { label: "remotion.dev, Lambda FAQ", url: "https://www.remotion.dev/docs/lambda/faq" },
};
const SHOTSTACK = {
  studioSdk: { label: "shotstack-studio-sdk", url: "https://github.com/shotstack/shotstack-studio-sdk" },
  sdk: { label: "shotstack-sdk-node, Clip.js", url: "https://github.com/shotstack/shotstack-sdk-node/blob/main/src/model/Clip.js" },
  benchmark: { label: "shotstack.io, rendering benchmark", url: "https://shotstack.io/learn/rendering-speeds-benchmark/" },
};

export const COMPARE_PAGES: LandingPageContent[] = [
  {
    slug: "compare/remotion",
    competitor: "Remotion",
    metaTitle: "Remotion alternative for AI agents",
    ogTitle: "FrameLane vs Remotion",
    metaDescription:
      "A Remotion alternative built for agents that iterate. No React to bundle, no headless browser, and no AWS account to run. FrameLane exposes the edit as a JSON timeline your agent reads and patches, previews on the exact engine that renders the file, and renders on a managed GPU fleet in seconds. Remotion renders, the rest is on you. FrameLane is managed and GPU-native, so iteration is refinement, not regeneration.",
    keywords: [
      "Remotion alternative",
      "FrameLane vs Remotion",
      "Remotion API alternative",
      "managed Remotion rendering alternative",
      "programmatic video without React",
      "GPU video rendering API",
      "video API for AI agents",
      "stateful video project API",
    ],
    eyebrow: "FrameLane vs Remotion",
    h1: "The Remotion alternative",
    h1Accent: "built for agents, not React.",
    lede: "A Remotion edit is a React composition, so changing one caption means an agent rewrites the component, re-bundles, and redeploys, and Remotion hosts nothing, so the AWS account and compute bill are yours. FrameLane is fully managed and built for the loop: your agent patches a JSON timeline, previews on the exact engine that renders the file, and gets 4K back from a GPU fleet in seconds. No React, no headless browser, no cloud account.",
    benefits: [
      {
        eyebrow: "01 / TIMELINE AS STATE",
        heading: "Your agent edits state,",
        accent: "not a React build.",
        body: "A Remotion edit is a React composition you author in JSX and bundle, and with no JSON edit API, moving one caption means a full rewrite, re-bundle, and redeploy. FrameLane exposes the edit as a JSON timeline your agent reads and patches, the way an agentic IDE operates on a file: tracks, clips, timing and captions are addressable state, so each pass changes the one field that matters instead of regenerating the whole video.",
        bullets: [
          "Read the timeline as JSON state",
          "Patch one field: no JSX, no bundler",
          "Refine, not regenerate",
        ],
      },
      {
        eyebrow: "02 / PREVIEW FOR AGENTS",
        heading: "A preview your agent",
        accent: "can trust.",
        body: "FrameLane's preview is the exact Rust/wgpu compositor that renders the final file, compiled to WebAssembly, so an agent sees the real frame and closes the loop before it commits a full render. Remotion gives no such guarantee: CSS transitions can land on the wrong frame, and the WebCodecs preview emulates a canvas rather than the real DOM, so the only safe check is to re-render.",
        bullets: [
          "Preview is the render engine, in WASM",
          "The agent sees the true frame",
          "Validate for free, render only when valid",
        ],
      },
      {
        eyebrow: "03 / MANAGED, NOT DIY",
        heading: "Managed rendering,",
        accent: "not your own AWS.",
        body: "Remotion has no hosted rendering service. To render at scale you deploy Remotion Lambda into your own AWS account: the IAM setup, the S3 bucket, a 1,000-per-region concurrency ceiling you file with AWS to raise, and the full compute, storage and egress bill. FrameLane is one API call to a managed GPU fleet: no cloud account, no bucket to own, no concurrency tickets.",
        bullets: [
          "No AWS account, no S3 bucket to own",
          "No concurrency limits to file for",
          "One managed API, billed per rendered minute",
        ],
      },
      {
        eyebrow: "04 / FILM-GRADE EFFECTS",
        heading: "Film-grade effects,",
        accent: "not CSS filters.",
        body: "Remotion composes in the browser with HTML and CSS, so its effects are CSS filters. Film-grade looks, .cube LUT grades, film grain, lens flare, bokeh, chromatic aberration, are not CSS primitives, and hand-built WebGL versions fall back to software rendering on GPU-less Lambda. FrameLane ships 40+ as native GPU fragment shaders in Rust on wgpu, with glyph-level text animation and timeline transitions included.",
        bullets: [
          ".cube LUTs, film grain, lens flare, bokeh",
          "Glyph-level text animation and transitions",
          "40+ GPU shader effects, not CSS filters",
        ],
      },
      {
        eyebrow: "05 / GPU NATIVE",
        heading: "GPU on every job,",
        accent: "no headless browser.",
        body: "Remotion's default path screenshots a headless Chromium frame by frame, then stitches with FFmpeg, and on Lambda that runs CPU-bound: the docs confirm no GPU, so headless Chromium falls back to swangle, a SwiftShader software rasterizer. A GPU path exists only on self-managed EC2. FrameLane is Rust on wgpu: hardware NVDEC decode, a GPU shader pass per frame, hardware encode, about 4 seconds for a 10-second 4K clip with captions, animations and audio.",
        bullets: [
          "Rust / wgpu, no Chromium in the render loop",
          "Hardware NVDEC decode and encode",
          "About 4s for a 10-second 4K clip",
        ],
      },
    ],
    issues: {
      heading: "Where browser rendering",
      accent: "and DIY infra hit a wall.",
      intro:
        "Remotion is a strong open-source framework: excellent if you want full React control over every frame and are happy to run the infrastructure yourself. The limitations below are the cost of that model, not bugs, and each is documented in Remotion's own guides.",
      items: [
        {
          tag: "Performance",
          title: "Frames are browser screenshots",
          quote:
            "Remotion renders a series of images by screenshotting a headless browser frame by frame, then stitches them with FFmpeg. Cost scales with pixels times frames and is CPU-bound on Lambda, which is why 4K renders get slower and more expensive.",
          counter: "About 4s to render a 10-second 4K clip with captions, animations and audio on a managed GPU fleet.",
          source: REMOTION.renderFrames,
        },
        {
          tag: "GPU",
          title: "No GPU on Lambda",
          quote:
            "Per Remotion's docs, AWS Lambda has no GPU, and in headless mode Chromium disables the GPU for a documented significant slowdown. The Lambda default is “swangle”, a SwiftShader software rasterizer, and a GPU path exists only on self-managed EC2, never on Lambda or Cloud Run.",
          counter: "FrameLane renders on the GPU on every job, hardware decode, shaders, hardware encode.",
          source: REMOTION.gpu,
        },
        {
          tag: "Animations",
          title: "CSS animations don't render correctly",
          quote:
            "Remotion's docs have a page titled “Don't use CSS animations in Remotion.” Because each frame is rendered independently and possibly out of order, CSS transitions and keyframes land on the wrong frame, producing flickering and blank frames during a render.",
          counter:
            "FrameLane animates on a real timeline: glyph-level text animation and 40+ GPU effects, rendered deterministically.",
          source: REMOTION.cssAnimations,
        },
        {
          tag: "Infrastructure",
          title: "You host it in your own AWS",
          quote:
            "Remotion's own FAQ states that you host Remotion Lambda in your own AWS account, and that Remotion does not offer a hosted rendering solution. The IAM setup, the S3 bucket, the per-region concurrency limit and the compute bill are all yours.",
          counter: "FrameLane is a managed GPU API: one call, no cloud account, no bucket, no concurrency tickets.",
          source: REMOTION.lambdaFaq,
        },
      ],
    },
    comparisonIntro:
      "Capability by capability, FrameLane vs Remotion. Competitor cells reflect Remotion's own current documentation.",
    tableCapabilities: [
      "Managed (no cloud account)",
      "No browser required",
      "GPU shader effects",
      "4K + HDR output",
      "Preview = render output",
      "Stateful projects (edit, don't re-render)",
      "Timeline editing",
      "MCP / agent native",
      "Built with",
    ],
    breadcrumb: breadcrumb("Remotion", "compare/remotion"),
    ctaHeading: "Give your agent a",
    ctaAccent: "managed GPU engine.",
    ctaBody:
      "No React to bundle, no headless browser, no AWS to run. Send JSON, patch the timeline, get production-ready 4K back from the GPU in seconds.",
  },
  {
    slug: "compare/shotstack",
    competitor: "Shotstack",
    metaTitle: "Shotstack alternative for AI agents",
    ogTitle: "FrameLane vs Shotstack",
    metaDescription:
      "A Shotstack alternative built for agents that iterate. FrameLane exposes the edit as a JSON timeline your agent reads and patches, previews on the exact engine that renders the file, and renders on the GPU in seconds, so iteration is refinement, not regeneration. Same JSON and MCP workflow as Shotstack, on a real GPU engine.",
    keywords: [
      "Shotstack alternative",
      "FrameLane vs Shotstack",
      "video API for AI agents",
      "agent video editing",
      "GPU video rendering",
      "stateful video editing API",
    ],
    eyebrow: "FrameLane vs Shotstack",
    h1: "The Shotstack alternative",
    h1Accent: "built for the iteration loop.",
    lede: "Shotstack is a capable managed API, JSON timeline and an MCP server, but the loop is the same: submit an edit, wait on a CPU render, and preview on a separate engine that does not match the output. FrameLane shares that JSON and MCP workflow but runs it on a real GPU engine: your agent patches the timeline as state, previews on the exact engine that renders the file, and gets it back in seconds. Iteration becomes refinement, not regeneration.",
    benefits: [
      {
        eyebrow: "01 / TIMELINE AS STATE",
        heading: "Your agent edits state,",
        accent: "not prompts.",
        body: "The edit is a JSON timeline your agent reads and patches, the way an agentic IDE operates on a file. Shift a voiceover, swap a clip, retime a caption: the agent changes the one field that matters instead of regenerating the whole video. Every pass is a refinement, not a regeneration.",
        bullets: [
          "Read the timeline as JSON state",
          "Patch one field: VO, clip, timing",
          "Refine, not regenerate",
        ],
      },
      {
        eyebrow: "02 / PREVIEW FOR AGENTS",
        heading: "A preview your agent",
        accent: "can trust.",
        body: "FrameLane's preview is the exact Rust/wgpu compositor that renders the file, compiled to WebAssembly, so an agent sees the real frame and closes the loop before a full render. Shotstack previews on a separate Pixi.js engine, and its own team has said text, fonts and filters may not match the output, so the only real check is to re-render.",
        bullets: [
          "Preview is the render engine, in WASM",
          "The agent sees the true frame",
          "Validate for free, render only when valid",
        ],
      },
      {
        eyebrow: "03 / QUALITY",
        heading: "Effects that run as shaders,",
        accent: "not fixed presets.",
        body: "Shotstack's effects are a closed catalog of named presets: some motion effects, filters, chromakey and luma mattes, with no intensity control, no LUT import, and no custom shaders. FrameLane runs 40+ effects as GPU fragment shaders, with .cube LUT grading, numeric color controls and multi-layer compositing, the things a preset list cannot express.",
        bullets: [
          ".cube LUTs and color grading",
          "Multi-layer compositing",
          "GPU shaders, not on/off presets",
        ],
      },
      {
        eyebrow: "04 / SPEED",
        heading: "Renders back in seconds,",
        accent: "not a CPU queue.",
        body: "By its own benchmark, Shotstack renders CPU-side (multi-threaded, not GPU), putting a minute of video at tens of seconds. FrameLane is Rust on wgpu: hardware NVDEC decode, one GPU pass per frame, hardware encode, so the re-render at the end of each iteration comes back in seconds instead of queuing, which is the whole point when an agent is looping.",
        bullets: [
          "Rust / wgpu, GPU on every job",
          "Hardware decode + encode",
          "Fast re-renders for tight loops",
        ],
      },
    ],
    issues: {
      heading: "Where the managed editor",
      accent: "stops.",
      intro:
        "Shotstack is genuinely good at the managed layer: JSON editing, templates, ingest and CDN, transcription, even an MCP server, and FrameLane matches that workflow. The gaps it closes are in the rendering engine and the iteration loop underneath, each linked to Shotstack's own docs.",
      items: [
        {
          tag: "Effects",
          title: "A closed preset catalog",
          quote:
            "Shotstack's effects are named presets: a small set of motion effects, filters and transitions. The filters have no numeric intensity, there is no LUT import, and the API has no way to supply an arbitrary GPU fragment shader (GLSL).",
          counter:
            "FrameLane runs 40+ effects as GPU shaders, with .cube LUTs, numeric color controls and compositing.",
          source: SHOTSTACK.sdk,
        },
        {
          tag: "Engine",
          title: "CPU-bound rendering",
          quote:
            "Shotstack states it renders with multi-threaded, CPU optimised processing, not GPU. Its own benchmark puts a minute of video at roughly 20 to 50 seconds of render time, depending on plan.",
          counter:
            "FrameLane renders every job on the GPU, so the re-render at each iteration comes back in seconds.",
          source: SHOTSTACK.benchmark,
        },
        {
          tag: "Preview",
          title: "The preview is a different engine",
          quote:
            "Shotstack's Studio preview is built on Pixi.js (WebGPU/WebGL), a separate engine from its cloud render, and Shotstack does not claim the two are identical.",
          counter:
            "FrameLane's WASM preview is the same compositor as the render, so the agent sees the true frame and can close the loop.",
          source: SHOTSTACK.studioSdk,
        },
      ],
    },
    comparisonIntro:
      "Capability by capability, FrameLane vs Shotstack. Competitor cells reflect Shotstack's own current documentation.",
    tableCapabilities: [
      "Timeline editing",
      "GPU shader effects",
      "Preview = render output",
      "Stateful projects (edit, don't re-render)",
      "MCP / agent native",
      "Built with",
    ],
    breadcrumb: breadcrumb("Shotstack", "compare/shotstack"),
    ctaHeading: "Give your agent a",
    ctaAccent: "real editing loop.",
    ctaBody: "A timeline it reads and patches, a preview that is the render, and GPU renders in seconds. Iteration as refinement, not regeneration.",
  },
];

export function getComparePage(slug: string): LandingPageContent | undefined {
  return COMPARE_PAGES.find((p) => p.slug === slug);
}
