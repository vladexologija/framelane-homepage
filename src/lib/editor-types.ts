import type { ReactNode } from "react";
import type { Scene } from "@frametake/scene-schema";

/**
 * The host's view of the embeddable editor's public contract.
 *
 * The editor ships as a prebuilt bundle without type declarations, so the console
 * declares the slice of its API it actually drives. `EditorAsset` mirrors the
 * editor's `AssetSummary` — the adapter shape we map workspace uploads onto.
 */
export interface EditorAsset {
  id: string;
  kind: "VIDEO" | "AUDIO" | "IMAGE";
  filename: string;
  status: "PENDING" | "UPLOADED" | "READY" | "FAILED";
  durationSec: number | null;
  width?: number | null;
  height?: number | null;
  fileUrl?: string | null;
}

export type EditorTab = "video" | "audio" | "text" | "image";

/**
 * The editor's public theming contract — pass your own design-token values
 * (including `var(--your-token)` references). Mirrors `FrameTakeTheme` from the
 * editor package (the vendored bundle ships no `.d.ts`). Partial objects override
 * only the fields they set.
 */
export interface FrameTakeTheme {
  background?: string;
  surface?: string;
  surfaceElevated?: string;
  surfaceRaised?: string;
  text?: string;
  textMuted?: string;
  textFaint?: string;
  onAccent?: string;
  accent?: string;
  accentHover?: string;
  accentDim?: string;
  accentBlue?: string;
  success?: string;
  danger?: string;
  border?: string;
  borderMuted?: string;
  borderStrong?: string;
  playhead?: string;
  clipBg?: string;
  clipTextBg?: string;
  clipTextFg?: string;
  clipAudioBg?: string;
  clipAudioFg?: string;
  clipImageBg?: string;
  clipImageFg?: string;
  fontSans?: string;
  fontMono?: string;
  radiusSm?: string;
  radiusMd?: string;
  radiusLg?: string;
  shadow1?: string;
  shadow2?: string;
  scrim?: string;
}

export interface EditorMedia {
  assets?: EditorAsset[];
  onUpload?: (file: File) => Promise<EditorAsset>;
}

export interface FrameTakeEditorProps {
  initialScene?: Scene;
  scene?: Scene;
  onSceneChange?: (scene: Scene) => void;
  onExport?: (scene: Scene) => void;
  media?: EditorMedia;
  features?: {
    topbar?: boolean | { history?: boolean; export?: boolean };
    toolbar?: boolean | { tabs?: EditorTab[] };
    timeline?: boolean;
    inspector?: boolean;
  };
  renderer?: "wasm-gl" | "wasm-gpu";
  theme?: "dark" | "light" | FrameTakeTheme;
  onSeePlans?: () => void;
  /** Topbar title (defaults to "FrameTake"). */
  brand?: ReactNode;
  /** Extra topbar-right content, e.g. a Render button. */
  topbarExtras?: ReactNode;
  /** Always-visible panel atop the right column, e.g. a render-request card. */
  asideHeader?: ReactNode;
  /** Disabled "coming soon" insert tabs shown beside the built-in toolbar tabs. */
  comingSoonTabs?: { label: string; icon?: ReactNode }[];
  className?: string;
}
