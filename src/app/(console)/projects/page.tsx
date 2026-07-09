import type { Metadata } from "next";
import { getProjects, type Project } from "@/lib/api";
import { ProjectsClient } from "./projects-client";

export const metadata: Metadata = { title: "Projects — FrameLane Console" };

// Reads the signed-in user's Clerk token (via getProjects) — render per-request.
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let projects: Project[] = [];
  try {
    projects = await getProjects();
  } catch {
    // API unavailable — render the empty/sample state.
  }

  return <ProjectsClient projects={projects} />;
}
