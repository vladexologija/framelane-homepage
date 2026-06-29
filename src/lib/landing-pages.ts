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
    ],
    eyebrow: "FrameLane vs Remotion",
    h1: "The Remotion alternative",
    h1Accent: "built for agents, not React.",
    lede: "Agent video today is open-loop: generate, render, watch, prompt again, repeat. A Remotion edit is a React composition, so to change one caption an agent has to rewrite the component, re-bundle it, and re-deploy, every pass a regeneration instead of a refinement. And Remotion renders nothing for you: there is no hosted service, so you stand up the AWS account, the S3 bucket and the concurrency limits yourself, then pay the compute bill. FrameLane is built for the loop and fully managed. Your agent reads and patches the timeline as state, previews on the exact engine that renders the file, and gets finished video back from a managed GPU fleet in seconds. No React, no headless browser, no cloud account to run.",
    benefits: [
      {
        eyebrow: "01 / TIMELINE AS STATE",
        heading: "Your agent edits state,",
        accent: "not a React build.",
        body: "A Remotion edit is a React composition: a component plus width, height, fps and duration that you author in JSX and bundle with a build step. There is no pure-JSON edit API, so to move one caption an agent has to rewrite the component, re-bundle it with Webpack or esbuild, and re-deploy the serve URL. Every change is a full rebuild. FrameLane exposes the edit as a JSON timeline your agent reads and patches, the way an agentic IDE operates on a file. Tracks, clips, timing and captions are all addressable state, so each pass changes the one field that matters instead of regenerating the whole video.",
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
        body: "FrameLane's preview is the exact Rust/wgpu compositor that renders the final file, compiled to WebAssembly, so an agent can preview a change, see the real frame, and close the loop before it commits a full render. A Remotion preview is not that guarantee. Anything not driven by useCurrentFrame(), a CSS transition or animation, can flicker or land on the wrong frame at render time, and the newer client-side WebCodecs path previews on a canvas emulation rather than the real DOM, with properties like backdrop-filter, mix-blend-mode and mask-image unsupported. On Remotion the only safe check is to re-render.",
        bullets: [
          "Preview is the render engine, in WASM",
          "The agent sees the true frame",
          "Close the loop before a full render",
        ],
      },
      {
        eyebrow: "03 / MANAGED, NOT DIY",
        heading: "Managed rendering,",
        accent: "not your own AWS.",
        body: "Remotion does not offer a hosted rendering service. To render server-side at scale you deploy Remotion Lambda into your own AWS account: you create the IAM policies, users and access keys, deploy the render function, and stand up the S3 bucket the output lands in. Concurrency is your problem, the default ceiling is 1,000 per region and you file with AWS for increases yourself, and the compute, storage and egress bill is yours. The plain Node path is heavier still, with queueing, traffic spikes, progress reporting, logging and server provisioning all on you. FrameLane is one API call to a managed GPU fleet. No cloud account, no bucket to own, no concurrency tickets, nothing to babysit.",
        bullets: [
          "No AWS account, no S3 bucket to own",
          "No concurrency limits to file for",
          "One managed API, billed per rendered minute",
        ],
      },
      {
        eyebrow: "04 / GPU NATIVE",
        heading: "GPU on every job,",
        accent: "no headless browser.",
        body: "Remotion's default render path screenshots a headless Chromium browser frame by frame, then stitches the images with FFmpeg, and on Lambda that runs CPU-bound: the docs confirm Lambda has no GPU and that headless Chromium disables the GPU, a documented significant slowdown that falls back to swangle, a SwiftShader software rasterizer. A GPU path exists, but only on self-managed Linux EC2 with Chrome for Testing and Vulkan, never on Lambda or Cloud Run, and you operate it yourself. FrameLane is Rust on wgpu: hardware NVDEC decode, a GPU shader pass per frame, hardware encode, on a managed fleet, about 4 seconds for a 10-second 4K clip with captions, animations and audio.",
        bullets: [
          "Rust / wgpu, no Chromium in the render loop",
          "40+ GPU effects and animations, not CSS-only",
          "4K + HDR tonemapping handled natively",
        ],
      },
    ],
    issues: {
      heading: "Where browser rendering",
      accent: "and DIY infra hit a wall.",
      intro:
        "Remotion is a genuinely strong open-source framework: if you want full React control over every frame and you are happy to run the infrastructure yourself, it is excellent at that. The limitations below are the cost of that model, not bugs, and each one is documented in Remotion's own guides.",
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
    lede: "Agent video today is open-loop: generate, render, watch, prompt again, repeat. The edit itself is a black box, so every change is a full regeneration instead of a refinement. Shotstack is a capable managed API, JSON timeline and an MCP server, but the loop is the same: submit an edit, wait on a CPU render, and preview on a separate engine that does not match the output. FrameLane is built for the loop. Your agent reads and patches the timeline as state, previews on the exact engine that renders the file, and gets it back from the GPU in seconds. Iteration becomes refinement, not regeneration.",
    benefits: [
      {
        eyebrow: "01 / TIMELINE AS STATE",
        heading: "Your agent edits state,",
        accent: "not prompts.",
        body: "The edit is a JSON timeline your agent reads and patches, the way an agentic IDE operates on a file. Shift a voiceover by a few frames, swap a clip, retime a caption: the agent changes the one field that matters instead of regenerating the whole video. Tracks, clips, timing and captions are all addressable state, so every pass is a refinement.",
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
        body: "FrameLane's preview is the exact Rust/wgpu compositor that renders the final file, compiled to WebAssembly. So an agent can preview a change and see the real frame, not a lookalike, and close the loop before it commits a full render. Shotstack's preview is a separate Pixi.js engine, and its own team has said text, fonts and filters may not match the output, so the only real check is to re-render.",
        bullets: [
          "Preview is the render engine, in WASM",
          "The agent sees the true frame",
          "Check before a full render",
        ],
      },
      {
        eyebrow: "03 / QUALITY",
        heading: "Effects that run as shaders,",
        accent: "not fixed presets.",
        body: "Shotstack's effects are a closed catalog of named presets: a few motion effects, a few filters, chromakey and luma mattes, with no intensity control, no LUT import, and no way to supply your own shader. FrameLane runs 40+ effects as GPU fragment shaders, with .cube LUT grading, numeric color controls and multi-layer compositing, the things a preset list cannot express.",
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
        body: "Shotstack renders with multi-threaded, CPU optimised processing, not GPU, by its own benchmark, which puts a minute of video at tens of seconds. FrameLane is Rust on wgpu: hardware NVDEC decode, one GPU pass per frame, hardware encode. Every job runs on the GPU, so the re-render at the end of each iteration comes back fast instead of queuing, which is the whole point when an agent is looping.",
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
