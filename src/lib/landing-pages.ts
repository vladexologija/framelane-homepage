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

  // ── FAQ (drives visible accordion + FAQPage JSON-LD) ──
  faqs: { q: string; a: string }[];

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
  glOptions: { label: "remotion.dev, GL options", url: "https://www.remotion.dev/docs/gl-options" },
  renderFrames: { label: "remotion.dev, renderFrames", url: "https://www.remotion.dev/docs/renderer/render-frames" },
  fundamentals: { label: "remotion.dev, fundamentals", url: "https://www.remotion.dev/docs/the-fundamentals" },
};
const SHOTSTACK = {
  studioSdk: { label: "shotstack-studio-sdk", url: "https://github.com/shotstack/shotstack-studio-sdk" },
  api: { label: "shotstack.io, API", url: "https://shotstack.io/docs/api/" },
  mattes: { label: "shotstack.io, luma mattes", url: "https://shotstack.io/docs/guide/architecting-an-application/masks-luma-mattes/" },
  chromakey: { label: "shotstack.io, chromakey", url: "https://shotstack.io/docs/guide/architecting-an-application/chromakey" },
};

export const COMPARE_PAGES: LandingPageContent[] = [
  {
    slug: "compare/remotion",
    competitor: "Remotion",
    metaTitle: "Remotion alternative for AI agents",
    ogTitle: "FrameLane vs Remotion",
    metaDescription:
      "Looking for a Remotion alternative? FrameLane is a GPU-native video rendering API, no React to bundle, no headless browser, no Lambda. Your agent sends JSON; FrameLane renders production-ready video.",
    keywords: [
      "Remotion alternative",
      "FrameLane vs Remotion",
      "Remotion API alternative",
      "programmatic video without React",
      "GPU video rendering API",
      "video API for AI agents",
    ],
    eyebrow: "FrameLane vs Remotion",
    h1: "The Remotion alternative",
    h1Accent: "built for agents, not React.",
    lede: "Remotion renders video by screenshotting a headless Chromium browser frame by frame, then stitching the images with FFmpeg. FrameLane renders on the GPU from a JSON edit plan, so any agent, in any language, gets finished video from one API call.",
    benefits: [
      {
        eyebrow: "01 / NO REACT",
        heading: "Your agent speaks JSON,",
        accent: "not JSX.",
        body: "A Remotion video is a React composition, a component plus width, height, fps and duration, that you author and bundle with a build step. There's no pure-JSON edit API. FrameLane is JSON-in, video-out: describe the edit, send it, get a rendered file back.",
        bullets: [
          "No React components, no bundler, no proprietary DSL",
          "Any language, call it like any HTTP API",
          "MCP server included for agent-native use",
        ],
      },
      {
        eyebrow: "02 / GPU NATIVE",
        heading: "GPU on every job,",
        accent: "no Lambda fallback.",
        body: "Remotion's own docs state AWS Lambda has no GPU, and that headless Chromium disables the GPU, a documented “significant slowdown”, falling back to SwiftShader software rendering. FrameLane is built in Rust on wgpu: hardware decode, GPU shader effects, hardware encode, in parallel.",
        bullets: [
          "Rust / wgpu engine, no Chromium in the render loop",
          "43 GPU fragment-shader effects, not CSS-only",
          "4K + HDR tonemapping handled natively",
        ],
      },
      {
        eyebrow: "03 / PREDICTABLE",
        heading: "What you preview is",
        accent: "what you render.",
        body: "Because the same Rust/wgpu compositor powers both the render and the WASM browser preview, frames don't drift between preview and output. Pay per rendered minute, no headless-browser fleet to provision or babysit.",
      },
    ],
    issues: {
      heading: "Where browser rendering",
      accent: "hits a wall.",
      intro:
        "These aren't our opinions, they're documented in Remotion's own guides. Each is linked to the source.",
      items: [
        {
          tag: "Animations",
          title: "CSS animations don't render",
          quote:
            "Remotion's docs have a page titled “Don't use CSS animations in Remotion.” CSS transitions, @keyframes and setTimeout all break because each frame is rendered independently and possibly out of order, causing flickering and blank frames.",
          counter:
            "FrameLane animates on a real timeline: glyph-level text animation and 43 GPU shader effects, rendered deterministically.",
          source: REMOTION.cssAnimations,
        },
        {
          tag: "GPU",
          title: "No GPU on Lambda",
          quote:
            "Per Remotion's docs, AWS Lambda has no GPU, and in headless mode Chromium disables the GPU. The Lambda default is “swangle”, SwiftShader software rendering, with the docs warning rendering may be slow without a GPU.",
          counter: "FrameLane renders on the GPU on every job, hardware decode, shaders, hardware encode.",
          source: REMOTION.glOptions,
        },
        {
          tag: "Performance",
          title: "Frames are browser screenshots",
          quote:
            "Remotion renders a series of images by screenshotting a headless browser frame by frame, then stitches them with FFmpeg. Cost scales with pixels × frames and is CPU-bound on Lambda, which is why 4K gets expensive and slow.",
          counter: "~4s to render a 10-second 4K clip with captions, animations and audio on a GCP L4.",
          source: REMOTION.renderFrames,
        },
        {
          tag: "Encode",
          title: "Encoding isn't GPU-accelerated",
          quote:
            "Even when a GPU is present, Remotion's docs note that video encoding is not GPU-accelerated, and several video components aren't GPU-accelerated either.",
          counter: "FrameLane uses FFmpeg hardware NVDEC decode and hardware encode, GPU end to end.",
          source: REMOTION.gpu,
        },
      ],
    },
    comparisonIntro:
      "Capability by capability, FrameLane vs Remotion. Competitor cells reflect Remotion's own current documentation.",
    faqs: [
      {
        q: "Is FrameLane open source like Remotion?",
        a: "FrameLane is a hosted API and rendering service, not a self-hosted framework. You don't run or scale render infrastructure, you send a JSON edit plan to the API (or via the MCP server) and receive a finished video. Remotion is an open-source React library you bundle and render yourself.",
      },
      {
        q: "Do I have to write React to use FrameLane?",
        a: "No. A Remotion video is a React composition you author and bundle. FrameLane takes a JSON edit plan, trim, crop, caption, overlay, composite, color-grade and more, over HTTP or MCP. There are no components to build and no bundler step.",
      },
      {
        q: "Why do my Remotion CSS animations flicker, and does FrameLane fix that?",
        a: "Remotion renders each frame independently and possibly out of order across multiple browser tabs that don't share state, so any animation not derived from the current frame (CSS transitions, @keyframes, timers) can flicker, this is documented in Remotion's own troubleshooting guides. FrameLane animates deterministically on a timeline, so there's nothing to flicker.",
      },
      {
        q: "Can FrameLane render 4K without slowing down?",
        a: "Yes. FrameLane uses GPU decode, GPU shader effects and hardware encode in parallel, with 4K and HDR tonemapping. A reference 10-second 4K clip with captions, animations and audio renders in about 4 seconds on a GCP L4.",
      },
    ],
    breadcrumb: breadcrumb("Remotion", "compare/remotion"),
    ctaHeading: "Give your agent a",
    ctaAccent: "real rendering engine.",
    ctaBody:
      "Skip the headless-browser fleet. Send JSON, get production-ready 4K video.",
  },
  {
    slug: "compare/shotstack",
    competitor: "Shotstack",
    metaTitle: "Shotstack alternative for AI agents",
    ogTitle: "FrameLane vs Shotstack",
    metaDescription:
      "A Shotstack alternative with a GPU shader engine, 4K + HDR output, and a preview that's identical to the render. FrameLane covers the same JSON timeline and agent workflow, then goes further on rendering.",
    keywords: [
      "Shotstack alternative",
      "FrameLane vs Shotstack",
      "video editing API",
      "video rendering API",
      "GPU video rendering",
      "4K video API",
    ],
    eyebrow: "FrameLane vs Shotstack",
    h1: "The Shotstack alternative",
    h1Accent: "with a GPU behind it.",
    lede: "Shotstack is a capable managed video API, JSON timeline, templates, AI generation, even an MCP server. FrameLane covers the same JSON-in workflow, then goes further where it counts: a GPU shader engine, 4K + HDR output, and a preview that's byte-identical to the render.",
    benefits: [
      {
        eyebrow: "01 / GPU SHADERS",
        heading: "Effects that run as shaders,",
        accent: "not a fixed catalog.",
        body: "Shotstack's visual effects are a fixed set, transitions, filters, chromakey and luma mattes. FrameLane runs 43 GPU fragment-shader effects with parallel control over every pixel, plus AI background removal and gaze correction inside the render pipeline.",
        bullets: [
          "43 GPU fragment-shader effects, not a fixed list",
          "AI subject background removal, no green screen",
          "Gaze correction and text-behind-people",
        ],
      },
      {
        eyebrow: "02 / 4K + HDR",
        heading: "Real 4K and HDR,",
        accent: "not a 1080p ceiling.",
        body: "Shotstack's documented output is SDR, up to 1080p. FrameLane outputs up to 4K with HDR tonemapping, using GPU hardware decode and encode, so quality holds for premium and broadcast-style work.",
        bullets: ["4K output", "HDR tonemapping", "Hardware decode + encode"],
      },
      {
        eyebrow: "03 / PREVIEW = RENDER",
        heading: "A preview that is",
        accent: "the render.",
        body: "Shotstack's in-browser Studio preview runs on a separate Pixi.js engine, so it isn't guaranteed byte-identical to the cloud render. FrameLane's preview is the very same Rust/wgpu compositor compiled to WebAssembly, what you approve is the frame that ships.",
      },
    ],
    issues: {
      heading: "Where the managed editor",
      accent: "stops.",
      intro:
        "Shotstack is genuinely good at JSON editing, templates and AI generation. These are the rendering-engine gaps FrameLane is built to close, each linked to Shotstack's own docs.",
      items: [
        {
          tag: "Preview",
          title: "The preview isn't the render",
          quote:
            "Shotstack's Studio preview is built on Pixi.js (WebGL), a different engine than the cloud render, and the preview is not claimed to be byte-identical to the final output.",
          counter:
            "FrameLane's WASM preview is the same compositor as the render, so what you approve is what ships.",
          source: SHOTSTACK.studioSdk,
        },
        {
          tag: "Output",
          title: "1080p SDR ceiling",
          quote:
            "Shotstack's documented video output is SDR and tops out at 1080p, no HDR, 10-bit or wide-gamut (Rec.2020) output is documented.",
          counter: "FrameLane outputs up to 4K with HDR tonemapping.",
          source: SHOTSTACK.api,
        },
        {
          tag: "Effects",
          title: "A fixed effect catalog",
          quote:
            "Shotstack's effects are JSON-parameterized presets, transitions, filters, chromakey, luma mattes. The API doesn't let you supply arbitrary GPU fragment-shader (GLSL) programs.",
          counter: "FrameLane runs 43 GPU shaders with control over every pixel.",
          source: SHOTSTACK.mattes,
        },
        {
          tag: "AI",
          title: "Chromakey, not AI matting",
          quote:
            "Shotstack's only background-removal mechanism is colour-based chromakey, which needs a green/blue screen and a specified key colour, there's no AI subject segmentation or gaze correction.",
          counter:
            "FrameLane does AI subject background removal with no green screen, plus text-behind-people and gaze correction.",
          source: SHOTSTACK.chromakey,
        },
      ],
    },
    comparisonIntro:
      "Capability by capability, FrameLane vs Shotstack. Competitor cells reflect Shotstack's own current documentation.",
    faqs: [
      {
        q: "How is FrameLane different from Shotstack?",
        a: "Both are JSON-driven cloud video APIs, and both offer agent access through an MCP server. The difference is the rendering engine: FrameLane has GPU fragment-shader effects (Shotstack uses a fixed effect catalog), 4K + HDR output (Shotstack tops out at 1080p SDR), AI subject background removal (Shotstack offers colour chromakey), and a WASM preview identical to the render (Shotstack's Studio preview uses a separate Pixi.js engine).",
      },
      {
        q: "Does Shotstack have AI features, and does FrameLane?",
        a: "Yes, Shotstack offers text-to-speech, text-to-image, text-to-video and transcription. FrameLane focuses its AI inside the render pipeline: subject background removal, text-behind-people and gaze correction, all GPU-accelerated as part of a single render.",
      },
      {
        q: "What input and output formats are supported?",
        a: "Input: MP4, MOV, WebM, MKV, MXF, ProRes, DNxHR and most codecs FFmpeg understands. Output: H.264, H.265, AV1 and ProRes up to 4K, with HDR. Audio: AAC, Opus, FLAC, WAV.",
      },
      {
        q: "How does pricing work?",
        a: "Pay per rendered minute. The free tier includes render-minutes plus unlimited preview frames; paid plans add 4K output, no watermark, GPU rendering on every job, and higher limits.",
      },
    ],
    breadcrumb: breadcrumb("Shotstack", "compare/shotstack"),
    ctaHeading: "Render past the",
    ctaAccent: "1080p ceiling.",
    ctaBody: "GPU shaders, 4K + HDR, and a preview that's the render, from one JSON API.",
  },
  {
    slug: "compare/ffmpeg",
    competitor: "FFmpeg",
    metaTitle: "FFmpeg API alternative for video rendering",
    ogTitle: "FrameLane vs FFmpeg",
    metaDescription:
      "FFmpeg as a managed API. FrameLane gives you GPU rendering, a JSON edit timeline, AI steps, and an MCP server, so you don't hand-build, host, and scale an FFmpeg pipeline yourself.",
    keywords: [
      "FFmpeg API",
      "FFmpeg alternative",
      "FFmpeg as a service",
      "managed video rendering API",
      "video rendering API",
      "GPU video rendering",
    ],
    eyebrow: "FrameLane vs FFmpeg",
    h1: "FFmpeg power,",
    h1Accent: "without the pipeline.",
    lede: "FFmpeg is the C engine under most video tooling, and you wire up, host, and scale it yourself. FrameLane uses FFmpeg for hardware decode and encode, then adds a Rust/wgpu GPU compositor, a JSON edit timeline, and AI steps, so you ship instead of maintaining infrastructure.",
    benefits: [
      {
        eyebrow: "01 / MANAGED",
        heading: "A managed API,",
        accent: "not a binary to babysit.",
        body: "With FFmpeg you own the filtergraphs, the worker fleet, the queue, the retries and the GPU drivers. FrameLane is a hosted API: send a JSON edit plan, get a finished file via download or webhook, no infrastructure to run.",
        bullets: [
          "No worker fleet, queue or GPU drivers to manage",
          "Webhooks per stage: queued → rendering → encoded → delivered",
          "Per-rendered-minute pricing, not per-server",
        ],
      },
      {
        eyebrow: "02 / EDIT MODEL",
        heading: "A real edit timeline,",
        accent: "not filtergraph strings.",
        body: "FrameLane expresses edits as structured JSON, layers, captions, overlays, blends, color grade, plus 43 GPU shader effects, AI background removal and gaze correction. No brittle command-line filter chains to assemble by hand.",
        bullets: [
          "Layered composition, captions and blends as JSON",
          "43 GPU shader effects, 4K + HDR",
          "AI background removal and gaze correction",
        ],
      },
      {
        eyebrow: "03 / AGENT NATIVE",
        heading: "Made for agents",
        accent: "and humans alike.",
        body: "An MCP server and clean SDKs mean an AI agent can edit and render video with one call, and the WASM preview matches the final render, so there are no surprises after encode.",
      },
    ],
    comparisonIntro:
      "Capability by capability, FrameLane vs raw FFmpeg, what's built in versus what you assemble yourself.",
    faqs: [
      {
        q: "Does FrameLane use FFmpeg under the hood?",
        a: "Yes, for what FFmpeg is great at: hardware NVDEC decode and hardware encode. Everything in between, compositing, captions, effects and color, runs on a Rust/wgpu GPU compositor. The point is you don't operate that pipeline yourself; you call an API and receive finished video.",
      },
      {
        q: "Why not just run FFmpeg myself?",
        a: "You can, if you want to own filtergraphs, a worker fleet, a job queue, GPU drivers, retries and scaling. FrameLane packages all of that behind one JSON API with GPU shader rendering, an edit timeline, AI steps and webhooks.",
      },
      {
        q: "What formats does FrameLane support?",
        a: "Input: MP4, MOV, WebM, MKV, MXF, ProRes, DNxHR and most codecs FFmpeg understands. Output: H.264, H.265, AV1 and ProRes up to 4K, with HDR. Audio: AAC, Opus, FLAC, WAV.",
      },
      {
        q: "How do I get the finished file?",
        a: "Poll the jobs endpoint, subscribe to a webhook delivered per stage, or use the streaming SDK that emits events over server-sent events.",
      },
    ],
    breadcrumb: breadcrumb("FFmpeg", "compare/ffmpeg"),
    ctaHeading: "Ship video features,",
    ctaAccent: "not an FFmpeg cluster.",
    ctaBody: "A managed GPU rendering API with a JSON timeline and MCP, one call.",
  },
];

export function getComparePage(slug: string): LandingPageContent | undefined {
  return COMPARE_PAGES.find((p) => p.slug === slug);
}
