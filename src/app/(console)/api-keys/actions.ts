"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

interface CreateKeyState {
  key: string | null;
  name: string;
  error: string | null;
}

export async function createApiKey(
  _prevState: CreateKeyState,
  formData: FormData
): Promise<CreateKeyState> {
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) {
    return { key: null, name: "", error: "Key name is required." };
  }
  try {
    const data = await apiFetch<{ key: string; name: string }>("/v1/api-keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    revalidatePath("/api-keys");
    return { key: data.key, name: data.name, error: null };
  } catch {
    return { key: null, name, error: "Failed to create API key. Please try again." };
  }
}

export async function revokeApiKey(id: string) {
  try {
    await apiFetch(`/v1/api-keys/${id}`, { method: "DELETE" });
  } catch {
    // Silently fail — UI will refresh and show current state
  }
  revalidatePath("/api-keys");
}
