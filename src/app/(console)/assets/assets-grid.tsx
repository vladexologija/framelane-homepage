"use client";

import { useMemo, useRef, useState } from "react";
import {
  AudioLines,
  Pause,
  Play,
  Search,
} from "lucide-react";
// Type-only import — erased at compile time, so the `server-only` guard in
// `@/lib/api` never reaches the client bundle.
import type { WorkspaceAsset } from "@/lib/api";
import {
  filenameOf,
  formatDate,
  formatDuration,
  formatResolution,
} from "@/lib/assets";

type SortKey = "newest" | "oldest" | "name";

const KIND_STYLE: Record<string, { color: string; bg: string }> = {
  video: { color: "var(--orange)", bg: "var(--orange-soft)" },
  audio: { color: "var(--green)", bg: "rgba(123,224,170,0.1)" },
};

const kindStyle = (kind: string) =>
  KIND_STYLE[kind] ?? { color: "var(--fg-mute)", bg: "rgba(255,255,255,0.05)" };

export function AssetsGrid({ assets }: { assets: WorkspaceAsset[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | "video" | "audio">("all");
  const [sort, setSort] = useState<SortKey>("newest");

  // Only offer the kind filter when the library actually mixes kinds.
  const hasVideo = assets.some((a) => a.kind === "video");
  const hasAudio = assets.some((a) => a.kind === "audio");
  const showKindFilter = hasVideo && hasAudio;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = assets.filter((a) => {
      if (kind !== "all" && a.kind !== kind) return false;
      if (!q) return true;
      return (
        filenameOf(a.source_url).toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    });
    result.sort((a, b) => {
      if (sort === "name") {
        return filenameOf(a.source_url).localeCompare(filenameOf(b.source_url));
      }
      const at = new Date(a.created_at).getTime();
      const bt = new Date(b.created_at).getTime();
      return sort === "oldest" ? at - bt : bt - at;
    });
    return result;
  }, [assets, query, kind, sort]);

  const filtering = query.trim() !== "" || kind !== "all";

  return (
    <div>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 200 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--fg-dim)",
              pointerEvents: "none",
            }}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or ID"
            aria-label="Search assets"
            style={{
              width: "100%",
              height: 36,
              padding: "0 12px 0 34px",
              fontSize: 13,
              color: "var(--fg)",
              background: "var(--bg-elev)",
              border: "1px solid var(--line)",
              borderRadius: 4,
            }}
          />
        </div>

        {showKindFilter && (
          <Segmented
            value={kind}
            onChange={setKind}
            options={[
              { value: "all", label: "All" },
              { value: "video", label: "Video" },
              { value: "audio", label: "Audio" },
            ]}
          />
        )}

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort assets"
          style={{
            height: 36,
            padding: "0 10px",
            fontSize: 13,
            color: "var(--fg-2)",
            background: "var(--bg-elev)",
            border: "1px solid var(--line)",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name (A–Z)</option>
        </select>

        <span
          className="mono"
          style={{
            fontSize: 12,
            color: "var(--fg-mute)",
            marginLeft: "auto",
            whiteSpace: "nowrap",
          }}
        >
          {filtering
            ? `${filtered.length} of ${assets.length}`
            : `${assets.length} ${assets.length === 1 ? "asset" : "assets"}`}
        </span>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <ul
          aria-label="Assets"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(248px, 1fr))",
            gap: 16,
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {filtered.map((asset) => (
            <li key={asset.id}>
              <AssetCard asset={asset} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "var(--fg-mute)", fontSize: 14, marginBottom: 12 }}>
            No assets match your filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setKind("all");
            }}
            style={{ fontSize: 13, color: "var(--orange)" }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function AssetCard({ asset }: { asset: WorkspaceAsset }) {
  const name = filenameOf(asset.source_url);
  const badge = kindStyle(asset.kind);
  const duration = formatDuration(asset.duration);
  const meta =
    asset.kind === "video"
      ? formatResolution(asset.width, asset.height)
      : "Audio";
  const createdLabel = formatDate(asset.created_at);

  return (
    <div
      className="card"
      style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* Media preview */}
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 9",
          background: "var(--bg)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        {asset.kind === "audio" ? (
          <AudioPreview src={asset.source_url} title={name} />
        ) : (
          <VideoPreview src={asset.source_url} title={name} />
        )}

        {/* Kind badge */}
        <span
          className="mono"
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            padding: "3px 7px",
            borderRadius: 3,
            fontSize: 10,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: badge.color,
            background: badge.bg,
            backdropFilter: "blur(4px)",
          }}
        >
          {asset.kind}
        </span>

        {/* Duration overlay */}
        {duration !== "—" && (
          <span
            className="mono"
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              padding: "2px 6px",
              borderRadius: 3,
              fontSize: 10,
              color: "var(--fg)",
              background: "rgba(0,0,0,0.6)",
            }}
          >
            {duration}
          </span>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flex: 1,
        }}
      >
        <div
          title={name}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--fg)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </div>
        <div
          className="mono"
          style={{ fontSize: 11, color: "var(--fg-mute)" }}
        >
          {meta} · {createdLabel}
        </div>
      </div>
    </div>
  );
}

function VideoPreview({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);

  const play = () => {
    setHovered(true);
    ref.current?.play().catch(() => {
      /* autoplay can be rejected; the still frame is a fine fallback */
    });
  };
  const stop = () => {
    setHovered(false);
    const el = ref.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  };

  return (
    <a
      href={src}
      target="_blank"
      rel="noreferrer"
      title={`Open ${title}`}
      aria-label={`Open ${title} in new tab`}
      onMouseEnter={play}
      onMouseLeave={stop}
      onFocus={play}
      onBlur={stop}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <video
        ref={ref}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      {!hovered && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(10,14,31,0.25)",
          }}
        >
          <Play size={26} style={{ color: "rgba(255,255,255,0.85)" }} />
        </span>
      )}
    </a>
  );
}

function AudioPreview({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={playing ? `Pause ${title}` : `Play ${title}`}
      aria-label={playing ? `Pause ${title}` : `Play ${title}`}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 50% 40%, rgba(123,224,170,0.10), transparent 70%)",
      }}
    >
      <audio
        ref={ref}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      {playing ? (
        <Pause size={26} style={{ color: "var(--green)" }} />
      ) : (
        <AudioLines size={26} style={{ color: "var(--green)" }} />
      )}
    </button>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Filter by kind"
      style={{
        display: "inline-flex",
        padding: 2,
        gap: 2,
        background: "var(--bg-2)",
        border: "1px solid var(--line)",
        borderRadius: 5,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            style={{
              height: 28,
              padding: "0 12px",
              borderRadius: 3,
              fontSize: 12,
              fontWeight: 500,
              color: active ? "var(--fg)" : "var(--fg-mute)",
              background: active ? "rgba(255,255,255,0.07)" : "transparent",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
