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

  // Sync only ensures a workspace exists for this Clerk user (and returns the
  // one-time `api_key` for the dashboard banner on first signup). Console API
  // calls authenticate with the Clerk session token directly (see lib/api.ts),
  // so there is no cookie to set here.
  return NextResponse.json(data);
}
