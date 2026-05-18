import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const eurostile = localFont({
  src: "../../public/eurostile-bold-extended.otf",
  variable: "--font-eurostile",
  display: "swap",
  weight: "800",
  style: "normal",
});

export const metadata: Metadata = {
  title: "FrameLane — Video Editing API for AI Agents",
  description:
    "FrameLane gives AI agents their own video production pipeline. Ingest assets, define edits, render at scale — all via API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${eurostile.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-background sm:p-4 md:p-6 lg:px-8">
        <div className="relative flex flex-1 flex-col sm:border sm:border-muted-foreground/20">
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
