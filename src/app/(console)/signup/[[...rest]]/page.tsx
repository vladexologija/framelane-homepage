import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";

export const metadata: Metadata = {
  title: "Sign up — FrameLane",
  description: "Create your FrameLane account to start building with the video editing API.",
};

export default function SignupPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px var(--gutter)",
      }}
    >
      <SignIn
        forceRedirectUrl="/oauth/callback"
        appearance={{
          theme: dark,
          variables: {
            colorBackground: "#0E1226",
            colorPrimary: "#FF7A1A",
            borderRadius: "6px",
            fontFamily: "'Geist', system-ui, sans-serif",
            fontSize: "15px",
          },
          elements: {
            card: {
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "none",
            },
            formButtonPrimary: { fontWeight: "600" },
            internal__developmentModeNotice: { display: "none" },
          },
        }}
      />
    </div>
  );
}
