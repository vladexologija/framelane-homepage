import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.framelane.io";

export async function POST(request: NextRequest) {
  let body: { clerk_token: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { clerk_token } = body;
  if (!clerk_token) {
    return NextResponse.json({ error: "Missing clerk_token" }, { status: 400 });
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${API_URL}/v1/auth/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clerk_token }),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach authentication service" },
      { status: 502 }
    );
  }

  if (!apiRes.ok) {
    const raw = await apiRes.text().catch(() => "");
    let message = "Sync failed";
    try {
      const parsed = JSON.parse(raw) as { message?: string; error?: string };
      message = parsed.message ?? parsed.error ?? message;
    } catch { /* raw text response */ }
    console.error(`[auth/sync] backend ${apiRes.status}:`, raw);
    return NextResponse.json(
      { error: `${apiRes.status}: ${message}` },
      { status: apiRes.status }
    );
  }

  const data = await apiRes.json() as {
    workspace: object;
    is_new: boolean;
    api_key?: { key: string; [k: string]: unknown };
  };

  // On first signup, persist the FrameLane API key in a server-side cookie.
  // All subsequent console API calls use this key as Bearer, not the Clerk token.
  if (data.is_new && data.api_key?.key) {
    const cookieStore = await cookies();
    cookieStore.set("fl_api_key", data.api_key.key, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return NextResponse.json(data);
}
