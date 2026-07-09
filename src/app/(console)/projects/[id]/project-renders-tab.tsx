"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import type { Render } from "@/lib/api";
import { RenderActions } from "@/components/render-actions";
import { getRendersAction } from "../actions";

const ACTIVE = new Set(["queued", "processing", "ingesting"]);

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    completed: { color: "var(--green)", bg: "rgba(123,224,170,0.1)" },
    done: { color: "var(--green)", bg: "rgba(123,224,170,0.1)" },
    processing: { color: "var(--orange)", bg: "rgba(255,122,26,0.1)" },
    ingesting: { color: "var(--orange)", bg: "rgba(255,122,26,0.1)" },
    queued: { color: "var(--fg-mute)", bg: "rgba(255,255,255,0.04)" },
    failed: { color: "var(--red)", bg: "rgba(255,107,107,0.1)" },
    cancelled: { color: "var(--fg-mute)", bg: "rgba(255,255,255,0.04)" },
  };
  const style = map[status] ?? { color: "var(--fg-mute)", bg: "rgba(255,255,255,0.04)" };
  return (
    <span
      className="mono"
      style={{
        display: "inline-block",
        padding: "2px 7px",
        borderRadius: 3,
        fontSize: 9.5,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: style.color,
        background: style.bg,
      }}
    >
      {status}
    </span>
  );
}

/**
 * The editor's "Renders" tab — the workspace render jobs that used to live on the
 * standalone /renders page, rehomed beside the composition. Fetches through a
 * server action (apiFetch is server-only) and polls while any job is still active.
 * `refreshSignal` bumps after the editor submits a new render to pull it in.
 */
export function ProjectRendersTab({ refreshSignal }: { refreshSignal: number }) {
  const [items, setItems] = useState<Render[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Bumped after every fetch (success or failure) so the poll effect re-arms even
  // when a transient error leaves `items` unchanged (otherwise polling would die).
  const [pollTick, setPollTick] = useState(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Core fetch: sets state only after the await, so it's safe to call from an
  // effect (no synchronous setState in the effect body). No spinner toggle here
  // so background polls stay silent.
  const fetchRenders = useCallback(async () => {
    const outcome = await getRendersAction(1);
    if (outcome.ok) {
      setItems(outcome.items);
      setError(null);
    } else {
      setError(outcome.message);
    }
    setPollTick((t) => t + 1);
  }, []);

  // The manual refresh button drives the spinner; setState here is fine because
  // it runs from an event handler, not an effect.
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await fetchRenders();
    } finally {
      setLoading(false);
    }
  }, [fetchRenders]);

  // Fetch on mount + whenever the editor signals a new render. fetchRenders
  // awaits before any setState, so this isn't a synchronous effect setState; the
  // lint rule can't see across the await.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchRenders();
  }, [fetchRenders, refreshSignal]);

  // Poll while any job is still active, so a queued render surfaces its result
  // without a manual refresh. Re-armed after each fetch via pollTick (so a
  // transient poll error doesn't stop it), and cleared once everything is terminal.
  useEffect(() => {
    if (!items || !items.some((r) => ACTIVE.has(r.status))) return;
    pollTimer.current = setTimeout(() => void fetchRenders(), 4000);
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [items, pollTick, fetchRenders]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 14px 10px",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>Renders</span>
        <button
          type="button"
          onClick={() => void refresh()}
          aria-label="Refresh renders"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: 8,
            border: "1px solid var(--line-strong)",
            background: "var(--bg-elev)",
            color: "var(--fg)",
            cursor: "pointer",
          }}
        >
          {loading ? (
            <Loader2 size={14} className="spin" aria-hidden />
          ) : (
            <RefreshCw size={13} aria-hidden />
          )}
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "0 14px 14px" }}>
        {items && items.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((r) => (
              <div
                key={r.id}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  background: "var(--bg-elev)",
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "var(--fg-mute)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.id}
                  </span>
                  <StatusBadge status={r.status} />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 11, color: "var(--fg-dim)" }}>
                    {r.output?.duration != null
                      ? `${r.output.duration.toFixed(1)}s`
                      : r.duration_ms
                        ? `${(r.duration_ms / 1000).toFixed(1)}s`
                        : "—"}
                    {" · "}
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                  {(r.status === "completed" || r.status === "done") && r.output?.url && (
                    <RenderActions url={r.output.url} />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : items ? (
          <p style={{ fontSize: 13, color: "var(--fg-mute)", paddingTop: 8 }}>
            No renders yet.
          </p>
        ) : error ? (
          <p style={{ fontSize: 12, color: "var(--red)", paddingTop: 8 }}>{error}</p>
        ) : (
          <p style={{ fontSize: 13, color: "var(--fg-dim)", paddingTop: 8 }}>Loading…</p>
        )}
      </div>
    </div>
  );
}
