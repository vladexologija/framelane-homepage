"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function CallbackHandler() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.replace("/signup");
      return;
    }

    async function sync() {
      try {
        const token = await getToken();
        const res = await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerk_token: token }),
        });

        const data = await res.json() as {
          workspace?: object;
          is_new?: boolean;
          api_key?: { key: string; [k: string]: unknown };
          error?: string;
        };

        if (!res.ok) {
          setError(data.error ?? "Setup failed. Please try again.");
          return;
        }

        // Store the raw key string for the one-time banner on the dashboard
        if (data.is_new && data.api_key?.key) {
          sessionStorage.setItem("fl_pending_api_key", data.api_key.key);
        }

        router.replace("/dashboard");
      } catch {
        setError("Something went wrong. Please try again.");
      }
    }

    sync();
  }, [isLoaded, isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255,107,107,0.12)",
            border: "1px solid rgba(255,107,107,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 18,
          }}
        >
          ✕
        </div>
        <p style={{ fontSize: 15, color: "var(--fg)", marginBottom: 8 }}>
          Setup failed
        </p>
        <p style={{ fontSize: 13, color: "var(--fg-2)", marginBottom: 24, lineHeight: 1.5 }}>
          {error}
        </p>
        <a
          href="/signup"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            background: "var(--orange)",
            color: "#1a0e00",
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Try again
        </a>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: 32,
          height: 32,
          border: "2px solid var(--line-strong)",
          borderTopColor: "var(--orange)",
          borderRadius: "50%",
          margin: "0 auto 16px",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ fontSize: 14, color: "var(--fg-2)" }}>Setting up your workspace…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
