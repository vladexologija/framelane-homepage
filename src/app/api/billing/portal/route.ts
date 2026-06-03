import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.framelane.io";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("fl_api_key")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/v1/billing/portal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to create billing portal session" },
        { status: res.status }
      );
    }

    const data = await res.json() as { url: string };
    return NextResponse.json({ url: data.url });
  } catch {
    return NextResponse.json({ error: "Service unavailable" }, { status: 502 });
  }
}
