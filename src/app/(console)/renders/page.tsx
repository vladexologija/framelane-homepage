import type { Metadata } from "next";
import { getRenders } from "@/lib/api";
import { NoRenders } from "@/components/no-renders";
import { RenderActions } from "./render-actions";

export const metadata: Metadata = { title: "Renders — FrameLane Console" };

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
        padding: "3px 8px",
        borderRadius: 3,
        fontSize: 10,
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

export default async function RendersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page = "1" } = await searchParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);

  let data = null;
  try {
    data = await getRenders(pageNum);
  } catch {
    // API unavailable
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1000 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 4 }}>
          Renders
        </h1>
        <p style={{ fontSize: 13, color: "var(--fg-mute)" }}>
          All render jobs and their output artifacts.
        </p>
        <div
          style={{
            padding: "20px 24px",
            background: "rgba(255,122,26,0.04)",
            border: "1px solid rgba(255,122,26,0.15)",
            borderRadius: 6,
            marginTop: 20,
          }}
        >
        <p style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.6 }}>            
            You&apos;re on the free plan. Renders are processed in a shared queue with all free users. &nbsp;
            <a href="/pricing" style={{ color: "var(--orange)" }}>
              Upgrade →
            </a>
          </p>
        </div>
      </div>

      {data && data.items.length > 0 ? (
        <>
          <div style={{ border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 100px 110px 110px 130px",
                gap: 16,
                padding: "10px 20px",
                background: "var(--bg-elev)",
                borderBottom: "1px solid var(--line)",
              }}
            >
              {["Render ID", "Status", "Duration", "Created", ""].map((h) => (
                <div
                  key={h}
                  className="mono"
                  style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-dim)" }}
                >
                  {h}
                </div>
              ))}
            </div>

            {data.items.map((render, i) => (
              <div
                key={render.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 100px 110px 110px 130px",
                  gap: 16,
                  alignItems: "center",
                  padding: "14px 20px",
                  borderBottom:
                    i < data.items.length - 1 ? "1px solid var(--line)" : "none",
                  background: "var(--bg-2)",
                }}
              >
                <span className="mono" style={{ fontSize: 12, color: "var(--fg-mute)" }}>
                  {render.id}
                </span>
                <StatusBadge status={render.status} />
                <span style={{ fontSize: 13, color: "var(--fg-2)" }}>
                  {render.output?.duration != null
                    ? `${render.output.duration.toFixed(1)}s`
                    : render.duration_ms
                      ? `${(render.duration_ms / 1000).toFixed(1)}s`
                      : "—"}
                </span>
                <span style={{ fontSize: 13, color: "var(--fg-2)" }}>
                  {new Date(render.created_at).toLocaleDateString()}
                </span>
                <span>
                  {(render.status === "completed" || render.status === "done") &&
                    render.output?.url && <RenderActions url={render.output.url} />}
                </span>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.total > 20 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <a
                href={`/renders?page=${pageNum - 1}`}
                style={{
                  fontSize: 13,
                  color: pageNum > 1 ? "var(--orange)" : "var(--fg-dim)",
                  pointerEvents: pageNum > 1 ? "auto" : "none",
                }}
              >
                ← Previous
              </a>
              <span className="mono" style={{ fontSize: 12, color: "var(--fg-mute)" }}>
                Page {pageNum} of {Math.ceil(data.total / 20)}
              </span>
              <a
                href={`/renders?page=${pageNum + 1}`}
                style={{
                  fontSize: 13,
                  color: pageNum < Math.ceil(data.total / 20) ? "var(--orange)" : "var(--fg-dim)",
                  pointerEvents: pageNum < Math.ceil(data.total / 20) ? "auto" : "none",
                }}
              >
                Next →
              </a>
            </div>
          )}
        </>
      ) : (
        <NoRenders />
      )}
    </div>
  );
}
