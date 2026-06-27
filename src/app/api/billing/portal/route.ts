import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.framelane.io";

export async function POST() {
  const { getToken } = await auth();
  const token = await getToken();

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
