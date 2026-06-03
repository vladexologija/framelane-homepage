"use server";

import { apiFetch } from "@/lib/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

interface UpdateWorkspaceState {
  success: boolean;
  error: string | null;
}

export async function updateWorkspaceName(
  _prevState: UpdateWorkspaceState,
  formData: FormData
): Promise<UpdateWorkspaceState> {
  const name = (formData.get("name") as string | null)?.trim();
  if (!name || name.length < 2) {
    return { success: false, error: "Workspace name must be at least 2 characters." };
  }
  try {
    await apiFetch("/v1/workspace", {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    revalidatePath("/settings");
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Failed to update workspace name. Please try again." };
  }
}

export async function deleteWorkspace() {
  try {
    await apiFetch("/v1/workspace", { method: "DELETE" });
  } catch {
    // continue to sign out even if API call fails
  }
  const cookieStore = await cookies();
  cookieStore.delete("fl_api_key");
  redirect("/signup");
}
