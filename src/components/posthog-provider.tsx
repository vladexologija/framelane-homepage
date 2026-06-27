"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

const POSTHOG_ENABLED = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

function PostHogIdentify() {
  const { isLoaded, isSignedIn, user } = useUser();
  const identifiedId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      if (identifiedId.current !== user.id) {
        posthog.identify(user.id, {
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName ?? undefined,
          created_at: user.createdAt?.toISOString(),
        });
        identifiedId.current = user.id; // identify once per user, not per render
      }
    } else if (identifiedId.current !== null) {
      posthog.reset(); // signed-out transition → clear identity
      identifiedId.current = null;
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!POSTHOG_ENABLED) return <>{children}</>;
  return (
    <PHProvider client={posthog}>
      <PostHogIdentify />
      {children}
    </PHProvider>
  );
}
