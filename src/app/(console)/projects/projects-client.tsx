"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clapperboard, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import type { Project } from "@/lib/api";
import { createProjectAction, deleteProjectAction } from "./actions";
import { randomProjectName } from "./random-name";

export function ProjectsClient({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [creating, startCreate] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const onNew = () =>
    startCreate(async () => {
      const outcome = await createProjectAction(randomProjectName());
      if (outcome.ok) router.push(`/projects/${outcome.id}`);
      else window.alert(outcome.message);
    });

  const onDelete = (id: string, name: string) => {
    if (!window.confirm(`Delete “${name}”? This can't be undone.`)) return;
    setDeletingId(id);
    void (async () => {
      const outcome = await deleteProjectAction(id);
      if (outcome.ok) router.refresh();
      else window.alert(outcome.message);
      setDeletingId(null);
    })();
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1000 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 4 }}>
            Projects
          </h1>
          <p style={{ fontSize: 13, color: "var(--fg-mute)" }}>
            Edit a composition, preview it, and render when it&apos;s valid.
          </p>
        </div>
        <button
          type="button"
          onClick={onNew}
          disabled={creating}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            cursor: creating ? "wait" : "pointer",
            background: "var(--orange)",
            color: "#0a0e1f",
            flexShrink: 0,
          }}
        >
          {creating ? <Loader2 size={14} className="spin" aria-hidden /> : <Plus size={14} aria-hidden />}
          New project
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {/* Sample: a non-persisted project seeded with the built-in default scene. */}
        <Link
          href="/projects/sample"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "18px 18px 16px",
            borderRadius: 10,
            border: "1px dashed var(--line-strong)",
            background: "rgba(255,122,26,0.04)",
            textDecoration: "none",
            minHeight: 132,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              color: "var(--fg)",
            }}
          >
            <Sparkles size={15} style={{ color: "var(--orange)" }} aria-hidden />
            Sample project
          </span>
          <p style={{ fontSize: 12, color: "var(--fg-mute)", lineHeight: 1.5, margin: 0 }}>
            A ready-made scene to explore the editor. Opens with the default
            composition; renders without saving.
          </p>
        </Link>

        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            deleting={deletingId === p.id}
            onDelete={() => onDelete(p.id, p.name)}
          />
        ))}
      </div>

      {projects.length === 0 && (
        <p style={{ marginTop: 24, fontSize: 13, color: "var(--fg-mute)" }}>
          No projects yet. Create your first project, or open the sample to try the editor.
        </p>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  deleting,
  onDelete,
}: {
  project: Project;
  deleting: boolean;
  onDelete: () => void;
}) {
  const s = project.summary;
  const dims = s.width && s.height ? `${s.width} × ${s.height}` : "auto size";
  const dur = s.duration != null ? `${s.duration.toFixed(1)}s` : "—";

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 10,
        border: "1px solid var(--line)",
        background: "var(--bg-2)",
        minHeight: 132,
      }}
    >
      <Link
        href={`/projects/${project.id}`}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "18px 18px 16px",
          textDecoration: "none",
          height: "100%",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            color: "var(--fg)",
            paddingRight: 24,
          }}
        >
          <Clapperboard size={15} style={{ color: "var(--fg-dim)", flexShrink: 0 }} aria-hidden />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {project.name}
          </span>
        </span>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Chip>{dims}</Chip>
          <Chip>{dur}</Chip>
          <Chip>{`${s.element_count} element${s.element_count === 1 ? "" : "s"}`}</Chip>
        </div>

        <span style={{ marginTop: "auto", fontSize: 11, color: "var(--fg-dim)" }}>
          v{project.version} · {new Date(project.updated_at).toLocaleDateString()}
        </span>
      </Link>

      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        aria-label={`Delete ${project.name}`}
        title="Delete"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 26,
          height: 26,
          borderRadius: 6,
          border: "1px solid transparent",
          background: "transparent",
          color: "var(--fg-mute)",
          cursor: deleting ? "wait" : "pointer",
        }}
      >
        {deleting ? <Loader2 size={13} className="spin" aria-hidden /> : <Trash2 size={13} aria-hidden />}
      </button>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="mono"
      style={{
        padding: "3px 8px",
        borderRadius: 6,
        border: "1px solid var(--line)",
        background: "var(--bg-elev)",
        fontSize: 11,
        color: "var(--fg-2)",
      }}
    >
      {children}
    </span>
  );
}
