import type { Metadata } from "next";
import { getTasksList } from "@/lib/api";

export const metadata: Metadata = { title: "Tasks — FrameLane Console" };

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    done: { color: "var(--green)", bg: "rgba(123,224,170,0.1)" },
    processing: { color: "var(--orange)", bg: "rgba(255,122,26,0.1)" },
    queued: { color: "var(--fg-mute)", bg: "rgba(255,255,255,0.04)" },
    failed: { color: "var(--red)", bg: "rgba(255,107,107,0.1)" },
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

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page = "1" } = await searchParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);

  let data = null;
  try {
    data = await getTasksList(pageNum);
  } catch {
    // API unavailable
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1000 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 4 }}>
          Tasks
        </h1>
        <p style={{ fontSize: 13, color: "var(--fg-mute)" }}>
          Individual edit operations and their status.
        </p>
      </div>

      {data?.items?.length > 0 ? (
        <>
          <div style={{ border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 140px 100px 120px 80px",
                gap: 16,
                padding: "10px 20px",
                background: "var(--bg-elev)",
                borderBottom: "1px solid var(--line)",
              }}
            >
              {["Task ID", "Type", "Status", "Created", ""].map((h) => (
                <div
                  key={h}
                  className="mono"
                  style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-dim)" }}
                >
                  {h}
                </div>
              ))}
            </div>

            {data.items.map((task, i) => (
              <div
                key={task.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 140px 100px 120px 80px",
                  gap: 16,
                  alignItems: "center",
                  padding: "14px 20px",
                  borderBottom:
                    i < data.items.length - 1 ? "1px solid var(--line)" : "none",
                  background: "var(--bg-2)",
                }}
              >
                <span className="mono" style={{ fontSize: 12, color: "var(--fg-mute)" }}>
                  {task.id}
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--fg-2)",
                  }}
                >
                  {task.type}
                </span>
                <StatusBadge status={task.status} />
                <span style={{ fontSize: 13, color: "var(--fg-2)" }}>
                  {new Date(task.created_at).toLocaleDateString()}
                </span>
                <span>
                  {task.status === "done" && (
                    <a
                      href={`/api/tasks/${task.id}/download`}
                      style={{ fontSize: 12, color: "var(--orange)" }}
                    >
                      Download
                    </a>
                  )}
                </span>
              </div>
            ))}
          </div>

          {data.total > 20 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <a
                href={`/tasks?page=${pageNum - 1}`}
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
                href={`/tasks?page=${pageNum + 1}`}
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
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "var(--fg-mute)", fontSize: 14, marginBottom: 12 }}>
            No tasks yet.
          </p>
          <a
            href="https://docs.framelane.io"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, color: "var(--orange)" }}
          >
            Read the API docs →
          </a>
        </div>
      )}
    </div>
  );
}
