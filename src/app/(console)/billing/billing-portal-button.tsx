"use client";

import { useState } from "react";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      if (!res.ok) throw new Error("Failed to open portal");
      const data = await res.json() as { url: string };
      window.location.href = data.url;
    } catch {
      setError("Could not open billing portal. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={openPortal}
        disabled={loading}
        className="btn btn-ghost"
      >
        {loading ? "Opening…" : "Manage billing →"}
      </button>
      {error && (
        <p style={{ fontSize: 12, color: "var(--red)", marginTop: 8 }}>{error}</p>
      )}
    </div>
  );
}
