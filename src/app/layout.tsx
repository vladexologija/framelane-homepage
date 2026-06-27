import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { PostHogProvider } from "@/components/posthog-provider";
import {
  SITE_URL,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  OG_IMAGE,
  organizationLd,
} from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: "%s | FrameLane" },
  description: DEFAULT_DESCRIPTION,
  applicationName: "FrameLane",
  authors: [{ name: "ITIS, Ltd." }],
  creator: "ITIS, Ltd.",
  publisher: "ITIS, Ltd.",
  category: "technology",
  keywords: [
    "video editing API",
    "video rendering API",
    "video API for AI agents",
    "Remotion alternative",
    "programmatic video",
    "GPU video rendering",
    "MCP video",
    "AI video editing",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "FrameLane",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <body>
        <JsonLd data={[organizationLd()]} />
        <ClerkProvider>
          <PostHogProvider>{children}</PostHogProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
