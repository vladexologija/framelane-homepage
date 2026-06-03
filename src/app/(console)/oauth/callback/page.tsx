import { Suspense } from "react";
import { CallbackHandler } from "./callback-handler";

export default function OAuthCallbackPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Suspense fallback={<CallbackSpinner />}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}

function CallbackSpinner() {
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
      <p style={{ fontSize: 14, color: "var(--fg-2)" }}>Signing you in…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
