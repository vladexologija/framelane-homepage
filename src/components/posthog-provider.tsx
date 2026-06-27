"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const initialized = useRef(false);
  const identifiedId = useRef<string | null>(null);

  // Initialize AFTER hydration (in an effect), never before it. Initializing
  // earlier (e.g. from instrumentation-client) makes posthog.init inject its
  // loader <script> into the DOM before React hydrates, which collides with the
  // server-rendered markup (here the JsonLd <script> at the top of <body>) and
  // throws a hydration mismatch.
  useEffect(() => {
    if (!POSTHOG_KEY || initialized.current) return;
    initialized.current = true;
    posthog.init(POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "/ingest",
      ui_host: "https://us.posthog.com",
      defaults: "2025-05-24",
      disable_session_recording: true, // OFF at launch; console surfaces show secrets.
    });
  }, []);

  // Identify is defined after the init effect, so on each commit it runs after
  // init: the first real identify always lands on an initialized client.
  useEffect(() => {
    if (!POSTHOG_KEY || !isLoaded) return;

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
      posthog.reset(); // signed-out transition: clear identity
      identifiedId.current = null;
    }
  }, [isLoaded, isSignedIn, user]);

  if (!POSTHOG_KEY) return <>{children}</>;

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
