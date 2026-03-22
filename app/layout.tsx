import type { Metadata } from "next";
import Link from "next/link";

import "@/app/globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "PathPilot | AI Decision & Goal Roadmap Platform",
  description:
    "Simulate career decisions, generate AI roadmaps, and track focus sessions with a polished SaaS dashboard."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen font-sans">
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
          <div className="pointer-events-none absolute inset-0 bg-hero-grid bg-[size:120px_120px] opacity-[0.18]" />
          <div className="pointer-events-none absolute inset-0 bg-hero-radial opacity-90" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/5 to-transparent" />
          <Navbar />
          <main className="relative z-10 flex-1">{children}</main>
          <footer className="relative z-10 border-t border-white/10 bg-[rgba(14,11,8,0.62)] backdrop-blur-xl">
            <div className="container flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">PathPilot</p>
                <p className="text-xs text-muted-foreground">AI decision intelligence for focused execution.</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <Link href="/explore" className="transition hover:text-foreground">
                  Explore
                </Link>
                <Link href="/simulator" className="transition hover:text-foreground">
                  Simulator
                </Link>
                <Link href="/roadmap" className="transition hover:text-foreground">
                  Roadmaps
                </Link>
                <Link href="/dashboard" className="transition hover:text-foreground">
                  Dashboard
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
